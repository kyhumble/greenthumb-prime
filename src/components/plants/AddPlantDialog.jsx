import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { Loader2, Upload, Lock, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const FREE_PLANT_LIMIT = 3;

const categories = ['houseplant', 'succulent', 'herb', 'vegetable', 'fruit', 'flower', 'tree', 'shrub', 'vine', 'fern', 'grass', 'other'];
const locations = ['indoor', 'outdoor', 'greenhouse'];
const stages = ['seedling', 'vegetative', 'budding', 'flowering', 'fruiting', 'dormant', 'mature'];

export default function AddPlantDialog({ open, onOpenChange, onPlantAdded, plantCount = 0, user = null }) {
  const [form, setForm] = useState({ plant_name: '', species: '', scientific_name: '', plant_category: '', location: '', growth_stage: '', notes: '' });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  const isPaid = ['active', 'trialing'].includes(user?.subscription_status);
  const isAtLimit = !isPaid && plantCount >= FREE_PLANT_LIMIT;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!form.plant_name) return;
    setSaving(true);
    let image_url = '';
    if (imageFile) {
      const result = await base44.integrations.Core.UploadFile({ file: imageFile });
      image_url = result.file_url;
    }
    const plant = await base44.entities.Plant.create({
      ...form,
      image_url,
      health_score: 75,
      planting_date: new Date().toISOString().split('T')[0],
    });
    setSaving(false);
    setForm({ plant_name: '', species: '', scientific_name: '', plant_category: '', location: '', growth_stage: '', notes: '' });
    setImageFile(null);
    setPreview(null);
    onOpenChange(false);
    if (onPlantAdded) onPlantAdded(plant);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#1B4332]">Add New Plant</DialogTitle>
        </DialogHeader>
        {isAtLimit ? (
          <div className="flex flex-col items-center text-center py-8 px-4">
            <div className="w-12 h-12 rounded-2xl bg-[#1B4332]/10 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-[#1B4332]" />
            </div>
            <h3 className="font-semibold text-[#1B4332] mb-1">Free plan limit reached</h3>
            <p className="text-sm text-gray-500 mb-5">You've used all {FREE_PLANT_LIMIT} free plant slots. Upgrade to add unlimited plants.</p>
            <Link to="/Pricing" onClick={() => onOpenChange(false)}>
              <Button className="bg-[#1B4332] hover:bg-[#2D6A4F]">
                <Zap className="w-4 h-4 mr-2" /> Upgrade — Start Free Trial
              </Button>
            </Link>
            <p className="text-xs text-gray-400 mt-3">7-day free trial · Cancel anytime</p>
          </div>
        ) : (
        <div className="space-y-4 mt-2">
          {/* Image upload */}
          <div>
            <Label>Plant Photo</Label>
            <div className="mt-1.5">
              {preview ? (
                <div className="relative rounded-xl overflow-hidden aspect-video">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  <button onClick={() => { setImageFile(null); setPreview(null); }} className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">×</button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#52796F] transition-colors">
                  <Upload className="w-6 h-6 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500">Upload a photo</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              )}
            </div>
          </div>

          <div>
            <Label>Plant Name *</Label>
            <Input value={form.plant_name} onChange={(e) => setForm({ ...form, plant_name: e.target.value })} placeholder="e.g. My Monstera" className="mt-1" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Species</Label>
              <Input value={form.species} onChange={(e) => setForm({ ...form, species: e.target.value })} placeholder="e.g. Monstera" className="mt-1" />
            </div>
            <div>
              <Label>Scientific Name</Label>
              <Input value={form.scientific_name} onChange={(e) => setForm({ ...form, scientific_name: e.target.value })} placeholder="e.g. Monstera deliciosa" className="mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Category</Label>
              <Select value={form.plant_category} onValueChange={(v) => setForm({ ...form, plant_category: v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Location</Label>
              <Select value={form.location} onValueChange={(v) => setForm({ ...form, location: v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {locations.map(l => <SelectItem key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Growth Stage</Label>
              <Select value={form.growth_stage} onValueChange={(v) => setForm({ ...form, growth_stage: v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {stages.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any notes about this plant..." className="mt-1" rows={2} />
          </div>

          <Button onClick={handleSave} disabled={saving || !form.plant_name} className="w-full bg-[#1B4332] hover:bg-[#2D6A4F]">
            {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : 'Add Plant'}
          </Button>
        </div>
        )}
      </DialogContent>
    </Dialog>
  );
}