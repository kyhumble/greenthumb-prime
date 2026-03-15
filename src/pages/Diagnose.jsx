import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import FeatureGate from '../components/subscription/FeatureGate';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Camera, Leaf, Plus } from 'lucide-react';
import ImageUploader from '../components/diagnose/ImageUploader';
import DiagnosisCard from '../components/diagnose/DiagnosisCard';
import AddPlantDialog from '../components/plants/AddPlantDialog';

export default function Diagnose() {
  const [selectedPlantId, setSelectedPlantId] = useState('');
  const [showAddPlant, setShowAddPlant] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [mode, setMode] = useState('quick_fix');
  const [user, setUser] = useState(null);
  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const { data: plants = [], refetch: refetchPlants } = useQuery({
    queryKey: ['plants'],
    queryFn: () => base44.entities.Plant.list('-created_date', 100),
  });

  const { data: diagnoses = [], refetch: refetchDiagnoses } = useQuery({
    queryKey: ['diagnoses', selectedPlantId],
    queryFn: () => selectedPlantId ? base44.entities.Diagnosis.filter({ plant_id: selectedPlantId }, '-created_date', 10) : [],
    enabled: !!selectedPlantId,
  });

  const handleAnalysisComplete = () => {
    setShowResults(true);
    refetchDiagnoses();
  };

  return (
    <FeatureGate user={user} featureName="AI Plant Diagnostics">
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1B4332] flex items-center gap-2">
          <Camera className="w-6 h-6" /> AI Plant Diagnostics
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Upload a photo and let AI diagnose your plant's health
        </p>
      </div>

      {/* Mode toggle */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#1B4332]">Learning Mode</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {mode === 'quick_fix' ? 'Short, actionable steps' : 'Detailed scientific explanations'}
            </p>
          </div>
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setMode('quick_fix')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mode === 'quick_fix' ? 'bg-white text-[#1B4332] shadow-sm' : 'text-gray-500'}`}
            >
              Quick Fix
            </button>
            <button
              onClick={() => setMode('mastery')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mode === 'mastery' ? 'bg-white text-[#1B4332] shadow-sm' : 'text-gray-500'}`}
            >
              Mastery
            </button>
          </div>
        </div>
      </div>

      {/* Select Plant */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
        <Label className="text-sm font-medium text-[#1B4332]">Select Plant</Label>
        <div className="flex gap-2 mt-2">
          <Select value={selectedPlantId} onValueChange={setSelectedPlantId}>
            <SelectTrigger className="flex-1"><SelectValue placeholder="Choose a plant..." /></SelectTrigger>
            <SelectContent>
              {plants.map(p => (
                <SelectItem key={p.id} value={p.id}>
                  {p.plant_name} {p.species ? `(${p.species})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => setShowAddPlant(true)}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Image Upload */}
      {selectedPlantId && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
          <ImageUploader plantId={selectedPlantId} onAnalysisComplete={handleAnalysisComplete} />
        </div>
      )}

      {/* Results */}
      {selectedPlantId && diagnoses.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#1B4332]">Diagnosis Results</h2>
          {diagnoses.map(d => (
            <DiagnosisCard key={d.id} diagnosis={d} mode={mode} />
          ))}
        </div>
      )}

      <AddPlantDialog open={showAddPlant} onOpenChange={setShowAddPlant} onPlantAdded={(p) => { refetchPlants(); setSelectedPlantId(p.id); }} />
    </div>
    </FeatureGate>
  );
}