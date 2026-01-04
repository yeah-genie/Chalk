
import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { StudentsPage } from './pages/dashboard/StudentsPage';
import { SessionsPage } from './pages/dashboard/SessionsPage';
import { ReportsPage } from './pages/dashboard/ReportsPage';
import { PortfolioSettingsPage } from './pages/dashboard/PortfolioSettingsPage';
import { SettingsPage } from './pages/dashboard/SettingsPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Dashboard Pages */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/students" element={<StudentsPage />} />
        <Route path="/dashboard/sessions" element={<SessionsPage />} />
        <Route path="/dashboard/reports" element={<ReportsPage />} />
        <Route path="/dashboard/portfolio" element={<PortfolioSettingsPage />} />
        <Route path="/dashboard/settings" element={<SettingsPage />} />

        {/* Public Portfolio */}
        <Route path="/tutor/:slug" element={<PortfolioPage />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
