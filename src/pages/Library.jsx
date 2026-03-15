import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import FeatureGate from '../components/subscription/FeatureGate';
import { Search, Bug, Leaf, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const categoryLabels = {
  pest: { label: 'Pest', color: 'bg-red-100 text-red-700' },
  fungal_disease: { label: 'Fungal Disease', color: 'bg-purple-100 text-purple-700' },
  bacterial_disease: { label: 'Bacterial Disease', color: 'bg-orange-100 text-orange-700' },
  viral_disease: { label: 'Viral Disease', color: 'bg-pink-100 text-pink-700' },
  nutrient_deficiency: { label: 'Nutrient Deficiency', color: 'bg-amber-100 text-amber-700' },
  environmental_stress: { label: 'Environmental', color: 'bg-blue-100 text-blue-700' },
};

function LibraryEntry({ entry }) {
  const [expanded, setExpanded] = useState(false);
  const cat = categoryLabels[entry.category] || { label: entry.category, color: 'bg-gray-100 text-gray-700' };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left p-5 flex items-start gap-4">
        {entry.image_url ? (
          <img src={entry.image_url} alt={entry.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
            <Bug className="w-6 h-6 text-gray-300" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-[#1B4332]">{entry.name}</h3>
            <Badge className={cat.color}>{cat.label}</Badge>
          </div>
          {entry.symptoms?.length > 0 && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{entry.symptoms.join(', ')}</p>
          )}
        </div>
        {expanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-gray-50 pt-4">
          {entry.lifecycle_description && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Lifecycle</p>
              <p className="text-sm text-gray-700">{entry.lifecycle_description}</p>
            </div>
          )}
          {entry.treatment_options?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Treatment Options</p>
              <ul className="space-y-1">
                {entry.treatment_options.map((t, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#52796F] mt-1.5 flex-shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {entry.prevention_methods?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Prevention</p>
              <ul className="space-y-1">
                {entry.prevention_methods.map((p, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Library() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [user, setUser] = useState(null);
  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const { data: entries = [] } = useQuery({
    queryKey: ['pestDiseaseLibrary'],
    queryFn: () => base44.entities.PestDiseaseEntry.list('name', 100),
  });

  const filtered = entries.filter(e => {
    const matchSearch = !search || e.name?.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'all' || e.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <FeatureGate user={user} featureName="Pest & Disease Library">
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1B4332] flex items-center gap-2">
          <Bug className="w-6 h-6" /> Pest & Disease Library
        </h1>
        <p className="text-gray-500 text-sm mt-1">Visual reference for common plant problems</p>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search library..." className="pl-9" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="All Categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(categoryLabels).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map(e => <LibraryEntry key={e.id} entry={e} />)}
        </div>
      ) : (
        <div className="text-center py-16">
          <Bug className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">No entries found. The library will grow as you use the app.</p>
        </div>
      )}
    </div>
    </FeatureGate>
  );
}