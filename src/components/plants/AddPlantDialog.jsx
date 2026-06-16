import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Upload, Sparkles, X } from 'lucide-react';

const CATEGORIES = ['houseplant','succulent','herb','vegetable','fruit','flower','tree','shrub','vine','fern','grass','other'];
const LOCATIONS = ['indoor','outdoor','greenhouse'];
const GROWTH_STAGES = ['seedling','vegetative','budding','flowering','fruiting','dormant','mature'];

const defaultForm = {
  plant_name: '',
  species: '',
  scientific_name: '',
  plant_category: '',
  location: '',
  growth_stage: '',
  health_score: '',
  notes: '',
  image_url: '',
  planting_date: '',
};

export default function AddPlantDialog({ open, onOpenChange, onPlantAdded }) {
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [identifying, setIdentifying] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  const fileInputRef = useRef();

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setIdentifying(true);

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedFileUrl(file_url);

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Identify this plant from the image and return structured data. Be as accurate as possible.`,
        file_urls: [file_url],
        response_json_schema: {
          type: 'object',
          properties: {
            plant_name: { type: 'string' },
            species: { type: 'string' },
            scientific_name: { type: 'string' },
            plant_category: { type: 'string', enum: CATEGORIES },
            location: { type: 'string', enum: LOCATIONS },
            growth_stage: { type: 'string', enum: GROWTH_STAGES },
            notes: { type: 'string' },
          }
        }
      });

      setForm(f => ({
        ...f,
        plant_name: result.plant_name || f.plant_name,
        species: result.species || f.species,
        scientific_name: result.scientific_name || f.scientific_name,
        plant_category: CATEGORIES.includes(result.plant_category) ? result.plant_category : f.plant_category,
        location: LOCATIONS.includes(result.location) ? result.location : f.location,
        growth_stage: GROWTH_STAGES.includes(result.growth_stage) ? result.growth_stage : f.growth_stage,
        notes: result.notes || f.notes,
        image_url: file_url,
      }));
    } catch (err) {
      console.error('Plant identification failed', err);
      if (uploadedFileUrl) setForm(f => ({ ...f, image_url: uploadedFileUrl }));
    } finally {
      setIdentifying(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl('');
    setUploadedFileUrl('');
    setForm(f => ({ ...f, image_url: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    if (!form.plant_name.trim()) return;
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.health_score) delete payload.health_score;
      await base44.entities.Plant.create(payload);
      onPlantAdded?.();
      onOpenChange(false);
      setForm(defaultForm);
      setPreviewUrl('');
      setUploadedFileUrl('');
    } catch (err) {
      console.error('Failed to save plant', err);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setForm(defaultForm);
    setPreviewUrl('');
    setUploadedFileUrl('');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#1B4332]">Add New Plant</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Image upload */}
          <div>
            <Label className="mb-1 block">Photo (optional — AI will identify your plant)</Label>
            {previewUrl ? (
              <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-200">
                <img src={previewUrl} alt="Plant preview" className="w-full h-full object-cover" />
                {identifying && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2 text-white text-sm">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="flex items-center gap-1"><Sparkles className="w-4 h-4" /> Identifying plant…</span>
                  </div>
                )}
                {!identifying && (
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-[#52796F] hover:text-[#52796F] transition-colors"
              >
                <Upload className="w-6 h-6" />
                <span className="text-sm">Upload a photo</span>
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>

          {/* Plant name */}
          <div>
            <Label htmlFor="plant_name">Plant Name *</Label>
            <Input id="plant_name" value={form.plant_name} onChange={e => set('plant_name', e.target.value)} placeholder="e.g. Monstera" className="mt-1" />
          </div>

          {/* Species & Scientific name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Species</Label>
              <Input value={form.species} onChange={e => set('species', e.target.value)} placeholder="e.g. Monstera deliciosa" className="mt-1" />
            </div>
            <div>
              <Label>Scientific Name</Label>
              <Input value={form.scientific_name} onChange={e => set('scientific_name', e.target.value)} placeholder="Optional" className="mt-1" />
            </div>
          </div>

          {/* Category & Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Category</Label>
              <Select value={form.plant_category} onValueChange={v => set('plant_category', v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Location</Label>
              <Select value={form.location} onValueChange={v => set('location', v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map(l => <SelectItem key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Growth stage & Planting date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Growth Stage</Label>
              <Select value={form.growth_stage} onValueChange={v => set('growth_stage', v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  {GROWTH_STAGES.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Planting Date</Label>
              <Input type="date" value={form.planting_date} onChange={e => set('planting_date', e.target.value)} className="mt-1" />
            </div>
          </div>

          {/* Health score */}
          <div>
            <Label>Health Score (0–100)</Label>
            <Input type="number" min="0" max="100" value={form.health_score} onChange={e => set('health_score', e.target.value)} placeholder="Optional" className="mt-1" />
          </div>

          {/* Notes */}
          <div>
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any extra details…" rows={3} className="mt-1" />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={handleClose} className="flex-1">Cancel</Button>
          <Button
            onClick={handleSave}
            disabled={saving || identifying || !form.plant_name.trim()}
            className="flex-1 bg-[#1B4332] hover:bg-[#2D6A4F]"
          >
            {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving…</> : 'Save Plant'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}