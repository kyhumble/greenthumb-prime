import React from 'react';
import { cn } from '@/lib/utils';

export default function HealthScoreBadge({ score, size = 'md' }) {
  const getColor = (s) => {
    if (s >= 80) return { bg: 'bg-emerald-100', text: 'text-emerald-700', ring: 'ring-emerald-200' };
    if (s >= 60) return { bg: 'bg-lime-100', text: 'text-lime-700', ring: 'ring-lime-200' };
    if (s >= 40) return { bg: 'bg-amber-100', text: 'text-amber-700', ring: 'ring-amber-200' };
    if (s >= 20) return { bg: 'bg-orange-100', text: 'text-orange-700', ring: 'ring-orange-200' };
    return { bg: 'bg-red-100', text: 'text-red-700', ring: 'ring-red-200' };
  };

  const colors = getColor(score || 0);
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
  };

  return (
    <div className={cn(
      "rounded-full flex items-center justify-center font-bold ring-2",
      colors.bg, colors.text, colors.ring,
      sizes[size]
    )}>
      {score != null ? score : '—'}
    </div>
  );
}