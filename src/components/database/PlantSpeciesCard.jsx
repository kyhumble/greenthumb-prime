import React, { useState } from 'react';
import { Droplets, Sun, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const difficultyColor = { easy: 'bg-emerald-100 text-emerald-700', moderate: 'bg-amber-100 text-amber-700', hard: 'bg-red-100 text-red-700' };
const wateringIcon = { low: '💧', moderate: '💧💧', high: '💧💧💧' };

export default function PlantSpeciesCard({ species, onClick }) {
  const [imgError, setImgError] = useState(false);
  const fallbackUrl = `https://source.unsplash.com/300x300/?${encodeURIComponent(species.common_name + ',plant')}`;

  return (
    <button
      onClick={onClick}
      className="group text-left bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
    >
      <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-[#E8DCC8]/30 to-[#52796F]/10">
        {!imgError ? (
          <img
            src={species.thumbnail_url || species.image_url || fallbackUrl}
            alt={species.common_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🌱</div>
        )}
        {species.toxic_to_pets && (
          <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1" title="Toxic to pets">
            <AlertTriangle className="w-3 h-3" />
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="font-semibold text-[#1B4332] text-sm leading-tight truncate">{species.common_name}</p>
        <p className="text-xs text-gray-400 italic truncate mt-0.5">{species.scientific_name}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500">{wateringIcon[species.watering] || ''}</span>
          {species.difficulty && (
            <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full capitalize', difficultyColor[species.difficulty])}>
              {species.difficulty}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}