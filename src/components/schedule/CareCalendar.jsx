import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addDays, isToday, isPast, isFuture, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, CheckCircle2, Edit2, Trash2, Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CARE_EMOJIS = {
  watering: '💧', fertilizing: '🌱', repotting: '🪴',
  pruning: '✂️', pest_treatment: '🐛', misting: '💦', other: '📋',
};

const CARE_COLORS = {
  watering: 'bg-blue-100 text-blue-700 border-blue-200',
  fertilizing: 'bg-green-100 text-green-700 border-green-200',
  repotting: 'bg-amber-100 text-amber-700 border-amber-200',
  pruning: 'bg-purple-100 text-purple-700 border-purple-200',
  pest_treatment: 'bg-red-100 text-red-700 border-red-200',
  misting: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  other: 'bg-gray-100 text-gray-700 border-gray-200',
};

export default function CareCalendar({ reminders, plants, onEdit, onRefresh }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());

  const plantMap = useMemo(() => {
    const m = {};
    plants.forEach(p => m[p.id] = p);
    return m;
  }, [plants]);

  // Generate all upcoming occurrences for a reminder within the visible month
  const getOccurrences = (reminder) => {
    const days = [];
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    let d = new Date(reminder.next_due_date);

    // Walk backward if needed to cover the month start
    while (d > start) d = addDays(d, -reminder.frequency_days);
    while (d <= end) {
      if (d >= start) days.push(new Date(d));
      d = addDays(d, reminder.frequency_days);
    }
    return days;
  };

  const dayMap = useMemo(() => {
    const m = {};
    reminders.filter(r => r.is_active).forEach(r => {
      getOccurrences(r).forEach(d => {
        const key = format(d, 'yyyy-MM-dd');
        if (!m[key]) m[key] = [];
        m[key].push(r);
      });
    });
    return m;
  }, [reminders, currentMonth]);

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const firstDayOfWeek = startOfMonth(currentMonth).getDay();

  const selectedKey = format(selectedDay, 'yyyy-MM-dd');
  const selectedTasks = dayMap[selectedKey] || [];

  const handleComplete = async (reminder) => {
    const nextDate = format(addDays(new Date(reminder.next_due_date), reminder.frequency_days), 'yyyy-MM-dd');
    await base44.entities.CareReminder.update(reminder.id, {
      last_completed_date: format(new Date(), 'yyyy-MM-dd'),
      next_due_date: nextDate,
    });
    onRefresh();
  };

  const handleDelete = async (id) => {
    await base44.entities.CareReminder.delete(id);
    onRefresh();
  };

  const handleToggle = async (reminder) => {
    await base44.entities.CareReminder.update(reminder.id, { is_active: !reminder.is_active });
    onRefresh();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCurrentMonth(m => subMonths(m, 1))} className="p-1.5 rounded-lg hover:bg-gray-100">
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          </button>
          <h3 className="text-sm font-semibold text-[#1B4332]">{format(currentMonth, 'MMMM yyyy')}</h3>
          <button onClick={() => setCurrentMonth(m => addMonths(m, 1))} className="p-1.5 rounded-lg hover:bg-gray-100">
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
            <div key={d} className="text-center text-[10px] font-medium text-gray-400 py-1">{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e${i}`} />)}
          {days.map(day => {
            const key = format(day, 'yyyy-MM-dd');
            const tasks = dayMap[key] || [];
            const isSelected = isSameDay(day, selectedDay);
            const todayDay = isToday(day);

            return (
              <button
                key={key}
                onClick={() => setSelectedDay(day)}
                className={`relative flex flex-col items-center rounded-xl py-1.5 transition-all min-h-[52px] ${
                  isSelected ? 'bg-[#1B4332] text-white' : todayDay ? 'bg-[#52796F]/10 text-[#1B4332]' : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span className={`text-xs font-medium ${todayDay && !isSelected ? 'font-bold' : ''}`}>{format(day, 'd')}</span>
                {tasks.length > 0 && (
                  <div className="flex flex-wrap gap-0.5 justify-center mt-1 px-1">
                    {tasks.slice(0, 3).map((t, i) => (
                      <span key={i} className="text-[10px] leading-none">{CARE_EMOJIS[t.care_type] || '📋'}</span>
                    ))}
                    {tasks.length > 3 && <span className={`text-[9px] ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>+{tasks.length - 3}</span>}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day detail + reminder list */}
      <div className="space-y-4">
        {/* Selected day tasks */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h4 className="text-sm font-semibold text-[#1B4332] mb-3">
            {isToday(selectedDay) ? 'Today' : format(selectedDay, 'EEE, MMM d')}
            {selectedTasks.length > 0 && <span className="ml-2 text-xs bg-[#52796F]/10 text-[#52796F] px-2 py-0.5 rounded-full">{selectedTasks.length}</span>}
          </h4>
          {selectedTasks.length === 0 ? (
            <p className="text-xs text-gray-400">No tasks this day</p>
          ) : (
            <div className="space-y-2">
              {selectedTasks.map(task => {
                const plant = plantMap[task.plant_id];
                return (
                  <div key={task.id} className={`flex items-start gap-2 p-2.5 rounded-xl border text-xs ${CARE_COLORS[task.care_type] || CARE_COLORS.other}`}>
                    <span className="text-base leading-none mt-0.5">{CARE_EMOJIS[task.care_type]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium capitalize">{task.care_type.replace(/_/g, ' ')}</p>
                      <p className="opacity-80 truncate">{plant?.plant_name || 'Unknown plant'}</p>
                    </div>
                    <button onClick={() => handleComplete(task)} title="Mark done" className="opacity-60 hover:opacity-100">
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* All reminders list */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h4 className="text-sm font-semibold text-[#1B4332] mb-3">All Reminders ({reminders.length})</h4>
          {reminders.length === 0 ? (
            <p className="text-xs text-gray-400">No reminders yet. Add one above.</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {reminders.map(r => {
                const plant = plantMap[r.plant_id];
                return (
                  <div key={r.id} className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs transition-opacity ${!r.is_active ? 'opacity-40' : ''} ${CARE_COLORS[r.care_type] || CARE_COLORS.other}`}>
                    <span>{CARE_EMOJIS[r.care_type]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium capitalize truncate">{plant?.plant_name}</p>
                      <p className="opacity-70">Every {r.frequency_days}d · due {format(new Date(r.next_due_date), 'MMM d')}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleToggle(r)} className="opacity-60 hover:opacity-100">
                        {r.is_active ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => onEdit(r)} className="opacity-60 hover:opacity-100">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(r.id)} className="opacity-60 hover:opacity-100">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}