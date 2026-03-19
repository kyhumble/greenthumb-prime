import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const ROOT_PATHS = ['/Dashboard', '/Plants', '/Diagnose', '/Schedule', '/Encyclopedia'];

const PAGE_TITLES = {
  '/PlantProfile': 'Plant Profile',
  '/Learn': 'Learn',
  '/GrowthAnalytics': 'Growth Analytics',
  '/Settings': 'Settings',
  '/Library': 'Library',
  '/Agents': 'AI Agents',
};

export default function MobileHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const isRoot = ROOT_PATHS.some(p => location.pathname === p);

  return (
    <header
      className="sm:hidden bg-[#FDF8F0] border-b border-gray-100 sticky top-0 z-40"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex items-center h-12 px-4">
        {!isRoot && (
          <button
            onClick={() => navigate(-1)}
            className="mr-2 -ml-1 p-1.5 rounded-lg active:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5 text-[#1B4332]" />
          </button>
        )}
        <div className="flex-1">
          {isRoot ? (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b58c93938d13c9af653602/39bf079b2_generated_image.png"
                  alt="GreenThumb Prime"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-semibold text-sm text-[#1B4332]">GreenThumb Prime</span>
            </div>
          ) : (
            <span className="font-semibold text-[#1B4332]">
              {PAGE_TITLES[location.pathname] || ''}
            </span>
          )}
        </div>
        <button
          onClick={() => base44.auth.logout()}
          className="ml-2 p-1.5 rounded-lg active:bg-gray-100 text-gray-400"
          aria-label="Sign out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}