import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';

import AppLayout from './components/layout/AppLayout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Plants from './pages/Plants';
import PlantProfile from './pages/PlantProfile';
import Diagnose from './pages/Diagnose';
import Library from './pages/Library';
import Learn from './pages/Learn';
import Settings from './pages/Settings';
import Schedule from './pages/Schedule';
import Encyclopedia from './pages/Encyclopedia';
import GrowthAnalytics from './pages/GrowthAnalytics';
import Agents from './pages/Agents';
import Pricing from './pages/Pricing';

// Dark mode: sync with system preference
function DarkModeSync() {
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = (e) => document.documentElement.classList.toggle('dark', e.matches);
    apply(mq);
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);
  return null;
}

// Animated route wrapper
const pageVariants = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
};

function AnimatedRoutes({ children }) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.18, ease: 'easeInOut' }}
        style={{ width: '100%' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#FDF8F0]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#52796F]/20 border-t-[#52796F] rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-[#52796F] mt-3">Loading GreenThumb...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Show landing page instead of redirecting to login
      return (
        <Routes>
          <Route path="*" element={<Landing />} />
        </Routes>
      );
    }
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/Dashboard" replace />} />
      <Route path="/Landing" element={<Landing />} />
      <Route path="/Pricing" element={<Pricing />} />
      <Route element={<AppLayout />}>
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Plants" element={<Plants />} />
        <Route path="/PlantProfile" element={<PlantProfile />} />
        <Route path="/Diagnose" element={<Diagnose />} />
        <Route path="/Library" element={<Library />} />
        <Route path="/Learn" element={<Learn />} />
        <Route path="/Settings" element={<Settings />} />
        <Route path="/Schedule" element={<Schedule />} />
        <Route path="/Encyclopedia" element={<Encyclopedia />} />
        <Route path="/GrowthAnalytics" element={<GrowthAnalytics />} />
        <Route path="/Agents" element={<Agents />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <Sonner position="top-right" />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App