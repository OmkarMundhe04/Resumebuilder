import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppShell from './components/layout/AppShell';

// Pages
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import CareerProfile from './pages/CareerProfile';
import ResumeBuilder from './pages/ResumeBuilder';
import JobMatch from './pages/JobMatch';
import CoverLetterBuilder from './pages/CoverLetterBuilder';
import Applications from './pages/Applications';
import Portfolio from './pages/Portfolio';
import TemplatesGallery from './pages/TemplatesGallery';
import LearningCenter from './pages/LearningCenter';
import Settings from './pages/Settings';
import PrivacyCenter from './pages/PrivacyCenter';
import PublicResumeView from './pages/PublicResumeView';
import TrustCenter from './pages/TrustCenter';
import Login from './pages/Login';
import Register from './pages/Register';

import CustomCursor from './components/motion/CustomCursor';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '1047124376483-demo-resumebuilder-clientid.apps.googleusercontent.com';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-app)', color: 'var(--text-muted)' }}>
        Loading Career Platform...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <AppShell>{children}</AppShell>;
};

// Public Route (Accessible to all, but with AppShell if authenticated)
const ShellRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <AppShell>{children}</AppShell>;
  }
  return children;
};

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <CustomCursor />
            <Routes>
              {/* Public Landing & Auth */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/share/:token" element={<PublicResumeView />} />

              {/* General Open Pages */}
              <Route
                path="/templates"
                element={
                  <ShellRoute>
                    <TemplatesGallery />
                  </ShellRoute>
                }
              />
              <Route
                path="/learning"
                element={
                  <ShellRoute>
                    <LearningCenter />
                  </ShellRoute>
                }
              />
              <Route
                path="/trust"
                element={
                  <ShellRoute>
                    <TrustCenter />
                  </ShellRoute>
                }
              />

              {/* Protected Workspace Pages */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/career-profile"
                element={
                  <ProtectedRoute>
                    <CareerProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/builder"
                element={
                  <ProtectedRoute>
                    <ResumeBuilder />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/builder/:id"
                element={
                  <ProtectedRoute>
                    <ResumeBuilder />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/job-match"
                element={
                  <ProtectedRoute>
                    <JobMatch />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cover-letter"
                element={
                  <ProtectedRoute>
                    <CoverLetterBuilder />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/applications"
                element={
                  <ProtectedRoute>
                    <Applications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/portfolio"
                element={
                  <ProtectedRoute>
                    <Portfolio />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/privacy"
                element={
                  <ProtectedRoute>
                    <PrivacyCenter />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
