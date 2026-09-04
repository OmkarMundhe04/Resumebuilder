import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppShell from './components/layout/AppShell';
import CustomCursor from './components/motion/CustomCursor';

// Critical Path Pages (Loaded immediately)
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';

// Lazy-Loaded Workspace Pages (Split into on-demand chunks)
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CareerProfile = lazy(() => import('./pages/CareerProfile'));
const ResumeBuilder = lazy(() => import('./pages/ResumeBuilder'));
const JobMatch = lazy(() => import('./pages/JobMatch'));
const CoverLetterBuilder = lazy(() => import('./pages/CoverLetterBuilder'));
const Applications = lazy(() => import('./pages/Applications'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const TemplatesGallery = lazy(() => import('./pages/TemplatesGallery'));
const LearningCenter = lazy(() => import('./pages/LearningCenter'));
const Settings = lazy(() => import('./pages/Settings'));
const PrivacyCenter = lazy(() => import('./pages/PrivacyCenter'));
const PublicResumeView = lazy(() => import('./pages/PublicResumeView'));
const TrustCenter = lazy(() => import('./pages/TrustCenter'));

// Clean loading placeholder for lazy routes
const RouteLoader = () => (
  <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-app)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div className="spin-slow" style={{ width: '18px', height: '18px', border: '2px solid var(--border-subtle)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%' }} />
      <span>Loading page...</span>
    </div>
  </div>
);

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
            <Suspense fallback={<RouteLoader />}>
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
            </Suspense>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
