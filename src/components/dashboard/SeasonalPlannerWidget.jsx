import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { CalendarDays, Loader2, Sparkles, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const SEASON_COLORS = {
  winter: 'from-blue-50 to-indigo-50 border-blue-100',
  spring: 'from-green-50 to-emerald-50 border-green-100',
  summer: 'from-yellow-50 to-amber-50 border-yellow-100',
  fall:   'from-orange-50 to-red-50 border-orange-100',
};

function getSeason(month) {
  if ([11, 0, 1].includes(month)) return 'winter';
  if ([2, 3, 4].includes(month)) return 'spring';
  if ([5, 6, 7].includes(month)) return 'summer';
  return 'fall';
}

export default function SeasonalPlannerWidget({ plants }) {
  const [tasks, setTasks] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [done, setDone] = useState(new Set());

  const currentMonth = new Date().getMonth();
  const season = getSeason(currentMonth);
  const monthName = MONTH_NAMES[currentMonth];

  const generatePlan = async () => {
    if (!plants.length) return;
    setLoading(true);
    const plantList = plants.map(p => `${p.plant_name}${p.plant_category ? ` (${p.plant_category})` : ''}${p.location ? `, ${p.location}` : ''}`).join('; ');
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert horticulturalist. Generate a seasonal care plan for ${monthName} (${season} season) for this plant collection: ${plantList}.
Provide 5-8 specific, actionable tasks this month. Each task should reference the specific plant(s) it applies to.
Focus on: pruning, repotting, fertilizing, pest prevention, watering adjustments, dormancy prep, propagation windows, or seasonal transitions.`,
      response_json_schema: {
        type: 'object',
        properties: {
          tasks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                task: { type: 'string' },
                plant: { type: 'string' },
                priority: { type: 'string', enum: ['high', 'medium', 'low'] },
                category: { type: 'string' }
              }
            }
          },
          seasonal_tip: { type: 'string' }
        }
      }
    });
    setTasks(result);
    setLoading(false);
  };

  const priorityStyle = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-gray-100 text-gray-500',
  };

  const seasonEmoji = { winter: '❄️', spring: '🌱', summer: '☀️', fall: '🍂' };

  return (
    <div className={`bg-gradient-to-br ${SEASON_COLORS[season]} border rounded-2xl overflow-hidden`}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{seasonEmoji[season]}</span>
          <div>
            <h3 className="text-sm font-semibold text-[#1B4332]">
              {monthName} Planner
            </h3>
            <p className="text-xs text-gray-500 capitalize">{season} season tasks for your garden</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!tasks && !loading && plants.length > 0 && (
            <button
              onClick={generatePlan}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1B4332] text-white rounded-lg text-xs font-medium hover:bg-[#2D6A4F] transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" /> Generate Plan
            </button>
          )}
          {loading && <Loader2 className="w-4 h-4 animate-spin text-[#52796F]" />}
          {tasks && (
            <button onClick={() => setExpanded(e => !e)} className="text-gray-400 hover:text-gray-600">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Tasks list */}
      {tasks && expanded && (
        <div className="px-5 pb-5 space-y-2">
          {tasks.seasonal_tip && (
            <div className="bg-white/60 rounded-xl p-3 mb-3 text-xs text-gray-600 italic backdrop-blur-sm">
              💡 {tasks.seasonal_tip}
            </div>
          )}
          {tasks.tasks?.map((t, i) => (
            <div
              key={i}
              onClick={() => setDone(d => { const n = new Set(d); n.has(i) ? n.delete(i) : n.add(i); return n; })}
              className={`flex items-start gap-3 p-3 rounded-xl bg-white/60 backdrop-blur-sm cursor-pointer hover:bg-white/80 transition-all ${done.has(i) ? 'opacity-50' : ''}`}
            >
              <CheckCircle2 className={`w-4 h-4 flex-shrink-0 mt-0.5 ${done.has(i) ? 'text-emerald-500' : 'text-gray-300'}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm text-gray-800 ${done.has(i) ? 'line-through' : ''}`}>{t.task}</p>
                {t.plant && <p className="text-xs text-[#52796F] mt-0.5">🌿 {t.plant}</p>}
              </div>
              {t.priority && (
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${priorityStyle[t.priority] || priorityStyle.low}`}>
                  {t.priority}
                </span>
              )}
            </div>
          ))}
          <button
            onClick={generatePlan}
            className="w-full text-xs text-[#52796F] hover:underline mt-1 flex items-center justify-center gap-1"
          >
            <Sparkles className="w-3 h-3" /> Regenerate plan
          </button>
        </div>
      )}

      {!plants.length && (
        <div className="px-5 pb-4 text-xs text-gray-400">Add plants to your collection to get a personalized seasonal plan.</div>
      )}
    </div>
  );
}