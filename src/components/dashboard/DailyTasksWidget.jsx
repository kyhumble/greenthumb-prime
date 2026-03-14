import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Droplets, CheckCircle2, Clock, AlertCircle, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { differenceInDays, format, addDays } from 'date-fns';

// Heuristic frequency by category + light
function suggestFrequency(plant) {
  const base = {
    succulent: 14, cactus: 21, herb: 3, vegetable: 2, fruit: 3,
    flower: 5, houseplant: 7, tree: 10, shrub: 7, vine: 5, fern: 4, grass: 5, other: 7
  }[plant.plant_category] || 7;

  const lightMod = {
    full_sun: 0.7, partial_sun: 0.85, partial_shade: 1, full_shade: 1.2, artificial: 1.1
  }[plant.location === 'indoor' ? 'artificial' : 'full_sun'] || 1;

  return Math.round(base * lightMod);
}

function getTaskStatus(schedule, plant) {
  const freq = schedule?.frequency_days || suggestFrequency(plant);
  const lastWatered = schedule?.last_watered_date;
  if (!lastWatered) return { status: 'unknown', daysOverdue: null, nextDate: null };

  const daysSince = differenceInDays(new Date(), new Date(lastWatered));
  const daysOverdue = daysSince - freq;
  const nextDate = addDays(new Date(lastWatered), freq);

  if (daysOverdue >= 1) return { status: 'overdue', daysOverdue, nextDate };
  if (daysOverdue === 0) return { status: 'due_today', daysOverdue: 0, nextDate };
  return { status: 'upcoming', daysOverdue, nextDate };
}

export default function DailyTasksWidget({ plants }) {
  const queryClient = useQueryClient();
  const [markingId, setMarkingId] = useState(null);

  const { data: schedules = [] } = useQuery({
    queryKey: ['watering_schedules'],
    queryFn: () => base44.entities.WateringSchedule.list(),
  });

  const scheduleMap = Object.fromEntries(schedules.map(s => [s.plant_id, s]));

  const tasks = plants
    .map(plant => {
      const schedule = scheduleMap[plant.id];
      const taskInfo = getTaskStatus(schedule, plant);
      return { plant, schedule, ...taskInfo };
    })
    .filter(t => t.status === 'overdue' || t.status === 'due_today' || t.status === 'unknown')
    .sort((a, b) => (b.daysOverdue || 0) - (a.daysOverdue || 0))
    .slice(0, 5);

  const markWatered = async (plant, schedule) => {
    setMarkingId(plant.id);
    const today = format(new Date(), 'yyyy-MM-dd');
    if (schedule) {
      await base44.entities.WateringSchedule.update(schedule.id, { last_watered_date: today });
    } else {
      await base44.entities.WateringSchedule.create({
        plant_id: plant.id,
        frequency_days: suggestFrequency(plant),
        last_watered_date: today,
      });
    }
    await base44.entities.Intervention.create({
      plant_id: plant.id,
      intervention_type: 'watering',
      date: today,
      notes: 'Marked via daily tasks',
    });
    queryClient.invalidateQueries({ queryKey: ['watering_schedules'] });
    setMarkingId(null);
  };

  if (tasks.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3">
        <Droplets className="w-5 h-5 text-blue-400 flex-shrink-0" />
        <p className="text-sm text-blue-700">No watering tasks due today. All plants are on track 💧</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-50">
        <h3 className="text-sm font-semibold text-[#1B4332] flex items-center gap-2">
          <Droplets className="w-4 h-4 text-blue-500" />
          Today's Watering Tasks
          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{tasks.length}</span>
        </h3>
        <Link to="/Plants" className="text-xs text-[#52796F] hover:underline flex items-center gap-0.5">
          Manage <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-gray-50">
        {tasks.map(({ plant, schedule, status, daysOverdue, nextDate }) => (
          <div key={plant.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
            {plant.image_url ? (
              <img src={plant.image_url} alt={plant.plant_name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-[#52796F]/10 flex items-center justify-center flex-shrink-0 text-base">🌱</div>
            )}

            <div className="flex-1 min-w-0">
              <Link to={`/PlantProfile?id=${plant.id}`} className="text-sm font-medium text-gray-800 hover:text-[#52796F] truncate block">
                {plant.plant_name}
              </Link>
              <div className="flex items-center gap-1.5 mt-0.5">
                {status === 'overdue' ? (
                  <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    {daysOverdue === 1 ? '1 day overdue' : `${daysOverdue} days overdue`}
                  </span>
                ) : status === 'due_today' ? (
                  <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                    <Clock className="w-3 h-3" /> Due today
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">No watering record — set up schedule</span>
                )}
                <span className="text-gray-300">·</span>
                <span className="text-xs text-gray-400">
                  Every {schedule?.frequency_days || suggestFrequency(plant)}d
                </span>
              </div>
            </div>

            <button
              onClick={() => markWatered(plant, schedule)}
              disabled={markingId === plant.id}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium transition-colors disabled:opacity-50"
            >
              {markingId === plant.id ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              Done
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}