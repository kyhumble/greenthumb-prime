import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Leaf, Camera, BookOpen, Settings, 
  Bug, ChevronLeft, ChevronRight, LogOut, Sprout
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/Dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/Plants', label: 'My Plants', icon: Leaf },
  { path: '/Diagnose', label: 'AI Diagnose', icon: Camera },
  { path: '/Library', label: 'Plant Library', icon: Bug },
  { path: '/Learn', label: 'Learn', icon: BookOpen },
  { path: '/Settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ collapsed = false, onCollapse }) {
  const location = useLocation();

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-full bg-white border-r border-gray-100 z-50 flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-60"
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-gray-100">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#22C55E] to-[#16A34A] flex items-center justify-center flex-shrink-0 shadow-sm">
          <Sprout className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <span className="font-semibold text-gray-900 text-sm tracking-tight whitespace-nowrap">GreenThumb</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-0.5 px-2">
        {navItems.map(item => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm",
                isActive 
                  ? "bg-[#F0FDF4] text-[#16A34A] font-medium" 
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <item.icon className={cn("w-[18px] h-[18px] flex-shrink-0", isActive ? "text-[#16A34A]" : "text-gray-400")} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="p-2 border-t border-gray-100 space-y-0.5">
        <button
          onClick={() => onCollapse && onCollapse(!collapsed)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors w-full text-sm"
        >
          {collapsed ? <ChevronRight className="w-[18px] h-[18px]" /> : <ChevronLeft className="w-[18px] h-[18px]" />}
          {!collapsed && <span>Collapse</span>}
        </button>
        <button
          onClick={() => base44.auth.logout()}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors w-full text-sm"
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}