import { useEffect } from 'react';

const CARE_EMOJI = {
  watering: '💧', fertilizing: '🌱', repotting: '🪴',
  pruning: '✂️', pest_treatment: '🐛', misting: '💦', other: '📋',
};

/**
 * Fires browser notifications for care reminders that are due today or overdue.
 * Runs once per session to avoid spamming.
 */
export function useCareNotifications(reminders = [], plants = []) {
  useEffect(() => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    if (reminders.length === 0) return;

    const sessionKey = 'care_notif_fired';
    if (sessionStorage.getItem(sessionKey)) return;
    sessionStorage.setItem(sessionKey, '1');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const plantMap = Object.fromEntries(plants.map(p => [p.id, p]));

    const due = reminders.filter(r => {
      if (!r.is_active || !r.next_due_date) return false;
      const dueDate = new Date(r.next_due_date);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate <= today;
    });

    if (due.length === 0) return;

    const lines = due.slice(0, 5).map(r => {
      const plant = plantMap[r.plant_id];
      const emoji = CARE_EMOJI[r.care_type] || '📋';
      return `${emoji} ${r.care_type.replace(/_/g, ' ')} — ${plant?.plant_name || 'Plant'}`;
    });

    const extra = due.length > 5 ? `\n+${due.length - 5} more…` : '';

    new Notification(`🌿 ${due.length} care task${due.length > 1 ? 's' : ''} due today`, {
      body: lines.join('\n') + extra,
      icon: '/favicon.ico',
      tag: 'care-reminders',
    });
  }, [reminders, plants]);
}