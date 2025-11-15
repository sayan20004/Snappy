import { useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import MainFeed from '../components/MainFeed';
import { useUIStore } from '../store/uiStore';

export default function Dashboard() {
  const { sidebarCollapsed } = useUIStore();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // "/" to focus quick add
      if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        const quickAdd = document.getElementById('quick-add-input');
        if (quickAdd) quickAdd.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div
        className={`flex-1 transition-all duration-200 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        <MainFeed />
      </div>
    </div>
  );
}
