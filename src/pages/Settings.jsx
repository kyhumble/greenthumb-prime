import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Loader2, Save, User, Trash2, FileText, Shield } from 'lucide-react';
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

      {/* Legal */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mt-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Legal & Privacy</h2>
        <div className="flex flex-col gap-2">
          <Link
            to="/PrivacyPolicy"
            className="flex items-center gap-2 text-sm text-[#52796F] hover:text-[#1B4332] transition-colors"
          >
            <Shield className="w-4 h-4" /> Privacy Policy
          </Link>
          <Link
            to="/TermsOfService"
            className="flex items-center gap-2 text-sm text-[#52796F] hover:text-[#1B4332] transition-colors"
          >
            <FileText className="w-4 h-4" /> Terms of Service
          </Link>
          <a
            href="mailto:support@greenthumb.app"
            className="flex items-center gap-2 text-sm text-[#52796F] hover:text-[#1B4332] transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl border border-red-100 p-5 mt-6">
        <h2 className="text-sm font-semibold text-red-600 mb-1">Danger Zone</h2>
        <p className="text-xs text-gray-500 mb-4">Permanently delete your account and all associated data. This cannot be undone.</p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="w-4 h-4 mr-2" /> Delete Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete your account, all your plants, diagnoses, and data. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                onClick={async () => {
                  try {
                    // Delete all user data
                    const [plants, reminders, schedules, interventions, diagnoses, images, envData] = await Promise.all([
                      base44.entities.Plant.filter({ created_by: user.email }),
                      base44.entities.CareReminder.filter({ created_by: user.email }),
                      base44.entities.WateringSchedule.filter({ created_by: user.email }),
                      base44.entities.Intervention.filter({ created_by: user.email }),
                      base44.entities.Diagnosis.filter({ created_by: user.email }),
                      base44.entities.PlantImage.filter({ created_by: user.email }),
                      base44.entities.EnvironmentalData.filter({ created_by: user.email }),
                    ]);
                    await Promise.all([
                      ...plants.map(r => base44.entities.Plant.delete(r.id)),
                      ...reminders.map(r => base44.entities.CareReminder.delete(r.id)),
                      ...schedules.map(r => base44.entities.WateringSchedule.delete(r.id)),
                      ...interventions.map(r => base44.entities.Intervention.delete(r.id)),
                      ...diagnoses.map(r => base44.entities.Diagnosis.delete(r.id)),
                      ...images.map(r => base44.entities.PlantImage.delete(r.id)),
                      ...envData.map(r => base44.entities.EnvironmentalData.delete(r.id)),
                    ]);
                    toast.success('All data deleted. Signing you out...');
                    setTimeout(() => base44.auth.logout(), 1500);
                  } catch {
                    toast.error('Failed to delete data. Please contact support@greenthumb.app');
                  }
                }}
              >
                Delete My Account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}