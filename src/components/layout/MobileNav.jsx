import React, { useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Leaf, Camera, CalendarDays, Sprout } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/Dashboard', label: 'Home', icon: LayoutDashboard },
  { path: '/Plants', label: 'Plants', icon: Leaf },
  { path: '/Diagnose', label: 'Diagnose', icon: Camera },
  { path: '/Schedule', label: 'Schedule', icon: CalendarDays },
  { path: '/PlantDatabase', label: 'Database', icon: Sprout },
];

export default function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();
  // Remember last visited path per tab root
  const lastPaths = useRef({});

  useEffect(() => {
    const activeTab = navItems.find(item => location.pathname.startsWith(item.path));
    if (activeTab) {
      lastPaths.current[activeTab.path] = location.pathname + location.search;
    }
  }, [location]);

  const handleTabPress = (item) => {
    const isActive = location.pathname.startsWith(item.path);
    if (isActive) {
      // Tap active tab → go to root of that tab
      navigate(item.path);
    } else {
      // Go to last known path for this tab, or root
      navigate(lastPaths.current[item.path] || item.path);
    }
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden select-none"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex justify-around py-1">
        {navItems.map(item => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <button
              key={item.path}
              onClick={() => handleTabPress(item)}
              className={cn(
                "flex flex-col items-center gap-0.5 min-h-[44px] px-4 py-1 rounded-lg transition-colors",
                isActive ? "text-[#1B4332]" : "text-gray-400"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}