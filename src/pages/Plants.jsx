import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PlantCard from '../components/plants/PlantCard';
import AddPlantDialog from '../components/plants/AddPlantDialog';
import PullToRefresh from '../components/ui/PullToRefresh';

export default function Plants() {
  const [showAddPlant, setShowAddPlant] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: plants = [], refetch } = useQuery({
    queryKey: ['plants', user?.email],
    queryFn: () => base44.entities.Plant.filter({ created_by: user.email }, '-created_date', 100),
    enabled: !!user?.email,
  });

  const filtered = plants.filter(p => {
    const matchSearch = !search || p.plant_name?.toLowerCase().includes(search.toLowerCase()) || p.species?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'all' || p.plant_category === categoryFilter;
    const matchLocation = locationFilter === 'all' || p.location === locationFilter;
    return matchSearch && matchCategory && matchLocation;
  });

  return (
    <PullToRefresh onRefresh={() => refetch()}>
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1B4332]">My Plants</h1>
          <p className="text-gray-500 text-sm mt-0.5">{plants.length} plant{plants.length !== 1 ? 's' : ''} in your collection</p>
        </div>
        <Button onClick={() => setShowAddPlant(true)} className="bg-[#1B4332] hover:bg-[#2D6A4F]">
          <Plus className="w-4 h-4 mr-2" /> Add Plant
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search plants..." className="pl-9" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-40"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {['houseplant', 'succulent', 'herb', 'vegetable', 'fruit', 'flower', 'tree', 'shrub', 'vine', 'fern'].map(c => (
              <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="w-full md:w-36"><SelectValue placeholder="Location" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            <SelectItem value="indoor">Indoor</SelectItem>
            <SelectItem value="outdoor">Outdoor</SelectItem>
            <SelectItem value="greenhouse">Greenhouse</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Plant Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {filtered.map(plant => <PlantCard key={plant.id} plant={plant} />)}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-400">No plants found</p>
        </div>
      )}

      <AddPlantDialog open={showAddPlant} onOpenChange={setShowAddPlant} onPlantAdded={() => refetch()} plantCount={plants.length} user={user} />
    </div>
    </PullToRefresh>
  );
}