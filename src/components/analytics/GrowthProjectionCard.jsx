import React, { useState } from 'react';
import { Sparkles, Loader2, RefreshCw, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus, Leaf, Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { cn } from '@/lib/utils';

const TRAJECTORY_CONFIG = {
  thriving:   { label: 'Thriving',   color: 'text-emerald-700', bg: 'bg-emerald-50',  border: 'border-emerald-200', dot: 'bg-emerald-500' },
  steady:     { label: 'Steady',     color: 'text-blue-700',    bg: 'bg-blue-50',     border: 'border-blue-200',    dot: 'bg-blue-500' },
  slow:       { label: 'Slow',       color: 'text-amber-700',   bg: 'bg-amber-50',    border: 'border-amber-200',   dot: 'bg-amber-500' },
  declining:  { label: 'Declining',  color: 'text-red-700',     bg: 'bg-red-50',      border: 'border-red-200',     dot: 'bg-red-500' },
  recovering: { label: 'Recovering', color: 'text-purple-700',  bg: 'bg-purple-50',   border: 'border-purple-200',  dot: 'bg-purple-500' },
};

const MILESTONE_ICONS = {
  bloom:        '🌸',
  repot:        '🪴',
  stage_change: '🌿',
  harvest:      '🍅',
  pruning:      '✂️',
  dormancy:     '😴',
  other:        '📌',
};

const LIKELIHOOD_COLORS = {
  high:   'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  low:    'bg-gray-100 text-gray-500',
};

const RISK_COLORS = {
  low:      'bg-blue-50 text-blue-700',
  moderate: 'bg-amber-50 text-amber-700',
  high:     'bg-red-50 text-red-700',
};

function formatPredictedDate(dateStr) {
  if (!dateStr) return null;
  try {
    const d = parseISO(dateStr);
    if (isValid(d)) return format(d, 'MMM d, yyyy');
  } catch {}
  return dateStr; // fallback: return as-is (e.g. "Spring 2026")
}

function TrendIcon({ trend }) {
  if (trend === 'improving') return <TrendingUp className="w-4 h-4 text-emerald-600" />;
  if (trend === 'declining') return <TrendingDown className="w-4 h-4 text-red-500" />;
  return <Minus className="w-4 h-4 text-gray-400" />;
}

export default function GrowthProjectionCard({ plant, projection, loading, onAnalyze }) {
  const [expanded, setExpanded] = useState(false);

  const traj = TRAJECTORY_CONFIG[projection?.overall_trajectory] || TRAJECTORY_CONFIG.steady;

  return (
    <div className={cn('bg-white rounded-2xl border transition-all', projection ? `border-gray-100 hover:shadow-md` : 'border-gray-100')}>
      {/* Top row */}
      <div className="flex items-center gap-4 px-5 py-4">
        {/* Plant avatar */}
        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-[#52796F]/10">
          {plant.image_url
            ? <img src={plant.image_url} alt={plant.plant_name} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-xl">🌱</div>
          }
        </div>

        {/* Name + summary */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-[#1B4332]">{plant.plant_name}</h3>
            {plant.scientific_name && <span className="text-xs text-gray-400 italic">{plant.scientific_name}</span>}
            {projection && (
              <span className={cn('text-xs font-medium px-2.5 py-0.5 rounded-full', traj.bg, traj.color)}>
                {traj.label}
              </span>
            )}
          </div>
          {projection ? (
            <p className="text-sm text-gray-600 mt-0.5 line-clamp-1">{projection.summary}</p>
          ) : (
            <p className="text-xs text-gray-400 mt-0.5">No projection yet · click Analyze to generate</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {projection && (
            <button onClick={() => setExpanded(e => !e)} className="text-gray-400 hover:text-gray-600 p-1">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
          <button
            onClick={onAnalyze}
            disabled={loading}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              loading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : projection
                  ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  : 'bg-[#1B4332] text-white hover:bg-[#2D6A4F]'
            )}
          >
            {loading
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing…</>
              : projection
                ? <><RefreshCw className="w-3.5 h-3.5" /> Refresh</>
                : <><Sparkles className="w-3.5 h-3.5" /> Analyze</>
            }
          </button>
        </div>
      </div>

      {/* Quick metrics bar (always visible when projected) */}
      {projection && !loading && (
        <div className="flex items-center gap-4 px-5 pb-3 border-t border-gray-50 pt-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <TrendIcon trend={projection.health_trend} />
            <span className="capitalize">{projection.health_trend || 'stable'}</span>
          </div>
          <span className="text-gray-200">|</span>
          <div className="text-xs text-gray-500">
            Growth: <span className="font-medium text-gray-700 capitalize">{projection.growth_rate || 'moderate'}</span>
          </div>
          <span className="text-gray-200">|</span>
          <div className="text-xs text-gray-500">
            Confidence: <span className="font-medium text-gray-700">{projection.confidence ? `${Math.round(projection.confidence)}%` : '—'}</span>
          </div>
          {projection.next_action && (
            <>
              <span className="text-gray-200">|</span>
              <div className="flex items-center gap-1 text-xs text-[#52796F]">
                <Calendar className="w-3 h-3" />
                <span className="font-medium">{projection.next_action}</span>
                {projection.next_action_date && (
                  <span className="text-gray-400">· {formatPredictedDate(projection.next_action_date)}</span>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Expanded detail */}
      {projection && expanded && (
        <div className="px-5 pb-5 space-y-5 border-t border-gray-50 pt-4">

          {/* Milestones timeline */}
          {projection.milestones?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Predicted Milestones</p>
              <div className="relative pl-5 space-y-3">
                <div className="absolute left-2 top-1 bottom-1 w-px bg-gray-100" />
                {projection.milestones.map((m, i) => (
                  <div key={i} className="relative flex items-start gap-3">
                    <div className={cn('absolute -left-3 w-2 h-2 rounded-full mt-1.5 flex-shrink-0', traj.dot)} />
                    <div className="bg-gray-50 rounded-xl p-3 flex-1">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-800">
                          {MILESTONE_ICONS[m.type] || '📌'} {m.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={cn('text-[10px] font-bold uppercase px-2 py-0.5 rounded-full', LIKELIHOOD_COLORS[m.likelihood] || LIKELIHOOD_COLORS.medium)}>
                            {m.likelihood}
                          </span>
                          {m.predicted_date && (
                            <span className="text-xs text-[#52796F] font-medium">{formatPredictedDate(m.predicted_date)}</span>
                          )}
                        </div>
                      </div>
                      {m.description && <p className="text-xs text-gray-500 mt-1">{m.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom 2-col: recs + risks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Care recommendations */}
            {projection.care_recommendations?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Recommendations</p>
                <ul className="space-y-1.5">
                  {projection.care_recommendations.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Risk factors */}
            {projection.risk_factors?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Risk Factors</p>
                <div className="space-y-1.5">
                  {projection.risk_factors.map((r, i) => (
                    <div key={i} className={cn('flex items-start gap-2 text-xs px-2.5 py-1.5 rounded-lg', RISK_COLORS[r.severity] || RISK_COLORS.low)}>
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      <span>{r.risk}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}