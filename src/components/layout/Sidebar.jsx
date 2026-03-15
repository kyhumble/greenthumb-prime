import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Leaf, Camera, BookOpen, Settings, 
  Bug, ChevronLeft, ChevronRight, LogOut, Sprout, CalendarDays, BookMarked, TrendingUp, Bot
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { path: '/Dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/Plants', label: 'My Plants', icon: Leaf },
      { path: '/Schedule', label: 'Schedule', icon: CalendarDays },
    ],
  },
  {
    label: 'AI Tools',
    items: [
      { path: '/Diagnose', label: 'AI Diagnose', icon: Camera },
      { path: '/GrowthAnalytics', label: 'Growth Analytics', icon: TrendingUp },
      { path: '/Agents', label: 'AI Agents', icon: Bot },
    ],
  },
  {
    label: 'Knowledge',
    items: [
      { path: '/PlantDatabase', label: 'Plant Database', icon: Sprout },
      { path: '/Encyclopedia', label: 'Encyclopedia', icon: BookMarked },
      { path: '/Library', label: 'Pest & Disease', icon: Bug },
      { path: '/Learn', label: 'Learn', icon: BookOpen },
    ],
  },
];

export default function Sidebar({ collapsed = false, onCollapse }) {
  const location = useLocation();

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-full bg-[#1B4332] text-white z-50 flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-60"
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
          <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b58c93938d13c9af653602/39bf079b2_generated_image.png" alt="GreenThumb Professional" className="w-full h-full object-cover" />
        </div>
        {!collapsed && (
          <span className="font-semibold text-sm tracking-wide whitespace-nowrap">GreenThumb Professional</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto space-y-4">
        {navGroups.map(group => (
          <div key={group.label}>
            {!collapsed && (
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 px-3 mb-1">{group.label}</p>
            )}
            <div className="space-y-0.5">
              {group.items.map(item => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm",
                      isActive
                        ? "bg-white/15 text-white font-medium"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="p-2 border-t border-white/10 space-y-1">
        <button
          onClick={() => onCollapse && onCollapse(!collapsed)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/40 hover:text-white/70 transition-colors w-full text-sm"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          {!collapsed && <span>Collapse</span>}
        </button>
        <button
          onClick={() => base44.auth.logout()}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/40 hover:text-white/70 transition-colors w-full text-sm"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}