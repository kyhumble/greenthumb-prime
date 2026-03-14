import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { ArrowLeft, Camera, Leaf, MapPin, Calendar, Edit2, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import HealthScoreBadge from '../components/plants/HealthScoreBadge';
import PlantGallery from '../components/profile/PlantGallery';
import PhotoTimeline from '../components/profile/PhotoTimeline';
import DiagnosisCard from '../components/diagnose/DiagnosisCard';
import InterventionTimeline from '../components/profile/InterventionTimeline';
import ImageUploader from '../components/diagnose/ImageUploader';

export default function PlantProfile() {
  const urlParams = new URLSearchParams(window.location.search);
  const plantId = urlParams.get('id');
  const [mode, setMode] = useState('quick_fix');
  const [showUploader, setShowUploader] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (u?.learning_mode) setMode(u.learning_mode);
    }).catch(() => {});
  }, []);

  const { data: plants = [], refetch: refetchPlant } = useQuery({
    queryKey: ['plant', plantId],
    queryFn: () => base44.entities.Plant.filter({ id: plantId }),
    enabled: !!plantId,
  });
  const plant = plants[0];

  const { data: images = [], refetch: refetchImages } = useQuery({
    queryKey: ['plantImages', plantId],
    queryFn: () => base44.entities.PlantImage.filter({ plant_id: plantId }, '-created_date', 50),
    enabled: !!plantId,
  });

  const { data: diagnoses = [], refetch: refetchDiagnoses } = useQuery({
    queryKey: ['diagnoses', plantId],
    queryFn: () => base44.entities.Diagnosis.filter({ plant_id: plantId }, '-created_date', 20),
    enabled: !!plantId,
  });

  const { data: interventions = [], refetch: refetchInterventions } = useQuery({
    queryKey: ['interventions', plantId],
    queryFn: () => base44.entities.Intervention.filter({ plant_id: plantId }, '-created_date', 20),
    enabled: !!plantId,
  });

  if (!plant) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const handleRefreshAll = () => {
    refetchPlant();
    refetchImages();
    refetchDiagnoses();
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Back button */}
      <Link to="/Plants" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#1B4332] mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to plants
      </Link>

      {/* Hero section */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
        <div className="relative h-48 md:h-64 bg-gradient-to-br from-[#E8DCC8]/40 to-[#52796F]/20">
          {plant.image_url ? (
            <img src={plant.image_url} alt={plant.plant_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Leaf className="w-16 h-16 text-[#52796F]/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        <div className="p-5 md:p-6 -mt-12 relative">
          <div className="flex items-end gap-4">
            <HealthScoreBadge score={plant.health_score} size="lg" />
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-bold text-[#1B4332]">{plant.plant_name}</h1>
              {plant.scientific_name && (
                <p className="text-sm text-gray-500 italic">{plant.scientific_name}</p>
              )}
            </div>
            <Link to={`/Diagnose`}>
              <Button size="sm" className="bg-[#1B4332] hover:bg-[#2D6A4F]">
                <Camera className="w-4 h-4 mr-1" /> Diagnose
              </Button>
            </Link>
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap gap-3 mt-4">
            {plant.plant_category && (
              <Badge variant="secondary" className="bg-[#52796F]/10 text-[#52796F] capitalize">{plant.plant_category}</Badge>
            )}
            {plant.location && (
              <Badge variant="outline" className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {plant.location}</Badge>
            )}
            {plant.growth_stage && (
              <Badge variant="outline" className="capitalize">{plant.growth_stage}</Badge>
            )}
            {plant.planting_date && (
              <Badge variant="outline" className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {format(new Date(plant.planting_date), 'MMM d, yyyy')}</Badge>
            )}
          </div>
          {plant.notes && <p className="text-sm text-gray-500 mt-3">{plant.notes}</p>}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="gallery" className="space-y-4">
        <TabsList className="bg-white border border-gray-100 p-1 rounded-xl">
          <TabsTrigger value="gallery" className="rounded-lg text-xs">Gallery ({images.length})</TabsTrigger>
          <TabsTrigger value="diagnoses" className="rounded-lg text-xs">Diagnoses ({diagnoses.length})</TabsTrigger>
          <TabsTrigger value="interventions" className="rounded-lg text-xs">Care Log ({interventions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="gallery">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#1B4332]">Photo Gallery</h3>
              <Button variant="outline" size="sm" onClick={() => setShowUploader(!showUploader)}>
                <Camera className="w-3 h-3 mr-1" /> Upload
              </Button>
            </div>
            {showUploader && (
              <div className="mb-6 bg-gray-50 rounded-xl p-4">
                <ImageUploader plantId={plantId} onAnalysisComplete={handleRefreshAll} />
              </div>
            )}
            <PlantGallery images={images} />
          </div>
        </TabsContent>

        <TabsContent value="diagnoses">
          <div className="space-y-3">
            {/* Mode toggle */}
            <div className="flex items-center justify-end gap-2">
              <span className="text-xs text-gray-400">Mode:</span>
              <div className="flex bg-gray-100 rounded-lg p-0.5">
                <button onClick={() => setMode('quick_fix')} className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${mode === 'quick_fix' ? 'bg-white text-[#1B4332] shadow-sm' : 'text-gray-500'}`}>Quick Fix</button>
                <button onClick={() => setMode('mastery')} className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${mode === 'mastery' ? 'bg-white text-[#1B4332] shadow-sm' : 'text-gray-500'}`}>Mastery</button>
              </div>
            </div>
            {diagnoses.length > 0 ? (
              diagnoses.map(d => <DiagnosisCard key={d.id} diagnosis={d} mode={mode} />)
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                <p className="text-sm text-gray-400">No diagnoses yet. Upload a photo to get AI analysis.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="interventions">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <InterventionTimeline interventions={interventions} plantId={plantId} onAdded={refetchInterventions} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}