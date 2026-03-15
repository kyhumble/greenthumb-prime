import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import FeatureGate from '../components/subscription/FeatureGate';
import { Search, BookMarked, Loader2, Sun, Droplets, Thermometer, Sprout, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const POPULAR_SEARCHES = [
  'Monstera deliciosa', 'Peace Lily', 'Snake Plant', 'Pothos', 'Fiddle Leaf Fig',
  'Lavender', 'Tomato', 'Orchid', 'Rosemary', 'Aloe Vera',
];

function PlantEncyclopediaCard({ entry }) {
  const [expanded, setExpanded] = useState(false);

  const difficultyColor = {
    easy: 'bg-emerald-100 text-emerald-700',
    moderate: 'bg-amber-100 text-amber-700',
    difficult: 'bg-red-100 text-red-700',
  }[entry.difficulty?.toLowerCase()] || 'bg-gray-100 text-gray-600';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="font-semibold text-[#1B4332]">{entry.common_name}</h3>
            <p className="text-xs text-gray-400 italic">{entry.scientific_name}</p>
          </div>
          {entry.difficulty && (
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 capitalize ${difficultyColor}`}>
              {entry.difficulty}
            </span>
          )}
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{entry.description}</p>

        {/* Quick-glance icons */}
        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          {entry.light && (
            <div className="flex items-center gap-1.5 bg-yellow-50 rounded-lg px-2.5 py-1.5">
              <Sun className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />
              <span className="text-gray-700 truncate">{entry.light}</span>
            </div>
          )}
          {entry.watering && (
            <div className="flex items-center gap-1.5 bg-blue-50 rounded-lg px-2.5 py-1.5">
              <Droplets className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <span className="text-gray-700 truncate">{entry.watering}</span>
            </div>
          )}
          {entry.temperature && (
            <div className="flex items-center gap-1.5 bg-orange-50 rounded-lg px-2.5 py-1.5">
              <Thermometer className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
              <span className="text-gray-700 truncate">{entry.temperature}</span>
            </div>
          )}
          {entry.humidity && (
            <div className="flex items-center gap-1.5 bg-teal-50 rounded-lg px-2.5 py-1.5">
              <Sprout className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
              <span className="text-gray-700 truncate">{entry.humidity}</span>
            </div>
          )}
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-1 text-xs text-[#52796F] hover:underline"
        >
          {expanded ? <><ChevronUp className="w-3.5 h-3.5" /> Less info</> : <><ChevronDown className="w-3.5 h-3.5" /> More info</>}
        </button>

        {expanded && (
          <div className="mt-3 space-y-2 text-xs text-gray-600 border-t border-gray-50 pt-3">
            {entry.soil && <p><span className="font-medium text-gray-700">Soil:</span> {entry.soil}</p>}
            {entry.fertilizing && <p><span className="font-medium text-gray-700">Fertilizing:</span> {entry.fertilizing}</p>}
            {entry.propagation && <p><span className="font-medium text-gray-700">Propagation:</span> {entry.propagation}</p>}
            {entry.common_issues && <p><span className="font-medium text-gray-700">Common issues:</span> {entry.common_issues}</p>}
            {entry.toxicity && (
              <div className="flex items-start gap-1.5 bg-red-50 rounded-lg p-2 mt-2">
                <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-700">{entry.toxicity}</p>
              </div>
            )}
            {entry.fun_fact && (
              <div className="bg-[#52796F]/5 rounded-lg p-2 mt-2">
                <p className="text-[#1B4332] italic">💡 {entry.fun_fact}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Encyclopedia() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (searchQuery) => {
    const q = searchQuery || query;
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    setResults([]);

    const data = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a comprehensive plant encyclopedia. The user searched for: "${q}".
Return 1-6 matching plant species (or varieties) that best match this search. If it's a specific plant name, return detailed info for that plant. If it's a category (e.g., "succulents", "low light plants"), return 4-6 popular examples.
For each plant, provide complete care information.`,
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
                description: { type: 'string' },
                difficulty: { type: 'string', enum: ['Easy', 'Moderate', 'Difficult'] },
                light: { type: 'string' },
                watering: { type: 'string' },
                humidity: { type: 'string' },
                temperature: { type: 'string' },
                soil: { type: 'string' },
                fertilizing: { type: 'string' },
                propagation: { type: 'string' },
                common_issues: { type: 'string' },
                toxicity: { type: 'string' },
                fun_fact: { type: 'string' },
              }
            }
          }
        }
      }
    });

    setResults(data?.plants || []);
    setLoading(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1B4332] flex items-center gap-2">
          <BookMarked className="w-6 h-6" /> Plant Encyclopedia
        </h1>
        <p className="text-gray-500 text-sm mt-1">Search thousands of plant species for care requirements, light needs & more</p>
      </div>

      {/* Search bar */}
      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search by name, type, or care need (e.g. 'low light plants', 'Monstera')"
            className="pl-9"
          />
        </div>
        <Button onClick={() => handleSearch()} disabled={loading || !query.trim()} className="bg-[#1B4332] hover:bg-[#2D6A4F]">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </Button>
      </div>

      {/* Popular searches */}
      {!searched && (
        <div className="mb-8">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Popular searches</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SEARCHES.map(s => (
              <button
                key={s}
                onClick={() => { setQuery(s); handleSearch(s); }}
                className="px-3 py-1.5 bg-white border border-gray-100 rounded-full text-sm text-gray-600 hover:border-[#52796F] hover:text-[#1B4332] transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center py-16 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#52796F]" />
          <p className="text-sm text-gray-400">Searching the plant database…</p>
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((entry, i) => <PlantEncyclopediaCard key={i} entry={entry} />)}
        </div>
      )}

      {/* No results */}
      {!loading && searched && results.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <BookMarked className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No results found. Try a different search term.</p>
        </div>
      )}
    </div>
  );
}