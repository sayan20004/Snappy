import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { useThemeStore } from '../store/themeStore';
import { useLists, useCreateList } from '../hooks/useLists';
import { FiMenu, FiPlus, FiLogOut, FiHome, FiStar, FiCalendar, FiActivity, FiInbox, FiZap, FiMoon, FiSun, FiCopy, FiX } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { sidebarCollapsed, toggleSidebar, selectedList, setSelectedList, setFilterStatus } = useUIStore();
  const { data: listsData, isLoading } = useLists();
  const createListMutation = useCreateList();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListIcon, setNewListIcon] = useState('📝');

  const commonEmojis = ['📝', '💼', '🏠', '🎯', '📚', '🛒', '💪', '✈️', '🎨', '💡', '🎵', '🏃'];

  const handleCreateList = () => {
    if (!newListName.trim()) return;
    
    createListMutation.mutate({
      name: newListName.trim(),
      icon: newListIcon,
    }, {
      onSuccess: () => {
        setShowCreateModal(false);
        setNewListName('');
        setNewListIcon('📝');
      }
    });
  };

  const filters = [
    { id: 'all', label: 'All Tasks', icon: <FiHome />, status: null, path: '/' },
    { id: 'today', label: 'Today', icon: <FiCalendar />, status: 'todo', path: '/' },
    { id: 'important', label: 'Important', icon: <FiStar />, status: 'todo', path: '/' },
    { id: 'divider', label: null, icon: null, status: null, path: null },
    { id: 'templates', label: 'Templates', icon: <FiCopy />, status: null, path: '/templates' },
    { id: 'inbox', label: 'Smart Inbox', icon: <FiInbox />, status: null, path: '/inbox' },
    { id: 'planner', label: 'AI Planner', icon: <FiZap />, status: null, path: '/planner' },
    { id: 'timeline', label: 'Activity', icon: <FiActivity />, status: null, path: '/timeline' },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-200 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡️</span>
              <span className="font-bold text-lg text-gray-900 dark:text-gray-100">Snappy Todo</span>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
          >
            <FiMenu />
          </button>
        </div>

        {!sidebarCollapsed && (
          <div className="p-4 space-y-1">
            {filters.map((filter) => {
              if (filter.id === 'divider') {
                return <div key="divider" className="border-t border-gray-200 dark:border-gray-700 my-2" />;
              }
              
              return filter.path && filter.path !== '/' ? (
                <Link
                  key={filter.id}
                  to={filter.path}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                >
                  {filter.icon}
                  <span>{filter.label}</span>
                </Link>
              ) : (
                <button
                  key={filter.id}
                  onClick={() => {
                    setSelectedList(null);
                    setFilterStatus(filter.status);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left text-gray-700 dark:text-gray-300"
                >
                  {filter.icon}
                  <span>{filter.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {!sidebarCollapsed && (
          <div className="flex-1 overflow-y-auto px-4 py-2 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Lists</h3>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-600 dark:text-gray-400" 
                title="Create new list"
              >
                <FiPlus size={16} />
              </button>
            </div>

            {isLoading ? (
              <div className="text-sm text-gray-400 dark:text-gray-500">Loading...</div>
            ) : listsData?.lists?.length > 0 ? (
              <div className="space-y-1">
                {listsData.lists.map((list) => (
                  <button
                    key={list._id}
                    onClick={() => setSelectedList(list._id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                      selectedList === list._id
                        ? 'bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span>{list.icon}</span>
                    <span className="truncate">{list.name}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No lists yet. Click + to create one!
              </p>
            )}
          </div>
        )}

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {!sidebarCollapsed && (
            <div className="space-y-3">
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
              >
                {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-medium">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user?.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</div>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
                  title="Logout"
                >
                  <FiLogOut size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create List Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Create New List</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  List Name
                </label>
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateList()}
                  placeholder="e.g., Work Tasks"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Choose Icon
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {commonEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setNewListIcon(emoji)}
                      className={`p-3 text-2xl rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                        newListIcon === emoji ? 'bg-primary-100 dark:bg-primary-900 ring-2 ring-primary-500' : ''
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateList}
                  disabled={!newListName.trim() || createListMutation.isPending}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {createListMutation.isPending ? 'Creating...' : 'Create List'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
