import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCommand, FiX, FiSearch, FiPlus, FiTarget, FiInbox, FiZap, FiActivity } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../store/uiStore';

const shortcuts = [
  { key: 'Ctrl+K', action: 'Open command palette', id: 'palette' },
  { key: 'Ctrl+Shift+T', action: 'Quick add task', id: 'quick-add' },
  { key: 'Ctrl+Shift+F', action: 'Open filters', id: 'filters' },
  { key: 'Ctrl+Shift+K', action: 'Toggle Kanban view', id: 'kanban' },
  { key: 'Ctrl+/', action: 'Show shortcuts help', id: 'help' },
  { key: 'Ctrl+F', action: 'Focus search', id: 'search' },
  { key: 'Esc', action: 'Close modals', id: 'close' },
  { key: '/', action: 'Quick search', id: 'quick-search' }
];

const commands = [
  { id: 'new-task', label: 'New Task', icon: FiPlus, path: '/', action: 'quick-add' },
  { id: 'focus-mode', label: 'Focus Mode', icon: FiTarget, path: '/focus' },
  { id: 'smart-inbox', label: 'Smart Inbox', icon: FiInbox, path: '/inbox' },
  { id: 'ai-planner', label: 'AI Planner', icon: FiZap, path: '/planner' },
  { id: 'activity', label: 'Activity Timeline', icon: FiActivity, path: '/timeline' },
  { id: 'all-tasks', label: 'All Tasks', icon: FiSearch, path: '/' }
];

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Command Palette: Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }

      // Help: Ctrl+/
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setShowHelp(true);
      }

      // Close on Escape
      if (e.key === 'Escape') {
        setIsOpen(false);
        setShowHelp(false);
      }

      // Quick search: /
      if (e.key === '/' && !isOpen && !showHelp && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showHelp]);

  const executeCommand = (cmd) => {
    if (cmd.action === 'quick-add') {
      // Trigger quick add
      window.dispatchEvent(new KeyboardEvent('keydown', { 
        key: 'T', 
        ctrlKey: true, 
        shiftKey: true 
      }));
    } else if (cmd.path) {
      navigate(cmd.path);
    }
    setIsOpen(false);
    setQuery('');
  };

  return (
    <>
      {/* Command Palette Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.15 }}
              className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white rounded-lg shadow-2xl z-50 overflow-hidden"
            >
              {/* Search Input */}
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
