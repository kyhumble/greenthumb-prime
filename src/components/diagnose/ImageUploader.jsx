import React, { useState, useCallback } from 'react';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';

const imageTypes = [
  { value: 'whole_plant', label: 'Whole Plant' },
  { value: 'leaf', label: 'Leaf Close-up' },
  { value: 'soil', label: 'Soil Surface' },
  { value: 'roots', label: 'Roots' },
  { value: 'pest', label: 'Pest/Bug' },
  { value: 'garden_bed', label: 'Garden Bed' },
  { value: 'light_assessment', label: 'Light Assessment' },
];

export default function ImageUploader({ plantId, onAnalysisComplete }) {
  const [files, setFiles] = useState([]);
  const [imageType, setImageType] = useState('whole_plant');
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState('');

  const handleFiles = (e) => {
    const newFiles = Array.from(e.target.files).map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (files.length === 0) return;
    setAnalyzing(true);

    for (let i = 0; i < files.length; i++) {
      setProgress(`Uploading image ${i + 1} of ${files.length}...`);
      const { file_url } = await base44.integrations.Core.UploadFile({ file: files[i].file });

      setProgress(`Analyzing image ${i + 1}...`);
      const analysisPrompt = `You are an expert botanist and plant diagnostician. Analyze this plant image thoroughly.

Image type: ${imageType}

Provide a detailed analysis in JSON format with these fields:
- species_identified: string (best guess of plant species)
- diagnosis_summary: string (1-2 sentence summary)
- stress_indicators: array of strings (any stress signs detected)
- ai_confidence: number (0-100, your confidence level)
- observations: string (detailed observations)
- likely_cause: string (if issues detected, the likely cause)
- diagnosis_type: one of "pest", "disease", "nutrient_deficiency", "water_stress", "light_stress", "environmental", "general_health", "soil_issue"
- severity: one of "low", "moderate", "high", "critical"
- recommended_actions: array of strings (what to do)
- confirmation_steps: array of strings (how to confirm the diagnosis)
- expected_recovery_time: string (if treatment needed)
- quick_fix: string (brief actionable advice)
- detailed_explanation: string (in-depth scientific explanation of the issue and plant biology involved)
- light_analysis: object with { intensity: string, sun_hours_estimate: string, placement_recommendations: string } (only if image_type is light_assessment)
- soil_analysis: object with { texture: string, moisture: string, compaction: string, amendments: string } (only if image_type is soil)`;

      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: analysisPrompt,
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
            light_analysis: { type: "object", properties: { intensity: { type: "string" }, sun_hours_estimate: { type: "string" }, placement_recommendations: { type: "string" } } },
            soil_analysis: { type: "object", properties: { texture: { type: "string" }, moisture: { type: "string" }, compaction: { type: "string" }, amendments: { type: "string" } } },
          }
        }
      });

      // Save plant image
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

      // Save diagnosis
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

      // Update plant health score
      if (analysis.ai_confidence > 60) {
        const healthDelta = analysis.severity === 'critical' ? -30 : analysis.severity === 'high' ? -20 : analysis.severity === 'moderate' ? -10 : 0;
        if (healthDelta !== 0) {
          const plant = (await base44.entities.Plant.filter({ id: plantId }))[0];
          if (plant) {
            const newScore = Math.max(0, Math.min(100, (plant.health_score || 75) + healthDelta));
            await base44.entities.Plant.update(plantId, { health_score: newScore });
          }
        }
      }
    }

    setProgress('');
    setAnalyzing(false);
    setFiles([]);
    if (onAnalysisComplete) onAnalysisComplete();
  };

  return (
    <div className="space-y-4">
      {/* Upload area */}
      <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-[#52796F]/30 rounded-2xl cursor-pointer hover:border-[#52796F] hover:bg-[#52796F]/5 transition-all duration-200">
        <Camera className="w-10 h-10 text-[#52796F]/50 mb-2" />
        <span className="text-sm font-medium text-[#52796F]">Take or upload a photo</span>
        <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</span>
        <input type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} disabled={analyzing} />
      </label>

      {/* Previews */}
      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {files.map((f, i) => (
            <div key={i} className="relative rounded-xl overflow-hidden aspect-square">
              <img src={f.preview} alt="" className="w-full h-full object-cover" />
              <button onClick={() => removeFile(i)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Image type selector */}
      <div>
        <Label className="text-xs text-gray-500">Image Type</Label>
        <Select value={imageType} onValueChange={setImageType}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            {imageTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Analyze button */}
      <Button 
        onClick={handleAnalyze} 
        disabled={files.length === 0 || analyzing} 
        className="w-full bg-[#1B4332] hover:bg-[#2D6A4F] h-12 text-base"
      >
        {analyzing ? (
          <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> {progress}</>
        ) : (
          <><Camera className="w-5 h-5 mr-2" /> Analyze {files.length > 0 ? `(${files.length} photo${files.length > 1 ? 's' : ''})` : ''}</>
        )}
      </Button>
    </div>
  );
}