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
              <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-200">
                <FiSearch className="text-gray-400" size={20} />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type a command or search..."
                  className="flex-1 outline-none text-lg"
                  autoFocus
                />
                <kbd className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">ESC</kbd>
              </div>

              {/* Commands List */}
              <div className="max-h-96 overflow-y-auto">
                {filteredCommands.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-400">
                    No commands found
                  </div>
                ) : (
                  filteredCommands.map((cmd, idx) => {
                    const Icon = cmd.icon;
                    return (
                      <button
                        key={cmd.id}
                        onClick={() => executeCommand(cmd)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                          <Icon className="text-primary-600" size={18} />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{cmd.label}</div>
                          <div className="text-xs text-gray-500">{cmd.path}</div>
                        </div>
                        <kbd className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">↵</kbd>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <span><kbd className="px-1.5 py-0.5 bg-white rounded border">↑↓</kbd> Navigate</span>
                  <span><kbd className="px-1.5 py-0.5 bg-white rounded border">↵</kbd> Select</span>
                </div>
                <button
                  onClick={() => { setIsOpen(false); setShowHelp(true); }}
                  className="hover:text-gray-700"
                >
                  View all shortcuts
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Shortcuts Help Modal */}
      <AnimatePresence>
        {showHelp && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowHelp(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-lg shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FiCommand />
                  Keyboard Shortcuts
                </h2>
                <button
                  onClick={() => setShowHelp(false)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Shortcuts Grid */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  {shortcuts.map(shortcut => (
                    <div key={shortcut.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">{shortcut.action}</span>
                      <kbd className="px-3 py-1 bg-white text-gray-900 text-sm rounded border border-gray-300 font-mono">
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </div>

                {/* Additional Tips */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">💡 Pro Tips</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Use <kbd className="px-2 py-0.5 bg-white rounded text-xs">Tab</kbd> to navigate between form fields</li>
                    <li>• Press <kbd className="px-2 py-0.5 bg-white rounded text-xs">Ctrl+Enter</kbd> to submit forms</li>
                    <li>• Use <kbd className="px-2 py-0.5 bg-white rounded text-xs">1-4</kbd> keys to set task priority (when focused)</li>
                    <li>• Double-click task titles to edit inline</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
