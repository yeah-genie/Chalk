
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import Layout from './components/Layout';
import OnboardingModal from './components/OnboardingModal';
import Dashboard from './pages/Dashboard';
import IdeaList from './pages/IdeaList';
import IdeaDetail from './pages/IdeaDetail';
import Settings from './pages/Settings';
import Login from './pages/Login';
import LandingNew from './pages/LandingNew';
import { Loader2 } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Just show loading while auth is being checked
const AppContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoadingAuth } = useAppContext();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if onboarding was completed
    const completed = localStorage.getItem('cryo_onboarding_completed');
    if (!completed) {
      // Small delay to let the app render first
      setTimeout(() => setShowOnboarding(true), 500);
    }
  }, []);

  if (isLoadingAuth) {
    return (
      <div className="h-screen w-full flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} />
      </div>
    );
  }

  return (
    <>
      {children}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={() => setShowOnboarding(false)}
      />
    </>
  );
};

const AppRoutes: React.FC = () => {
  const { currentUser } = useAppContext();

  return (
    <Routes>
      {/* Public pages */}
      <Route path="/welcome" element={<LandingNew />} />
      <Route path="/auth/notion/callback" element={<LandingNew />} />
      <Route path="/login" element={<Login />} />

      {/* Root: Show landing for non-logged-in users, dashboard for logged-in */}
      <Route path="/" element={
        currentUser ? <Layout><Dashboard /></Layout> : <LandingNew />
      } />

      {/* Main app - requires auth for full functionality */}
      <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
      <Route path="/ideas" element={<Layout><IdeaList /></Layout>} />
      <Route path="/ideas/:id" element={<Layout><IdeaDetail /></Layout>} />
      <Route path="/frozen" element={<Navigate to="/ideas?filter=frozen" replace />} />
      <Route path="/zombie" element={<Navigate to="/ideas?filter=frozen" replace />} />
      <Route path="/settings" element={<Layout><Settings /></Layout>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <Router>
          <AppContent>
            <AppRoutes />
            <Toaster position="bottom-right" />
          </AppContent>
        </Router>
      </AppProvider>
    </QueryClientProvider>
  );
};

export default App;