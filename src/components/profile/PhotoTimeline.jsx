import React, { useState } from 'react';
import { format, differenceInDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Leaf, Upload, X, Loader2, Camera, ZoomIn } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const IMAGE_TYPE_LABELS = {
  whole_plant: '🌿 Full Plant', leaf: '🍃 Leaves', roots: '🪴 Stem/Base',
  soil: '🪣 Soil', pest: '🔍 Close-up', garden_bed: '🌱 Garden', light_assessment: '☀️ Light',
};

const STAGE_COLORS = {
  seedling: 'bg-lime-100 text-lime-700',
  vegetative: 'bg-green-100 text-green-700',
  budding: 'bg-yellow-100 text-yellow-700',
  flowering: 'bg-pink-100 text-pink-700',
  fruiting: 'bg-orange-100 text-orange-700',
  dormant: 'bg-gray-100 text-gray-500',
  mature: 'bg-emerald-100 text-emerald-700',
};

function groupByMonth(images) {
  const groups = {};
  images.forEach(img => {
    const key = img.created_date ? format(new Date(img.created_date), 'MMMM yyyy') : 'Unknown';
    if (!groups[key]) groups[key] = [];
    groups[key].push(img);
  });
  return Object.entries(groups);
}

export default function PhotoTimeline({ images, plantId, plant, onUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);
  const queryClient = useQueryClient();

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.PlantImage.create({
      image_url: file_url,
      plant_id: plantId,
      image_type: 'whole_plant',
    });
    queryClient.invalidateQueries({ queryKey: ['plantImages', plantId] });
    if (onUploaded) onUploaded();
    setUploading(false);
    e.target.value = '';
  };

  const grouped = groupByMonth([...images].sort((a, b) => new Date(a.created_date) - new Date(b.created_date)));
  const daysSincePlanted = plant?.planting_date
    ? differenceInDays(new Date(), new Date(plant.planting_date))
    : null;

  return (
    <div className="space-y-6">
      {/* Header with stats + upload */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#1B4332]">{images.length}</p>
            <p className="text-xs text-gray-400">Photos</p>
          </div>
          {daysSincePlanted !== null && (
            <div className="text-center">
              <p className="text-2xl font-bold text-[#1B4332]">{daysSincePlanted}</p>
              <p className="text-xs text-gray-400">Days growing</p>
            </div>
          )}
          {grouped.length > 0 && (
            <div className="text-center">
              <p className="text-2xl font-bold text-[#1B4332]">{grouped.length}</p>
              <p className="text-xs text-gray-400">Months tracked</p>
            </div>
          )}
        </div>
        <label className="cursor-pointer">
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed transition-all text-sm font-medium
            ${uploading ? 'border-gray-200 text-gray-400' : 'border-[#52796F] text-[#52796F] hover:bg-[#52796F]/5'}`}>
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? 'Uploading…' : 'Add Photo'}
          </div>
        </label>
      </div>

      {/* Empty state */}
      {images.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <Camera className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500">Start your growth timeline</p>
          <p className="text-xs text-gray-400 mt-1">Upload your first photo to begin tracking visual progress</p>
        </div>
      )}

      {/* Timeline */}
      {grouped.map(([month, imgs], groupIdx) => (
        <div key={month} className="relative">
          {/* Month label with connector */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-3 h-3 rounded-full bg-[#52796F] flex-shrink-0 ring-4 ring-[#52796F]/10" />
            <h4 className="text-sm font-semibold text-[#1B4332]">{month}</h4>
            <span className="text-xs text-gray-400">{imgs.length} photo{imgs.length > 1 ? 's' : ''}</span>
            {/* Vertical line connecting to next group */}
            {groupIdx < grouped.length - 1 && (
              <div className="absolute left-1 top-7 w-px bg-[#52796F]/20" style={{ height: 'calc(100% - 12px)' }} />
            )}
          </div>

          <div className="pl-6 grid grid-cols-2 md:grid-cols-3 gap-3">
            {imgs.map(img => (
              <div
                key={img.id}
                className="group relative rounded-xl overflow-hidden bg-gray-100 cursor-pointer"
                style={{ aspectRatio: '4/3' }}
                onClick={() => setLightboxImg(img)}
              >
                <img src={img.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-2 left-2 right-2 space-y-1">
                    <p className="text-white text-[10px] font-medium">{IMAGE_TYPE_LABELS[img.image_type] || img.image_type}</p>
                    {img.diagnosis_summary && (
                      <p className="text-white/80 text-[10px] line-clamp-2">{img.diagnosis_summary}</p>
                    )}
                  </div>
                  <ZoomIn className="absolute top-2 right-2 w-4 h-4 text-white/80" />
                </div>
                {img.ai_confidence && (
                  <div className="absolute top-2 left-2">
                    <span className="bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                      {img.ai_confidence}%
                    </span>
                  </div>
                )}
                <div className="absolute bottom-2 right-2 text-[10px] text-white/70 opacity-0 group-hover:opacity-100">
                  {img.created_date ? format(new Date(img.created_date), 'MMM d') : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Lightbox */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxImg(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white"
            onClick={() => setLightboxImg(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-3xl w-full" onClick={e => e.stopPropagation()}>
            <img src={lightboxImg.image_url} alt="" className="w-full max-h-[70vh] object-contain rounded-xl" />
            <div className="mt-3 text-center space-y-1">
              <p className="text-white text-sm font-medium">{IMAGE_TYPE_LABELS[lightboxImg.image_type] || lightboxImg.image_type}</p>
              {lightboxImg.created_date && (
                <p className="text-white/50 text-xs">{format(new Date(lightboxImg.created_date), 'MMMM d, yyyy')}</p>
              )}
              {lightboxImg.diagnosis_summary && (
                <p className="text-white/70 text-sm mt-2 max-w-lg mx-auto">{lightboxImg.diagnosis_summary}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}