import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import HealthScoreBadge from './HealthScoreBadge';
import { cn } from '@/lib/utils';

const categoryEmojis = {
  houseplant: '🪴', succulent: '🌵', herb: '🌿', vegetable: '🥬',
  fruit: '🍎', flower: '🌸', tree: '🌳', shrub: '🌲',
  vine: '🍇', fern: '🌿', grass: '🌾', other: '🌱',
};

export default function PlantCard({ plant }) {
  return (
    <Link
      to={`/PlantProfile?id=${plant.id}`}
      className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
    >
      {/* Image */}
      <div className="aspect-[4/3] bg-gradient-to-br from-[#E8DCC8]/30 to-[#52796F]/10 relative overflow-hidden">
        <img
          src={plant.image_url || `https://source.unsplash.com/400x300/?${encodeURIComponent((plant.species || plant.plant_name) + ',plant')}`}
          alt={plant.plant_name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={e => { e.target.src = `https://source.unsplash.com/400x300/?${encodeURIComponent(plant.plant_category || 'plant')}`; }}
        />
        <div className="absolute top-3 right-3">
          <HealthScoreBadge score={plant.health_score} size="sm" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-[#1B4332] group-hover:text-[#52796F] transition-colors">
              {categoryEmojis[plant.plant_category] || '🌱'} {plant.plant_name}
            </h3>
            {plant.scientific_name && (
              <p className="text-xs text-gray-400 italic mt-0.5">{plant.scientific_name}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
          {plant.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {plant.location}
            </span>
          )}
          {plant.growth_stage && (
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-medium capitalize",
              "bg-[#52796F]/10 text-[#52796F]"
            )}>
              {plant.growth_stage}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}