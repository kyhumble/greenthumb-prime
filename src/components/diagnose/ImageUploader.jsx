import React, { useState } from 'react';
import { Camera, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const SLOTS = [
  { key: 'whole_plant', label: 'Full Plant', subtitle: 'Overall view', emoji: '🌿' },
  { key: 'leaf', label: 'Leaves', subtitle: 'Top & underside', emoji: '🍃' },
  { key: 'roots', label: 'Stem/Base', subtitle: 'Stem & crown', emoji: '🪴' },
  { key: 'soil', label: 'Soil', subtitle: 'Surface & drainage', emoji: '🪣' },
  { key: 'pest', label: 'Close-up', subtitle: 'Problem area', emoji: '🔍' },
];

export default function ImageUploader({ plantId, onAnalysisComplete }) {
  const [slots, setSlots] = useState({});
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState('');

  const handleSlotFile = (key, e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSlots(prev => ({ ...prev, [key]: { file, preview: URL.createObjectURL(file) } }));
  };

  const removeSlot = (key) => {
    setSlots(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  const filledSlots = Object.entries(slots);
  const hasFiles = filledSlots.length > 0;

  const handleAnalyze = async () => {
    if (!hasFiles) return;
    setAnalyzing(true);

    try {
      for (let i = 0; i < filledSlots.length; i++) {
        const [imageType, { file }] = filledSlots[i];
        setProgress(`Uploading photo ${i + 1} of ${filledSlots.length}...`);
        const { file_url } = await base44.integrations.Core.UploadFile({ file });

        setProgress(`Analyzing photo ${i + 1}...`);
        const analysis = await base44.integrations.Core.InvokeLLM({
          prompt: `You are an expert botanist and plant diagnostician. Analyze this plant image thoroughly.
Image type: ${imageType}
Provide a detailed analysis with these fields:
- species_identified, diagnosis_summary, stress_indicators (array), ai_confidence (0-100),
- observations, likely_cause, diagnosis_type (one of: pest|disease|nutrient_deficiency|water_stress|light_stress|environmental|general_health|soil_issue),
- severity (low|moderate|high|critical), recommended_actions (array), confirmation_steps (array),
- expected_recovery_time, quick_fix, detailed_explanation`,
          file_urls: [file_url],
          response_json_schema: {
            type: "object",
            properties: {
              species_identified: { type: "string" },
              diagnosis_summary: { type: "string" },
              stress_indicators: { type: "array", items: { type: "string" } },
              ai_confidence: { type: "number" },
              observations: { type: "string" },
              likely_cause: { type: "string" },
              diagnosis_type: { type: "string" },
              severity: { type: "string" },
              recommended_actions: { type: "array", items: { type: "string" } },
              confirmation_steps: { type: "array", items: { type: "string" } },
              expected_recovery_time: { type: "string" },
              quick_fix: { type: "string" },
              detailed_explanation: { type: "string" },
            }
          }
        });

        const plantImage = await base44.entities.PlantImage.create({
          image_url: file_url,
          plant_id: plantId,
          image_type: imageType,
          ai_analysis_result: JSON.stringify(analysis),
          stress_indicators: analysis.stress_indicators || [],
          ai_confidence: analysis.ai_confidence || 50,
          diagnosis_summary: analysis.diagnosis_summary || '',
          species_identified: analysis.species_identified || '',
        });

        await base44.entities.Diagnosis.create({
          plant_id: plantId,
          diagnosis_type: analysis.diagnosis_type || 'general_health',
          observations: analysis.observations || '',
          likely_cause: analysis.likely_cause || '',
          confidence_score: analysis.ai_confidence || 50,
          confirmation_steps: analysis.confirmation_steps || [],
          recommended_actions: analysis.recommended_actions || [],
          expected_recovery_time: analysis.expected_recovery_time || '',
          severity: analysis.severity || 'low',
          quick_fix: analysis.quick_fix || '',
          detailed_explanation: analysis.detailed_explanation || '',
          image_id: plantImage.id,
        });

        if (analysis.ai_confidence > 60) {
          const healthDelta = analysis.severity === 'critical' ? -30 : analysis.severity === 'high' ? -20 : analysis.severity === 'moderate' ? -10 : 0;
          if (healthDelta !== 0) {
            const plants = await base44.entities.Plant.filter({ id: plantId });
            if (plants[0]) {
              await base44.entities.Plant.update(plantId, { health_score: Math.max(0, Math.min(100, (plants[0].health_score || 75) + healthDelta)) });
            }
          }
        }
      }

      if (onAnalysisComplete) onAnalysisComplete();
    } catch (err) {
      console.error('Photo upload/analysis failed:', err);
      toast.error(err?.message || 'Failed to upload or analyze photo. Please try again.');
    } finally {
      setProgress('');
      setAnalyzing(false);

      // Revoke any object URLs used for previews to avoid memory leaks
      if (slots && typeof slots === 'object') {
        Object.values(slots).forEach(slot => {
          if (slot && typeof slot === 'object' && slot.previewUrl) {
            URL.revokeObjectURL(slot.previewUrl);
          }
        });
      }

      setSlots({});
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-[#1B4332] mb-1">📸 Upload Photos</p>
        <p className="text-xs text-gray-400">More angles = more accurate diagnosis. Upload at least one photo to get started.</p>
      </div>

      <p className="text-xs text-gray-500">Add photos from different angles for a more accurate diagnosis</p>

      {/* Photo slots */}
      <div className="grid grid-cols-5 gap-2">
        {SLOTS.map(slot => {
          const filled = slots[slot.key];
          return (
            <div key={slot.key} className="flex flex-col items-center gap-1">
              <div className="relative w-full aspect-square">
                {filled ? (
                  <div className="relative w-full h-full rounded-xl overflow-hidden border-2 border-[#52796F]">
                    <img src={filled.preview} alt={slot.label} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeSlot(slot.key)}
                      className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#52796F] hover:bg-[#52796F]/5 transition-all">
                    <span className="text-2xl mb-1">{slot.emoji}</span>
                    <span className="text-lg text-gray-300 font-light">+</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleSlotFile(slot.key, e)} disabled={analyzing} />
                  </label>
                )}
              </div>
              <p className="text-[10px] font-medium text-gray-700 text-center leading-tight">{slot.label}</p>
              <p className="text-[9px] text-gray-400 text-center leading-tight">{slot.subtitle}</p>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 text-center">At minimum, upload a full plant photo. More photos = more accurate diagnosis.</p>

      <Button
        onClick={handleAnalyze}
        disabled={!hasFiles || analyzing}
        className="w-full bg-[#1B4332] hover:bg-[#2D6A4F] h-12 text-base"
      >
        {analyzing ? (
          <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> {progress}</>
        ) : (
          <><Camera className="w-5 h-5 mr-2" /> Analyze {hasFiles ? `(${filledSlots.length} photo${filledSlots.length > 1 ? 's' : ''})` : ''}</>
        )}
      </Button>
    </div>
  );
}