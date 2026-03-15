import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search, Droplets, Sun, Sparkles, Loader2, AlertTriangle, X, Plus, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PlantSpeciesCard from '../components/database/PlantSpeciesCard';
import PlantSpeciesDetail from '../components/database/PlantSpeciesDetail';

const CATEGORIES = ['houseplant', 'succulent', 'herb', 'vegetable', 'fruit', 'flower', 'tree', 'shrub', 'vine', 'fern'];

export default function PlantDatabase() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [selected, setSelected] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const { data: species = [], isLoading } = useQuery({
    queryKey: ['plantSpeciesDB'],
    queryFn: () => base44.entities.PlantSpeciesDB.list('common_name', 200),
  });

  const filtered = species.filter(s => {
    const matchSearch = !search ||
      s.common_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.scientific_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchCat = category === 'all' || s.category === category;
    const matchDiff = difficulty === 'all' || s.difficulty === difficulty;
    return matchSearch && matchCat && matchDiff;
  });

  const handleGenerateBatch = async () => {
    setGenerating(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a comprehensive database of 40 popular garden and houseplants. For each plant, provide accurate botanical information.

Return exactly 40 plants covering a variety of categories: houseplants, succulents, herbs, vegetables, flowers, trees, shrubs, and ferns.

For image_url and thumbnail_url, use the Unsplash Source search URL format using the plant's scientific name or common name as the search query:
- image_url: https://source.unsplash.com/800x600/?[search_query]
- thumbnail_url: https://source.unsplash.com/300x300/?[search_query]

Where [search_query] is the plant's common name with spaces replaced by commas (e.g. "monstera,plant" or "lavender,flower" or "succulent,cactus").

Examples:
- Monstera: https://source.unsplash.com/800x600/?monstera,plant
- Lavender: https://source.unsplash.com/800x600/?lavender,flower
- Rose: https://source.unsplash.com/800x600/?rose,flower
- Basil: https://source.unsplash.com/800x600/?basil,herb
- Cactus: https://source.unsplash.com/800x600/?cactus,succulent
- Fern: https://source.unsplash.com/800x600/?fern,plant
- Sunflower: https://source.unsplash.com/800x600/?sunflower
- Tomato: https://source.unsplash.com/800x600/?tomato,plant

Use the most specific and accurate search term for each plant.`,
      response_json_schema: {
        type: 'object',
        properties: {
          plants: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                common_name: { type: 'string' },
                scientific_name: { type: 'string' },
                family: { type: 'string' },
                category: { type: 'string', enum: ['houseplant', 'succulent', 'herb', 'vegetable', 'fruit', 'flower', 'tree', 'shrub', 'vine', 'fern', 'grass', 'other'] },
                image_url: { type: 'string' },
                thumbnail_url: { type: 'string' },
                description: { type: 'string' },
                native_region: { type: 'string' },
                watering: { type: 'string', enum: ['low', 'moderate', 'high'] },
                light: { type: 'string', enum: ['full_sun', 'partial_sun', 'partial_shade', 'full_shade', 'artificial'] },
                difficulty: { type: 'string', enum: ['easy', 'moderate', 'hard'] },
                toxic_to_pets: { type: 'boolean' },
                tags: { type: 'array', items: { type: 'string' } }
              }
            }
          }
        }
      }
    });
    if (result?.plants?.length) {
      await base44.entities.PlantSpeciesDB.bulkCreate(result.plants);
      queryClient.invalidateQueries({ queryKey: ['plantSpeciesDB'] });
    }
    setGenerating(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1B4332] flex items-center gap-2">
            <BookOpen className="w-6 h-6" /> Plant Picture Database
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {species.length} species · Browse reference photos and care info
          </p>
        </div>
        {user?.role === 'admin' && (
          <Button
            onClick={handleGenerateBatch}
            disabled={generating}
            className="bg-[#1B4332] hover:bg-[#2D6A4F]"
          >
            {generating
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating…</>
              : <><Sparkles className="w-4 h-4 mr-2" /> Generate 40 Species</>
            }
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, species, or tag…"
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full md:w-44"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(c => (
              <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger className="w-full md:w-36"><SelectValue placeholder="Difficulty" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Difficulty</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="moderate">Moderate</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Empty state */}
      {species.length === 0 && !isLoading && user?.role === 'admin' && (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium mb-1">Database is empty</p>
          <p className="text-gray-400 text-sm mb-6">Click "Generate 40 Species" to populate with AI-curated plant data and photos.</p>
          <Button onClick={handleGenerateBatch} disabled={generating} className="bg-[#1B4332] hover:bg-[#2D6A4F]">
            {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            Generate Database
          </Button>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#52796F] animate-spin" />
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {filtered.map(s => (
            <PlantSpeciesCard key={s.id} species={s} onClick={() => setSelected(s)} />
          ))}
        </div>
      )}

      {filtered.length === 0 && species.length > 0 && (
        <div className="text-center py-16 text-gray-400">
          <p>No plants match your search.</p>
        </div>
      )}

      {/* Detail drawer */}
      {selected && (
        <PlantSpeciesDetail species={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}