import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { TrendingUp, Sparkles, Loader2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GrowthProjectionCard from '../components/analytics/GrowthProjectionCard';

export default function GrowthAnalytics() {
  const [projections, setProjections] = useState({});
  const [loading, setLoading] = useState({});
  const [analyzingAll, setAnalyzingAll] = useState(false);
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: plants = [] } = useQuery({
    queryKey: ['plants', user?.email],
    queryFn: () => base44.entities.Plant.filter({ created_by: user.email }, '-created_date', 100),
    enabled: !!user?.email,
  });

  const { data: allInterventions = [] } = useQuery({
    queryKey: ['all_interventions', user?.email],
    queryFn: () => base44.entities.Intervention.filter({ created_by: user.email }, '-date', 500),
    enabled: !!user?.email,
  });

  const { data: allImages = [] } = useQuery({
    queryKey: ['all_plant_images', user?.email],
    queryFn: () => base44.entities.PlantImage.filter({ created_by: user.email }, '-created_date', 500),
    enabled: !!user?.email,
  });

  const { data: allDiagnoses = [] } = useQuery({
    queryKey: ['all_diagnoses', user?.email],
    queryFn: () => base44.entities.Diagnosis.filter({ created_by: user.email }, '-created_date', 500),
    enabled: !!user?.email,
  });

  const { data: allSchedules = [] } = useQuery({
    queryKey: ['watering_schedules', user?.email],
    queryFn: () => base44.entities.WateringSchedule.filter({ created_by: user.email }),
    enabled: !!user?.email,
  });

  const analyzeOne = async (plant) => {
    setLoading(l => ({ ...l, [plant.id]: true }));

    const interventions = allInterventions.filter(i => i.plant_id === plant.id);
    const images = allImages.filter(i => i.plant_id === plant.id);
    const diagnoses = allDiagnoses.filter(d => d.plant_id === plant.id);
    const schedule = allSchedules.find(s => s.plant_id === plant.id);

    const imageUrls = images.slice(0, 5).map(i => i.image_url).filter(Boolean);

    const interventionSummary = interventions.slice(0, 20).map(i =>
      `[${i.date || 'unknown date'}] ${i.intervention_type}${i.product_used ? ` (${i.product_used})` : ''}${i.notes ? `: ${i.notes}` : ''}`
    ).join('\n') || 'No care log entries.';

    const diagnosisSummary = diagnoses.slice(0, 5).map(d =>
      `${d.diagnosis_type} (${d.severity}) – ${d.likely_cause || 'unknown cause'}`
    ).join('\n') || 'No diagnoses.';

    const imageSummary = images.map(i =>
      `[${i.image_type}] ${i.diagnosis_summary || ''} (confidence: ${i.ai_confidence || '?'}%)`
    ).join('\n') || 'No photos yet.';

    const today = new Date().toISOString().split('T')[0];

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert botanist and horticulturalist. Analyze the following plant data and generate a detailed growth projection.

TODAY'S DATE: ${today}

PLANT INFO:
- Name: ${plant.plant_name}
- Scientific name: ${plant.scientific_name || 'unknown'}
- Category: ${plant.plant_category || 'unknown'}
- Location: ${plant.location || 'unknown'}
- Current growth stage: ${plant.growth_stage || 'unknown'}
- Current health score: ${plant.health_score || 'unknown'}/100
- Planting/acquisition date: ${plant.planting_date || 'unknown'}

WATERING SCHEDULE:
- Frequency: every ${schedule?.frequency_days || 'unknown'} days
- Last watered: ${schedule?.last_watered_date || 'unknown'}
- Light condition: ${schedule?.light_condition || 'unknown'}

CARE LOG (most recent 20 entries):
${interventionSummary}

DIAGNOSIS HISTORY:
${diagnosisSummary}

PHOTO HISTORY:
${imageSummary}

Based on this data, generate a detailed growth projection. Be specific about timelines using actual calendar dates. If data is sparse, use botanical knowledge of the species to make reasonable estimates. Always give a prediction even with limited data.`,
      file_urls: imageUrls.length > 0 ? imageUrls : undefined,
      response_json_schema: {
        type: 'object',
        properties: {
          overall_trajectory: {
            type: 'string',
            enum: ['thriving', 'steady', 'slow', 'declining', 'recovering']
          },
          health_trend: { type: 'string', enum: ['improving', 'stable', 'declining'] },
          growth_rate: { type: 'string', enum: ['fast', 'moderate', 'slow', 'dormant'] },
          confidence: { type: 'number' },
          summary: { type: 'string' },
          milestones: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                label: { type: 'string' },
                predicted_date: { type: 'string' },
                description: { type: 'string' },
                type: { type: 'string', enum: ['bloom', 'repot', 'stage_change', 'harvest', 'pruning', 'dormancy', 'other'] },
                likelihood: { type: 'string', enum: ['high', 'medium', 'low'] }
              }
            }
          },
          care_recommendations: {
            type: 'array',
            items: { type: 'string' }
          },
          risk_factors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                risk: { type: 'string' },
                severity: { type: 'string', enum: ['low', 'moderate', 'high'] }
              }
            }
          },
          next_action: { type: 'string' },
          next_action_date: { type: 'string' }
        }
      }
    });

    setProjections(p => ({ ...p, [plant.id]: result }));
    setLoading(l => ({ ...l, [plant.id]: false }));
  };

  const analyzeAll = async () => {
    setAnalyzingAll(true);
    for (const plant of plants) {
      await analyzeOne(plant);
    }
    setAnalyzingAll(false);
  };

  const analyzedCount = Object.keys(projections).length;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1B4332] flex items-center gap-2">
            <TrendingUp className="w-6 h-6" /> Growth Analytics
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            AI-powered projections based on visual history, care logs & diagnoses
          </p>
        </div>
        {plants.length > 0 && (
          <Button
            onClick={analyzeAll}
            disabled={analyzingAll}
            className="bg-[#1B4332] hover:bg-[#2D6A4F]"
          >
            {analyzingAll
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing all…</>
              : <><Sparkles className="w-4 h-4 mr-2" /> Analyze All Plants</>
            }
          </Button>
        )}
      </div>

      {plants.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>Add plants to your collection to generate growth projections.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {analyzedCount > 0 && (
            <p className="text-xs text-gray-400">{analyzedCount} of {plants.length} plants analyzed</p>
          )}
          {plants.map(plant => (
            <GrowthProjectionCard
              key={plant.id}
              plant={plant}
              projection={projections[plant.id]}
              loading={loading[plant.id]}
              onAnalyze={() => analyzeOne(plant)}
            />
          ))}
        </div>
      )}
    </div>
  );
}