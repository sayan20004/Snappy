import { Routes, Route, Navigate } from 'react-router-dom';
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
  const { isAuthenticated } = useAuthStore();

  return (
    <>
      {isAuthenticated && <CommandPalette />}
      {isAuthenticated && <MobileBottomNav />}
      <Routes>
      
      <Route 
        path="/" 
        element={!isAuthenticated ? <LandingPage /> : <Navigate to="/dashboard" />} 
      />
      <Route 
        path="/login" 
        element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} 
      />
      <Route 
        path="/register" 
        element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} 
      />
      <Route
        path="/dashboard"
        element={isAuthenticated ? <Dashboard /> : <Navigate to="/" />}
      />
      <Route
        path="/focus"
        element={isAuthenticated ? <FocusMode /> : <Navigate to="/" />}
      />
      <Route
        path="/timeline"
        element={isAuthenticated ? <TimelinePage /> : <Navigate to="/" />}
      />
      <Route
        path="/inbox"
        element={isAuthenticated ? <InboxPage /> : <Navigate to="/" />}
      />
      <Route
        path="/planner"
        element={isAuthenticated ? <PlannerPage /> : <Navigate to="/" />}
      />
      <Route
        path="/templates"
        element={isAuthenticated ? <TemplatesPage /> : <Navigate to="/" />}
      />
      <Route
        path="/profile"
        element={isAuthenticated ? <ProfilePage /> : <Navigate to="/" />}
      />
      <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
