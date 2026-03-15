import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { Loader2, Upload, Lock, Zap, Sparkles } from 'lucide-react';
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
  const [autoFilling, setAutoFilling] = useState(false);
  const [identifying, setIdentifying] = useState(false);

  const handleAutoFill = async () => {
    if (!form.plant_name) return;
    setAutoFilling(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Given the plant name "${form.plant_name}", return its details. If it's a nickname or common name, resolve it. Be concise and accurate.`,
      response_json_schema: {
        type: 'object',
        properties: {
          species: { type: 'string' },
          scientific_name: { type: 'string' },
          plant_category: { type: 'string', enum: ['houseplant','succulent','herb','vegetable','fruit','flower','tree','shrub','vine','fern','grass','other'] },
        }
      }
    });
    setForm(f => ({
      ...f,
      species: result.species || f.species,
      scientific_name: result.scientific_name || f.scientific_name,
      plant_category: result.plant_category || f.plant_category,
    }));
    setAutoFilling(false);
  };

  const isPaid = ['active', 'trialing'].includes(user?.subscription_status) || user?.role === 'admin';
  const isAtLimit = !isPaid && plantCount >= FREE_PLANT_LIMIT;

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));

    // Auto-identify the plant from the photo
    setIdentifying(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Identify the plant in this image. Return its common name, species, scientific name, and category. Be concise and accurate.`,
      file_urls: [file_url],
      response_json_schema: {
        type: 'object',
        properties: {
          plant_name: { type: 'string' },
          species: { type: 'string' },
          scientific_name: { type: 'string' },
          plant_category: { type: 'string', enum: ['houseplant','succulent','herb','vegetable','fruit','flower','tree','shrub','vine','fern','grass','other'] },
        }
      }
    });
    setForm(f => ({
      ...f,
      plant_name: result.plant_name || f.plant_name,
      species: result.species || f.species,
      scientific_name: result.scientific_name || f.scientific_name,
      plant_category: result.plant_category || f.plant_category,
    }));
    setIdentifying(false);
  };

  const handleSave = async () => {
    if (!form.plant_name) return;
    setSaving(true);
    try {
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
      setForm({ plant_name: '', species: '', scientific_name: '', plant_category: '', location: '', growth_stage: '', notes: '' });
      setImageFile(null);
      setPreview(null);
      onOpenChange(false);
      if (onPlantAdded) onPlantAdded(plant);
    } catch (err) {
      console.error('Failed to save plant:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#1B4332]">Add New Plant</DialogTitle>
        </DialogHeader>
        {isAtLimit ? (
          <div className="flex flex-col items-center text-center py-8 px-4 space-y-0">
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
                  {identifying ? (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                      <span className="text-white text-xs font-medium">Identifying plant...</span>
                    </div>
                  ) : (
                    <button onClick={() => { setImageFile(null); setPreview(null); setForm(f => ({ ...f, plant_name: '', species: '', scientific_name: '', plant_category: '' })); }} className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">×</button>
                  )}
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#52796F] transition-colors">
                  <Upload className="w-6 h-6 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500">Upload a photo</span>
                  <span className="text-xs text-[#52796F] mt-0.5">AI will identify the plant for you</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              )}
            </div>
          </div>

          <div>
            <Label>Plant Name *</Label>
            <div className="flex gap-2 mt-1">
              <Input value={form.plant_name} onChange={(e) => setForm({ ...form, plant_name: e.target.value })} placeholder="e.g. Monstera, Basil, Snake Plant…" className="flex-1" />
              <Button type="button" variant="outline" onClick={handleAutoFill} disabled={!form.plant_name || autoFilling} className="shrink-0 border-[#52796F] text-[#52796F] hover:bg-[#52796F]/5">
                {autoFilling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              </Button>
            </div>
            {(form.species || form.scientific_name) && (
              <p className="text-xs text-[#52796F] mt-1.5">{form.scientific_name}{form.species && form.scientific_name ? ` · ` : ''}{form.species}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">Hit ✨ to auto-fill details from the plant name</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
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
              <Label>Where is it?</Label>
              <Select value={form.location} onValueChange={(v) => setForm({ ...form, location: v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {locations.map(l => <SelectItem key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any notes about this plant..." className="mt-1" rows={2} />
          </div>

          <Button onClick={handleSave} disabled={saving || identifying || !form.plant_name} className="w-full bg-[#1B4332] hover:bg-[#2D6A4F]">
            {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : 'Add Plant'}
          </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}