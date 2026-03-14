import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#F4F6F3]">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
      </div>

      {/* Main content — shifts with sidebar */}
      <main className={`transition-all duration-300 pb-20 md:pb-0 ${collapsed ? 'md:ml-16' : 'md:ml-60'}`}>
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
}