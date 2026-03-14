import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Sun, Droplets, Layers, Bug, Thermometer, ChevronDown, ChevronUp, Sparkles, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ICONS = {
  light: Sun,
  water: Droplets,
  soil: Layers,
  pests: Bug,
  temperature: Thermometer,
};

export default function PlantCareGuide({ plant }) {
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const fetchGuide = async () => {
    setLoading(true);
    setExpanded(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert botanist. Provide a concise care guide for: ${plant.plant_name}${plant.scientific_name ? ` (${plant.scientific_name})` : ''}.
Include these exact fields:
- light_requirements: (1-2 sentences on ideal light)
- watering_schedule: (how often, how much, signs of over/under watering)
- soil_type: (ideal soil mix and pH)
- temperature_range: (ideal temp and humidity)
- common_issues: array of 3 common problems with 1-line fixes
- ideal_conditions: (brief summary of perfect environment)
- care_tips: array of 3 quick actionable tips`,
      response_json_schema: {
        type: 'object',
        properties: {
          light_requirements: { type: 'string' },
          watering_schedule: { type: 'string' },
          soil_type: { type: 'string' },
          temperature_range: { type: 'string' },
          common_issues: { type: 'array', items: { type: 'string' } },
          ideal_conditions: { type: 'string' },
          care_tips: { type: 'array', items: { type: 'string' } },
        }
      }
    });
    setGuide(result);
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => { if (!guide && !loading) fetchGuide(); else setExpanded(e => !e); }}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {plant.image_url ? (
            <img src={plant.image_url} alt={plant.plant_name} className="w-10 h-10 rounded-xl object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-[#52796F]/10 flex items-center justify-center text-xl">🌱</div>
          )}
          <div className="text-left">
            <p className="text-sm font-semibold text-[#1B4332]">{plant.plant_name}</p>
            {plant.scientific_name && <p className="text-xs text-gray-400 italic">{plant.scientific_name}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!guide && !loading && (
            <span className="text-xs text-[#52796F] font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Get Care Guide
            </span>
          )}
          {loading && <Loader2 className="w-4 h-4 animate-spin text-[#52796F]" />}
          {guide && (expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />)}
        </div>
      </button>

      {/* Guide content */}
      {guide && expanded && (
        <div className="px-5 pb-5 border-t border-gray-50">
          {/* Care requirements grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            {[
              { key: 'light_requirements', label: 'Light', icon: Sun, color: 'bg-yellow-50 border-yellow-100 text-yellow-700' },
              { key: 'watering_schedule', label: 'Watering', icon: Droplets, color: 'bg-blue-50 border-blue-100 text-blue-700' },
              { key: 'soil_type', label: 'Soil', icon: Layers, color: 'bg-amber-50 border-amber-100 text-amber-700' },
              { key: 'temperature_range', label: 'Temperature', icon: Thermometer, color: 'bg-rose-50 border-rose-100 text-rose-700' },
            ].map(({ key, label, icon: Icon, color }) => (
              <div key={key} className={`border rounded-xl p-3 ${color}`}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Icon className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold uppercase tracking-wide">{label}</span>
                </div>
                <p className="text-xs leading-relaxed opacity-80">{guide[key]}</p>
              </div>
            ))}
          </div>

          {/* Ideal conditions */}
          {guide.ideal_conditions && (
            <div className="mt-4 bg-[#52796F]/5 rounded-xl p-4">
              <p className="text-xs font-semibold text-[#52796F] uppercase tracking-wider mb-1">Ideal Conditions</p>
              <p className="text-sm text-[#1B4332]">{guide.ideal_conditions}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Common issues */}
            {guide.common_issues?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Common Issues</p>
                <ul className="space-y-1.5">
                  {guide.common_issues.map((issue, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                      <Bug className="w-3.5 h-3.5 text-orange-400 flex-shrink-0 mt-0.5" />
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Quick tips */}
            {guide.care_tips?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Quick Tips</p>
                <ul className="space-y-1.5">
                  {guide.care_tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                      <span className="w-4 h-4 rounded-full bg-[#52796F]/15 text-[#52796F] flex items-center justify-center text-[10px] font-bold flex-shrink-0">{i + 1}</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}