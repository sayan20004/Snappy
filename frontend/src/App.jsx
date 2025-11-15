import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import { useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import FocusMode from './pages/FocusMode';
import TimelinePage from './pages/TimelinePage';
import InboxPage from './pages/InboxPage';
import PlannerPage from './pages/PlannerPage';
import TemplatesPage from './pages/TemplatesPage';
import CommandPalette from './components/CommandPalette';
import MobileBottomNav from './components/MobileBottomNav';

function App() {
  const { isAuthenticated } = useAuthStore();
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    // Initialize theme on mount
    setTheme(theme);

    // Listen for system theme changes
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => setTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme, setTheme]);

  return (
    <>
      {isAuthenticated && <CommandPalette />}
      {isAuthenticated && <MobileBottomNav />}
      <Routes>
      
      <Route 
        path="/login" 
        element={!isAuthenticated ? <Login /> : <Navigate to="/" />} 
      />
      <Route 
        path="/register" 
        element={!isAuthenticated ? <Register /> : <Navigate to="/" />} 
      />
      <Route
        path="/"
        element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
      />
      <Route
        path="/focus"
        element={isAuthenticated ? <FocusMode /> : <Navigate to="/login" />}
      />
      <Route
        path="/timeline"
        element={isAuthenticated ? <TimelinePage /> : <Navigate to="/login" />}
      />
      <Route
        path="/inbox"
        element={isAuthenticated ? <InboxPage /> : <Navigate to="/login" />}
      />
      <Route
        path="/planner"
        element={isAuthenticated ? <PlannerPage /> : <Navigate to="/login" />}
      />
      <Route
        path="/templates"
        element={isAuthenticated ? <TemplatesPage /> : <Navigate to="/login" />}
      />
      <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
