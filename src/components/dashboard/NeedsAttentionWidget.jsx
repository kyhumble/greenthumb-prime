import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Droplets, Scissors, FlowerIcon, Zap, ChevronRight, CheckCircle2 } from 'lucide-react';
import HealthScoreBadge from '../plants/HealthScoreBadge';
import { differenceInDays } from 'date-fns';

// Derive pending tasks from plant data heuristics
function getPendingTasks(plant) {
  const tasks = [];
  const score = plant.health_score || 75;
  const daysSincePlanted = plant.planting_date
    ? differenceInDays(new Date(), new Date(plant.planting_date))
    : null;

  if (score < 40) tasks.push({ label: 'Check health urgently', icon: AlertTriangle, color: 'text-red-500' });
  if (score < 60) tasks.push({ label: 'Inspect for pests', icon: Zap, color: 'text-orange-500' });
  if (plant.growth_stage === 'seedling' || plant.growth_stage === 'vegetative')
    tasks.push({ label: 'Fertilizer due', icon: FlowerIcon, color: 'text-amber-500' });
  if (daysSincePlanted !== null && daysSincePlanted > 365 && plant.plant_category === 'houseplant')
    tasks.push({ label: 'Consider repotting', icon: Scissors, color: 'text-purple-500' });
  if (score < 70)
    tasks.push({ label: 'Water check needed', icon: Droplets, color: 'text-blue-500' });

  return tasks.slice(0, 3);
}

const severityConfig = {
  critical: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700' },
  high:     { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700' },
  moderate: { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700' },
  low:      { bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-700' },
};

function getSeverity(score) {
  if (score < 30) return 'critical';
  if (score < 50) return 'high';
  if (score < 65) return 'moderate';
  return 'low';
}

export default function NeedsAttentionWidget({ plants }) {
  const attentionPlants = plants
    .filter(p => (p.health_score || 75) < 70)
    .sort((a, b) => (a.health_score || 75) - (b.health_score || 75))
    .slice(0, 4);

  if (attentionPlants.length === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center gap-4 mb-6">
        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <p className="font-semibold text-emerald-800 text-sm">All plants are thriving!</p>
          <p className="text-xs text-emerald-600 mt-0.5">No urgent tasks today. Keep up the great care 🌱</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-[#1B4332] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Needs Attention
          <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">{attentionPlants.length}</span>
        </h2>
        <Link to="/Plants" className="text-xs text-[#52796F] hover:underline flex items-center gap-0.5">
          View all <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {attentionPlants.map(plant => {
          const score = plant.health_score || 0;
          const severity = getSeverity(score);
          const cfg = severityConfig[severity];
          const tasks = getPendingTasks(plant);

          return (
            <Link
              key={plant.id}
              to={`/PlantProfile?id=${plant.id}`}
              className={`${cfg.bg} ${cfg.border} border rounded-2xl p-4 hover:shadow-md transition-all duration-200 block`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  {plant.image_url ? (
                    <img src={plant.image_url} alt={plant.plant_name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-white/60 flex items-center justify-center flex-shrink-0 text-lg">🌱</div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{plant.plant_name}</p>
                    <p className="text-xs text-gray-500 truncate">{plant.species || plant.plant_category || ''}</p>
                  </div>
                </div>
                <HealthScoreBadge score={score} size="sm" />
              </div>

              {/* Severity badge */}
              <span className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full mb-3 ${cfg.badge}`}>
                {severity === 'critical' ? '🔴 Critical' : severity === 'high' ? '🟠 High' : severity === 'moderate' ? '🟡 Moderate' : '🟡 Low'}
              </span>

              {/* Pending tasks */}
              {tasks.length > 0 && (
                <div className="space-y-1.5">
                  {tasks.map((task, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                      <task.icon className={`w-3 h-3 flex-shrink-0 ${task.color}`} />
                      <span>{task.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}