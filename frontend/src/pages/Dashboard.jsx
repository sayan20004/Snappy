import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import MainFeed from '../components/MainFeed';
import AITaskInput from '../components/AITaskInput';
import AISuggestions from '../components/AISuggestions';
import AIChat from '../components/AIChat';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { FiZap, FiMessageCircle } from 'react-icons/fi';

export default function Dashboard() {
  const { sidebarCollapsed } = useUIStore();
  const { user } = useAuthStore();
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);

  // Check if features are enabled
  const aiEnabled = user?.settings?.aiEnabled ?? true;
  const multimediaEnabled = user?.settings?.multimediaEnabled ?? true;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // "/" to focus quick add
      if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        const quickAdd = document.getElementById('quick-add-input');
        if (quickAdd) quickAdd.focus();
      }

      // Cmd/Ctrl + K for AI suggestions
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowAISuggestions(prev => !prev);
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

      {/* AI Floating Buttons */}
      {aiEnabled && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
          {/* AI Suggestions Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAISuggestions(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full p-4 shadow-lg hover:shadow-xl"
            title="AI Suggestions"
          >
            <FiZap className="w-6 h-6" />
          </motion.button>
          
          {/* AI Chat Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAIChat(true)}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full p-4 shadow-lg hover:shadow-xl"
            title="AI Chat"
          >
            <FiMessageCircle className="w-6 h-6" />
          </motion.button>
        </div>
      )}

      {/* AI Components */}
      {multimediaEnabled && <AITaskInput aiEnabled={aiEnabled} multimediaEnabled={multimediaEnabled} />}
      {aiEnabled && <AISuggestions isVisible={showAISuggestions} onClose={() => setShowAISuggestions(false)} />}
      {aiEnabled && <AIChat isOpen={showAIChat} onClose={() => setShowAIChat(false)} />}
    </div>
  );
}
