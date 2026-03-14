import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const severityConfig = {
  low: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700' },
  moderate: { icon: Info, color: 'text-amber-600', bg: 'bg-amber-50', badge: 'bg-amber-100 text-amber-700' },
  high: { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50', badge: 'bg-orange-100 text-orange-700' },
  critical: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', badge: 'bg-red-100 text-red-700' },
};

export default function DiagnosisCard({ diagnosis, mode = 'quick_fix' }) {
  const config = severityConfig[diagnosis.severity] || severityConfig.low;
  const Icon = config.icon;

  return (
    <div className={cn("rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm")}>
      {/* Header */}
      <div className={cn("px-5 py-3 flex items-center justify-between", config.bg)}>
        <div className="flex items-center gap-2">
          <Icon className={cn("w-4 h-4", config.color)} />
          <span className="font-medium text-sm text-gray-800 capitalize">
            {diagnosis.diagnosis_type?.replace(/_/g, ' ')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={config.badge}>
            {diagnosis.severity}
          </Badge>
          <span className="text-xs text-gray-400">
            {diagnosis.confidence_score}% confidence
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        {/* Observations */}
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Observations</p>
          <p className="text-sm text-gray-700 leading-relaxed">{diagnosis.observations}</p>
        </div>

        {/* Likely Cause */}
        {diagnosis.likely_cause && (
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Likely Cause</p>
            <p className="text-sm text-gray-700">{diagnosis.likely_cause}</p>
          </div>
        )}

        {/* Mode-specific content */}
        {mode === 'quick_fix' && diagnosis.quick_fix ? (
          <div className="bg-[#52796F]/5 rounded-xl p-4">
            <p className="text-xs font-medium text-[#52796F] uppercase tracking-wider mb-1">Quick Fix</p>
            <p className="text-sm text-[#1B4332] font-medium">{diagnosis.quick_fix}</p>
          </div>
        ) : diagnosis.detailed_explanation ? (
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-1">Detailed Explanation</p>
            <p className="text-sm text-gray-700 leading-relaxed">{diagnosis.detailed_explanation}</p>
          </div>
        ) : null}

        {/* Recommended Actions */}
        {diagnosis.recommended_actions?.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Recommended Actions</p>
            <ul className="space-y-1.5">
              {diagnosis.recommended_actions.map((action, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="w-5 h-5 rounded-full bg-[#52796F]/10 text-[#52796F] flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">{i + 1}</span>
                  {action}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recovery time */}
        {diagnosis.expected_recovery_time && (
          <p className="text-xs text-gray-500">
            Expected recovery: <span className="font-medium">{diagnosis.expected_recovery_time}</span>
          </p>
        )}

        {/* Date */}
        <p className="text-xs text-gray-400">
          {diagnosis.created_date ? format(new Date(diagnosis.created_date), 'MMM d, yyyy') : ''}
        </p>
      </div>
    </div>
  );
}