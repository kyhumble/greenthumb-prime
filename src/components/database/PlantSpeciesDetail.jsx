import React from 'react';
import { X, Droplets, Sun, Thermometer, MapPin, AlertTriangle, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const wateringLabel = { low: 'Low – drought tolerant', moderate: 'Moderate – regular watering', high: 'High – keep moist' };
const lightLabel = { full_sun: 'Full Sun (6+ hrs)', partial_sun: 'Partial Sun (3–6 hrs)', partial_shade: 'Partial Shade', full_shade: 'Full Shade', artificial: 'Artificial / Indirect' };
const difficultyColor = { easy: 'bg-emerald-100 text-emerald-700', moderate: 'bg-amber-100 text-amber-700', hard: 'bg-red-100 text-red-700' };

export default function PlantSpeciesDetail({ species, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-t-3xl md:rounded-2xl w-full md:max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Image */}
        <div className="relative aspect-video bg-gradient-to-br from-[#E8DCC8]/30 to-[#52796F]/10">
          {species.image_url ? (
            <img src={species.image_url} alt={species.common_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">🌱</div>
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          {species.toxic_to_pets && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-red-500 text-white text-xs font-medium px-3 py-1 rounded-full">
              <AlertTriangle className="w-3 h-3" /> Toxic to Pets
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-[#1B4332]">{species.common_name}</h2>
                <p className="text-sm text-gray-400 italic">{species.scientific_name}</p>
              </div>
              {species.difficulty && (
                <span className={cn('text-xs font-medium px-2 py-1 rounded-full capitalize flex-shrink-0', difficultyColor[species.difficulty])}>
                  {species.difficulty}
                </span>
              )}
            </div>
            {species.family && <p className="text-xs text-gray-400 mt-1">Family: <span className="text-gray-600">{species.family}</span></p>}
          </div>

          {species.description && (
            <p className="text-sm text-gray-700 leading-relaxed">{species.description}</p>
          )}

          {/* Care Info */}
          <div className="grid grid-cols-2 gap-3">
            {species.watering && (
              <div className="bg-blue-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-semibold text-blue-700">Water</span>
                </div>
                <p className="text-xs text-blue-600">{wateringLabel[species.watering]}</p>
              </div>
            )}
            {species.light && (
              <div className="bg-amber-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-semibold text-amber-700">Light</span>
                </div>
                <p className="text-xs text-amber-600">{lightLabel[species.light]}</p>
              </div>
            )}
            {species.native_region && (
              <div className="bg-emerald-50 rounded-xl p-3 col-span-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-700">Native Region</span>
                </div>
                <p className="text-xs text-emerald-700">{species.native_region}</p>
              </div>
            )}
          </div>

          {/* Tags */}
          {species.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {species.tags.map((tag, i) => (
                <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}