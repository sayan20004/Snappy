import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState, lazy, Suspense } from 'react';
import { useAuthStore } from './store/authStore';
import { lazyLoadRoute } from './utils/codeSplitting.jsx';

// Eager load authentication pages for immediate access
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';

// Lazy load dashboard and feature pages with code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const FocusMode = lazy(() => import('./pages/FocusMode'));
const TimelinePage = lazy(() => import('./pages/TimelinePage'));
const InboxPage = lazy(() => import('./pages/InboxPage'));
const PlannerPage = lazy(() => import('./pages/PlannerPage'));
const TemplatesPage = lazy(() => import('./pages/TemplatesPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const CommandPalette = lazy(() => import('./components/CommandPalette'));
const MobileBottomNav = lazy(() => import('./components/MobileBottomNav'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
);

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Wait for hydration to complete
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Show minimal loading during hydration
  if (!_hasHydrated || !mounted) {
    return null; // Return null instead of spinner to avoid flash
  }

  return (
    <>
      {isAuthenticated && (
        <Suspense fallback={null}>
          <CommandPalette />
          <MobileBottomNav />
        </Suspense>
      )}
      <Routes>
      
      <Route 
        path="/" 
        element={!isAuthenticated ? <LandingPage /> : <Navigate to="/dashboard" replace />} 
      />
      <Route 
        path="/login" 
        element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} 
      />
      <Route 
        path="/register" 
        element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" replace />} 
      />
      <Route
        path="/dashboard"
        element={
          isAuthenticated ? (
            <Suspense fallback={<LoadingFallback />}>
              <Dashboard />
            </Suspense>
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/focus"
        element={
          isAuthenticated ? (
            <Suspense fallback={<LoadingFallback />}>
              <FocusMode />
            </Suspense>
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/timeline"
        element={
          isAuthenticated ? (
            <Suspense fallback={<LoadingFallback />}>
              <TimelinePage />
            </Suspense>
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/inbox"
        element={
          isAuthenticated ? (
            <Suspense fallback={<LoadingFallback />}>
              <InboxPage />
            </Suspense>
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/planner"
        element={
          isAuthenticated ? (
            <Suspense fallback={<LoadingFallback />}>
              <PlannerPage />
            </Suspense>
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/templates"
        element={
          isAuthenticated ? (
            <Suspense fallback={<LoadingFallback />}>
              <TemplatesPage />
            </Suspense>
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/profile"
        element={
          isAuthenticated ? (
            <Suspense fallback={<LoadingFallback />}>
              <ProfilePage />
            </Suspense>
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
