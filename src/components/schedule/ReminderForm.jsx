import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, X } from 'lucide-react';
import { format } from 'date-fns';

const CARE_TYPES = [
  { value: 'watering', label: '💧 Watering', days: 7 },
  { value: 'fertilizing', label: '🌱 Fertilizing', days: 14 },
  { value: 'repotting', label: '🪴 Repotting', days: 365 },
  { value: 'pruning', label: '✂️ Pruning', days: 30 },
  { value: 'pest_treatment', label: '🐛 Pest Treatment', days: 14 },
  { value: 'misting', label: '💦 Misting', days: 3 },
  { value: 'other', label: '📋 Other', days: 7 },
];

export default function ReminderForm({ plants, reminder, onSaved, onCancel }) {
  const [form, setForm] = useState({
    plant_id: reminder?.plant_id || '',
    care_type: reminder?.care_type || 'watering',
    frequency_days: reminder?.frequency_days || 7,
    next_due_date: reminder?.next_due_date || format(new Date(), 'yyyy-MM-dd'),
    notes: reminder?.notes || '',
    is_active: reminder?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);

  const handleCareTypeChange = (val) => {
    const def = CARE_TYPES.find(t => t.value === val);
    setForm(f => ({ ...f, care_type: val, frequency_days: def?.days || f.frequency_days }));
  };

  const handleSave = async () => {
    if (!form.plant_id || !form.care_type) return;
    setSaving(true);
    if (reminder?.id) {
      await base44.entities.CareReminder.update(reminder.id, form);
    } else {
      await base44.entities.CareReminder.create(form);
    }
    setSaving(false);
    onSaved();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#1B4332]">{reminder ? 'Edit Reminder' : 'New Care Reminder'}</h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Plant *</Label>
          <Select value={form.plant_id} onValueChange={v => setForm(f => ({ ...f, plant_id: v }))}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Select a plant" /></SelectTrigger>
            <SelectContent>
              {plants.map(p => <SelectItem key={p.id} value={p.id}>{p.plant_name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Care Type *</Label>
          <Select value={form.care_type} onValueChange={handleCareTypeChange}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CARE_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Repeat Every (days) *</Label>
          <Input
            type="number"
            min={1}
            value={form.frequency_days}
            onChange={e => setForm(f => ({ ...f, frequency_days: Number(e.target.value) }))}
            className="mt-1"
          />
        </div>

        <div>
          <Label>Next Due Date *</Label>
          <Input
            type="date"
            value={form.next_due_date}
            onChange={e => setForm(f => ({ ...f, next_due_date: e.target.value }))}
            className="mt-1"
          />
        </div>

        <div className="md:col-span-2">
          <Label>Notes</Label>
          <Textarea
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="e.g. Use liquid fertilizer at half strength"
            className="mt-1"
            rows={2}
          />
        </div>
      </div>

      <div className="flex gap-2 mt-4 justify-end">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave} disabled={saving || !form.plant_id} className="bg-[#1B4332] hover:bg-[#2D6A4F]">
          {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…</> : reminder ? 'Update' : 'Add Reminder'}
        </Button>
      </div>
    </div>
  );
}