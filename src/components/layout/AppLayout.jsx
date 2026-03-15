import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import MobileHeader from './MobileHeader';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#FDF8F0]" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Sidebar - visible on all non-mobile screens */}
      <div className="hidden sm:block">
        <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
      </div>

      {/* Mobile top header */}
      <MobileHeader />

      {/* Main content — shifts with sidebar */}
      <main className={`transition-all duration-300 pb-20 md:pb-0 ${collapsed ? 'md:ml-16' : 'md:ml-60'}`}>
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
}