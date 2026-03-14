import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, User } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    location: '', climate_zone: '', growing_environment: '',
    skill_level: '', gardening_goals: '', learning_mode: 'quick_fix',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setForm({
        location: u.location || '',
        climate_zone: u.climate_zone || '',
        growing_environment: u.growing_environment || '',
        skill_level: u.skill_level || '',
        gardening_goals: u.gardening_goals || '',
        learning_mode: u.learning_mode || 'quick_fix',
      });
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe(form);
    setSaving(false);
    toast.success('Settings saved!');
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1B4332]">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Customize your GreenThumb experience</p>
      </div>

      {user && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#52796F]/10 flex items-center justify-center">
            <User className="w-6 h-6 text-[#52796F]" />
          </div>
          <div>
            <p className="font-semibold text-[#1B4332]">{user.full_name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Location (City / ZIP)</Label>
            <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="mt-1" placeholder="e.g. Portland, OR" />
          </div>
          <div>
            <Label>Climate Zone</Label>
            <Input value={form.climate_zone} onChange={(e) => setForm({ ...form, climate_zone: e.target.value })} className="mt-1" placeholder="e.g. USDA Zone 8b" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Growing Environment</Label>
            <Select value={form.growing_environment} onValueChange={(v) => setForm({ ...form, growing_environment: v })}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="indoor">Indoor</SelectItem>
                <SelectItem value="outdoor">Outdoor</SelectItem>
                <SelectItem value="greenhouse">Greenhouse</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Skill Level</Label>
            <Select value={form.skill_level} onValueChange={(v) => setForm({ ...form, skill_level: v })}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Default Learning Mode</Label>
          <Select value={form.learning_mode} onValueChange={(v) => setForm({ ...form, learning_mode: v })}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="quick_fix">Quick Fix — Short actionable steps</SelectItem>
              <SelectItem value="mastery">Mastery — Detailed scientific explanations</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Gardening Goals</Label>
          <Textarea value={form.gardening_goals} onChange={(e) => setForm({ ...form, gardening_goals: e.target.value })} className="mt-1" rows={3} placeholder="What are you hoping to achieve with your garden?" />
        </div>

        <Button onClick={handleSave} disabled={saving} className="bg-[#1B4332] hover:bg-[#2D6A4F]">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Settings
        </Button>
      </div>
    </div>
  );
}