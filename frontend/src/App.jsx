import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import FocusMode from './pages/FocusMode';
import TimelinePage from './pages/TimelinePage';
import InboxPage from './pages/InboxPage';
import PlannerPage from './pages/PlannerPage';
import TemplatesPage from './pages/TemplatesPage';
import ProfilePage from './pages/ProfilePage';
import LandingPage from './pages/LandingPage';
import CommandPalette from './components/CommandPalette';
import MobileBottomNav from './components/MobileBottomNav';

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
      {isAuthenticated && <CommandPalette />}
      {isAuthenticated && <MobileBottomNav />}
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
        element={isAuthenticated ? <Dashboard /> : <Navigate to="/" replace />}
      />
      <Route
        path="/focus"
        element={isAuthenticated ? <FocusMode /> : <Navigate to="/" replace />}
      />
      <Route
        path="/timeline"
        element={isAuthenticated ? <TimelinePage /> : <Navigate to="/" replace />}
      />
      <Route
        path="/inbox"
        element={isAuthenticated ? <InboxPage /> : <Navigate to="/" replace />}
      />
      <Route
        path="/planner"
        element={isAuthenticated ? <PlannerPage /> : <Navigate to="/" replace />}
      />
      <Route
        path="/templates"
        element={isAuthenticated ? <TemplatesPage /> : <Navigate to="/" replace />}
      />
      <Route
        path="/profile"
        element={isAuthenticated ? <ProfilePage /> : <Navigate to="/" replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
