import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCommand, FiX, FiSearch, FiPlus, FiTarget, FiInbox, FiZap, FiActivity, FiMoon, FiSun, FiCheckCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../store/uiStore';
import { useThemeStore } from '../store/themeStore';
import { useTodos } from '../hooks/useTodos';
import { useCreateTodo, useToggleTodo } from '../hooks/useTodos';

// TASK D: Command Center with Cmd+K, Search, Quick Actions, Global State Control
export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  
  // Access Zustand stores
  const { theme, toggleTheme } = useThemeStore();
  const { setSelectedList } = useUIStore();
  
  // Access todos for search
  const { data: todosData } = useTodos();
  const createTodoMutation = useCreateTodo();
  const toggleTodoMutation = useToggleTodo();

  // Define commands
  const staticCommands = [
    { 
      id: 'new-task', 
      label: 'Create New Task', 
      icon: FiPlus, 
      action: () => {
        const title = prompt('Task title:');
        if (title) createTodoMutation.mutate({ title });
      }
    },
    { 
      id: 'toggle-theme', 
      label: `Toggle Theme (Current: ${theme})`, 
      icon: theme === 'dark' ? FiSun : FiMoon, 
      action: () => toggleTheme()
    },
    { id: 'focus-mode', label: 'Open Focus Mode', icon: FiTarget, action: () => navigate('/focus') },
    { id: 'smart-inbox', label: 'Open Smart Inbox', icon: FiInbox, action: () => navigate('/inbox') },
    { id: 'ai-planner', label: 'Open AI Planner', icon: FiZap, action: () => navigate('/planner') },
    { id: 'activity', label: 'View Activity Timeline', icon: FiActivity, action: () => navigate('/timeline') },
    { id: 'all-tasks', label: 'All Tasks', icon: FiSearch, action: () => { navigate('/'); setSelectedList(null); } }
  ];

  // Search todos
  const searchableTodos = todosData?.todos || [];
  const matchedTodos = query.trim().length >= 2
    ? searchableTodos.filter(todo => 
        todo.title.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
    : [];

  const filteredCommands = staticCommands.filter(cmd =>
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  const allResults = [
    ...filteredCommands.map(cmd => ({ ...cmd, type: 'command' })),
    ...matchedTodos.map(todo => ({ 
      id: todo._id, 
      label: todo.title, 
      icon: FiCheckCircle, 
      type: 'todo',
      action: () => toggleTodoMutation.mutate({ id: todo._id, status: todo.status === 'done' ? 'todo' : 'done' })
    }))
  ];

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd+K or Ctrl+K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }

      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const executeCommand = (item) => {
    if (item.action) item.action();
    setIsOpen(false);
    setQuery('');
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ duration: 0.15 }}
        className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-2xl z-50 overflow-hidden border border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <FiSearch className="text-gray-400" size={20} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks or type a command..."
            className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
            autoFocus
          />
          <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {allResults.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
              No results found
            </div>
          ) : (
            <div className="py-2">
              {allResults.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => executeCommand(item)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                  >
                    <Icon className="text-primary-600 dark:text-primary-400" size={18} />
                    <span className="flex-1 text-gray-900 dark:text-gray-100">{item.label}</span>
                    {item.type === 'todo' && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">Toggle</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
          <span>Type to search • Enter to select</span>
          <div className="flex gap-2">
            <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600">⌘K</kbd>
            <span>to toggle</span>
          </div>
        </div>
      </motion.div>
    </>
  );
}
