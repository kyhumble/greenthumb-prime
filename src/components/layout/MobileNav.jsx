import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Leaf, Camera, CalendarDays, BookMarked } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/Dashboard', label: 'Home', icon: LayoutDashboard },
  { path: '/Plants', label: 'Plants', icon: Leaf },
  { path: '/Diagnose', label: 'Diagnose', icon: Camera },
  { path: '/Schedule', label: 'Schedule', icon: CalendarDays },
  { path: '/Encyclopedia', label: 'Encyclopedia', icon: BookMarked },
];

export default function MobileNav() {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex justify-around py-2">
        {navItems.map(item => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition-colors",
                isActive ? "text-[#1B4332]" : "text-gray-400"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}