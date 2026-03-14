import React from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Leaf } from 'lucide-react';

export default function PlantGallery({ images }) {
  if (!images || images.length === 0) {
    return (
      <div className="text-center py-12">
        <Leaf className="w-10 h-10 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-400">No images yet. Upload a photo to get AI analysis.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {images.map(img => (
        <div key={img.id} className="group relative rounded-xl overflow-hidden aspect-square bg-gray-100">
          <img src={img.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-3 left-3 right-3">
              <Badge variant="secondary" className="bg-white/20 text-white text-xs backdrop-blur-sm">
                {img.image_type?.replace(/_/g, ' ')}
              </Badge>
              {img.diagnosis_summary && (
                <p className="text-white text-xs mt-1 line-clamp-2">{img.diagnosis_summary}</p>
              )}
            </div>
          </div>
          {img.ai_confidence && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-black/50 text-white text-[10px] backdrop-blur-sm">
                {img.ai_confidence}%
              </Badge>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}