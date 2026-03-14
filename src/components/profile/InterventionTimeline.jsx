import React, { useState } from 'react';
import { format } from 'date-fns';
import { Droplets, Scissors, Bug, Sun, Flower2, Package, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';

const typeIcons = {
  watering: Droplets, fertilizing: Flower2, repotting: Package,
  pruning: Scissors, pest_treatment: Bug, light_adjustment: Sun,
  soil_amendment: Package, other: Flower2,
};

const typeColors = {
  watering: 'bg-blue-100 text-blue-600',
  fertilizing: 'bg-green-100 text-green-600',
  repotting: 'bg-amber-100 text-amber-600',
  pruning: 'bg-purple-100 text-purple-600',
  pest_treatment: 'bg-red-100 text-red-600',
  light_adjustment: 'bg-yellow-100 text-yellow-600',
  soil_amendment: 'bg-orange-100 text-orange-600',
  other: 'bg-gray-100 text-gray-600',
};

export default function InterventionTimeline({ interventions, plantId, onAdded }) {
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    intervention_type: 'watering', product_used: '', quantity: '', notes: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.Intervention.create({ ...form, plant_id: plantId });
    setSaving(false);
    setShowAdd(false);
    setForm({ intervention_type: 'watering', product_used: '', quantity: '', notes: '', date: new Date().toISOString().split('T')[0] });
    if (onAdded) onAdded();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#1B4332]">Intervention History</h3>
        <Button variant="outline" size="sm" onClick={() => setShowAdd(true)}>
          <Plus className="w-3 h-3 mr-1" /> Log
        </Button>
      </div>

      {interventions?.length > 0 ? (
        <div className="space-y-3">
          {interventions.map(inter => {
            const Icon = typeIcons[inter.intervention_type] || Flower2;
            const color = typeColors[inter.intervention_type] || typeColors.other;
            return (
              <div key={inter.id} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium capitalize">{inter.intervention_type?.replace(/_/g, ' ')}</p>
                  {inter.product_used && <p className="text-xs text-gray-500">{inter.product_used} {inter.quantity ? `— ${inter.quantity}` : ''}</p>}
                  {inter.notes && <p className="text-xs text-gray-400 mt-0.5">{inter.notes}</p>}
                </div>
                <span className="text-xs text-gray-400">{inter.date ? format(new Date(inter.date), 'MMM d') : ''}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-6">No interventions logged yet.</p>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Log Intervention</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label>Type</Label>
              <Select value={form.intervention_type} onValueChange={(v) => setForm({ ...form, intervention_type: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.keys(typeIcons).map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Product Used</Label>
                <Input value={form.product_used} onChange={(e) => setForm({ ...form, product_used: e.target.value })} className="mt-1" placeholder="Optional" />
              </div>
              <div>
                <Label>Quantity</Label>
                <Input value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="mt-1" placeholder="e.g. 200ml" />
              </div>
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="mt-1" rows={2} />
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full bg-[#1B4332] hover:bg-[#2D6A4F]">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}