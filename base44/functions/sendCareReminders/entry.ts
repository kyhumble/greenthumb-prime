import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // Use service role since this runs as a scheduled job
    const today = new Date().toISOString().split('T')[0];

    // Get all active reminders due today or overdue
    const reminders = await base44.asServiceRole.entities.CareReminder.list();
    const dueReminders = reminders.filter(r => r.is_active && r.next_due_date && r.next_due_date <= today);

    if (dueReminders.length === 0) {
      return Response.json({ sent: 0, message: 'No due reminders today.' });
    }

    // Get all plants for context
    const plants = await base44.asServiceRole.entities.Plant.list();
    const plantMap = Object.fromEntries(plants.map(p => [p.id, p]));

    // Get all users (to find emails)
    const users = await base44.asServiceRole.entities.User.list();
    const userMap = Object.fromEntries(users.map(u => [u.email, u]));

    // Group reminders by user
    const remindersByUser = {};
    for (const reminder of dueReminders) {
      const email = reminder.created_by;
      if (!email) continue;
      if (!remindersByUser[email]) remindersByUser[email] = [];
      remindersByUser[email].push(reminder);
    }

    const CARE_EMOJI = {
      watering: '💧', fertilizing: '🌱', repotting: '🪴',
      pruning: '✂️', pest_treatment: '🐛', misting: '💦', other: '📋',
    };

    let sent = 0;
    for (const [email, userReminders] of Object.entries(remindersByUser)) {
      const user = userMap[email];
      if (!user) continue;

      // Only send if user has email notifications enabled
      if (user.email_notifications === false) continue;

      const lines = userReminders.map(r => {
        const plant = plantMap[r.plant_id];
        const emoji = CARE_EMOJI[r.care_type] || '📋';
        const plantName = plant?.plant_name || 'Unknown Plant';
        const daysOverdue = Math.max(0, Math.floor((new Date(today) - new Date(r.next_due_date)) / 86400000));
        const overdueText = daysOverdue > 0 ? ` (${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue)` : ' (due today)';
        return `${emoji} <strong>${r.care_type.replace(/_/g, ' ')}</strong> — ${plantName}${overdueText}${r.notes ? `<br>&nbsp;&nbsp;&nbsp;<em>${r.notes}</em>` : ''}`;
      }).join('<br><br>');

      const body = `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;">
          <h2 style="color:#1B4332;">🌿 Plant Care Reminders</h2>
          <p style="color:#555;">Hi${user.full_name ? ` ${user.full_name.split(' ')[0]}` : ''},</p>
          <p style="color:#555;">You have <strong>${userReminders.length}</strong> care task${userReminders.length > 1 ? 's' : ''} due today:</p>
          <div style="background:#f9fafb;border-radius:12px;padding:16px 20px;margin:16px 0;color:#1B4332;">${lines}</div>
          <p style="color:#555;">Open GreenThumb to mark them as done and keep your plants healthy 🌱</p>
        </div>
      `;

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: email,
        subject: `🌿 ${userReminders.length} plant care task${userReminders.length > 1 ? 's' : ''} due today`,
        body,
      });
      sent++;
      console.log(`Email sent to ${email} for ${userReminders.length} reminder(s)`);
    }

    return Response.json({ sent, message: `Sent emails to ${sent} user(s).` });
  } catch (error) {
    console.error('sendCareReminders error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});