import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import FeatureGate from '../components/subscription/FeatureGate';
import { CalendarDays, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CareCalendar from '../components/schedule/CareCalendar';
import ReminderForm from '../components/schedule/ReminderForm';
import NotificationSettings from '../components/schedule/NotificationSettings';
import { useCareNotifications } from '../components/schedule/useCareNotifications';

export default function Schedule() {
  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const loadUser = () => base44.auth.me().then(setUser).catch(() => {});
  useEffect(() => { loadUser(); }, []);

  useCareNotifications(reminders, plants);

  const { data: plants = [] } = useQuery({
    queryKey: ['plants'],
    queryFn: () => base44.entities.Plant.list('-created_date', 100),
  });

  const { data: reminders = [], refetch } = useQuery({
    queryKey: ['careReminders'],
    queryFn: () => base44.entities.CareReminder.list('-next_due_date', 200),
  });

  const handleSaved = () => {
    setShowForm(false);
    setEditingReminder(null);
    queryClient.invalidateQueries({ queryKey: ['careReminders'] });
  };

  const handleEdit = (reminder) => {
    setEditingReminder(reminder);
    setShowForm(true);
  };

  return (
    <FeatureGate user={user} featureName="Care Schedule">
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1B4332] flex items-center gap-2">
            <CalendarDays className="w-6 h-6" /> Care Schedule
          </h1>
          <p className="text-gray-500 text-sm mt-1">Automated reminders for watering, fertilizing & more</p>
        </div>
        <Button onClick={() => { setEditingReminder(null); setShowForm(true); }} className="bg-[#1B4332] hover:bg-[#2D6A4F]">
          <Plus className="w-4 h-4 mr-2" /> Add Reminder
        </Button>
      </div>

      <NotificationSettings user={user} onUserUpdated={loadUser} />

      {showForm && (
        <div className="mb-6">
          <ReminderForm
            plants={plants}
            reminder={editingReminder}
            onSaved={handleSaved}
            onCancel={() => { setShowForm(false); setEditingReminder(null); }}
          />
        </div>
      )}

      <CareCalendar reminders={reminders} plants={plants} onEdit={handleEdit} onRefresh={() => queryClient.invalidateQueries({ queryKey: ['careReminders'] })} />
    </div>
    </FeatureGate>
  );
}