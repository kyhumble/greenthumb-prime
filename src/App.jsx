import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Plants from './pages/Plants';
import PlantProfile from './pages/PlantProfile';
import Diagnose from './pages/Diagnose';
import Library from './pages/Library';
import Learn from './pages/Learn';
import Settings from './pages/Settings';
import Schedule from './pages/Schedule';
import Encyclopedia from './pages/Encyclopedia';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

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
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/Dashboard" replace />} />
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