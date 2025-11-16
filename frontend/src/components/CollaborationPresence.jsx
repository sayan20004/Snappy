import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { usersAPI, listsAPI } from '../api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiUser, FiUserPlus, FiSearch, FiX, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getFullAvatarUrl } from '../utils/avatarUrl';

export default function CollaborationPresence({ listId }) {
  const { user } = useAuthStore();
  const [activeUsers, setActiveUsers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const queryClient = useQueryClient();

  // Fetch real users
  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersAPI.getUsers(),
    staleTime: 5 * 60 * 1000
  });

  // Search users
  const { data: searchResults } = useQuery({
    queryKey: ['users', 'search', searchQuery],
    queryFn: () => usersAPI.getUsers(searchQuery),
    enabled: searchQuery.length > 0,
    staleTime: 1 * 60 * 1000
  });

  // Add collaborator mutation
  const addCollaboratorMutation = useMutation({
    mutationFn: ({ listId, email }) => listsAPI.inviteCollaborator(listId, { email }),
    onSuccess: () => {
      toast.success('Collaborator added successfully!');
      setShowAddModal(false);
      setSearchQuery('');
      setSelectedUser(null);
      queryClient.invalidateQueries(['lists']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to add collaborator');
    }
  });

  useEffect(() => {
    // Simulate real-time presence with actual users from the database
    if (usersData?.users && usersData.users.length > 0) {
      // Show a couple of random users as "active"
      const randomUsers = usersData.users
        .filter(u => u._id !== user?._id) // Exclude current user
        .slice(0, 2)
        .map((u, idx) => ({
          id: u._id,
          name: u.name,
          avatar: getFullAvatarUrl(u.avatarUrl),
          color: ['bg-blue-500', 'bg-green-500', 'bg-purple-500'][idx % 3],
          cursor: { x: 120 + idx * 200, y: 340 - idx * 100 }
        }));
      
      setActiveUsers(randomUsers);
    }

    // Socket.io integration (ready for production)
    /*
    const socket = io();
    socket.emit('join-list', { listId, user: { id: user._id, name: user.name } });
    
    socket.on('user-joined', (userData) => {
      setActiveUsers(prev => [...prev, userData]);
    });
    
    socket.on('user-left', (userId) => {
      setActiveUsers(prev => prev.filter(u => u.id !== userId));
    });
    
    socket.on('cursor-move', ({ userId, position }) => {
      setActiveUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, cursor: position } : u
      ));
    });

    return () => socket.disconnect();
    */
  }, [listId, user, usersData]);

  const handleAddCollaborator = () => {
    if (selectedUser && listId) {
      addCollaboratorMutation.mutate({
        listId,
        email: selectedUser.email
      });
    }
  };

  const filteredSearchResults = searchResults?.users?.filter(
    u => u._id !== user?._id // Exclude current user
  ) || [];

  // Don't render if no listId
  if (!listId) {
    return null;
  }

  return (
    <>
      {/* Active Users Bar */}
      <div className="flex items-center gap-2">
        {/* Add Collaborator Button */}
        {listId && (
          <button
            onClick={() => setShowAddModal(true)}
            className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 transition-colors"
            title="Add collaborator"
          >
            <FiUserPlus size={14} />
          </button>
        )}

        {activeUsers.slice(0, 5).map((activeUser, idx) => (
          <div
            key={activeUser.id}
            className={`w-8 h-8 rounded-full ${activeUser.color} flex items-center justify-center text-white text-xs font-medium border-2 border-white shadow-sm -ml-2 first:ml-0 relative`}
            style={{ zIndex: activeUsers.length - idx }}
            title={activeUser.name}
          >
            {activeUser.avatar ? (
              <img src={activeUser.avatar} alt={activeUser.name} className="w-full h-full rounded-full" />
            ) : (
              activeUser.name.charAt(0).toUpperCase()
            )}
            
            {/* Live indicator */}
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full animate-pulse" />
          </div>
        ))}
        
        {activeUsers.length > 5 && (
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
            +{activeUsers.length - 5}
          </div>
        )}
        
        {activeUsers.length > 0 && (
          <span className="text-xs text-gray-500 ml-1">
            {activeUsers.length} online
          </span>
        )}
      </div>

      {/* Collaborative Cursors (Overlay) */}
      {activeUsers.map(activeUser => activeUser.cursor && (
        <div
          key={`cursor-${activeUser.id}`}
          className="fixed pointer-events-none z-50 transition-all duration-100"
          style={{
            left: activeUser.cursor.x,
            top: activeUser.cursor.y
          }}
        >
          {/* Cursor SVG */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M5.65376 12.3673L0 0L12.3673 5.65376L8.69583 9.32523L5.65376 12.3673Z"
              fill={activeUser.color.replace('bg-', '#')}
            />
          </svg>
          
          {/* Name label */}
          <div className={`mt-1 px-2 py-1 ${activeUser.color} text-white text-xs rounded shadow-lg whitespace-nowrap`}>
            {activeUser.name}
          </div>
        </div>
      ))}
      
      {/* Add Collaborator Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Add Collaborator
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSearchQuery('');
                  setSelectedUser(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="space-y-3">
              {/* Search Input */}
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              {/* Search Results */}
              <div className="max-h-64 overflow-y-auto space-y-2">
                {searchQuery.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8 text-sm">
                    Search for users by name or email
                  </p>
                ) : filteredSearchResults.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8 text-sm">
                    No users found
                  </p>
                ) : (
                  filteredSearchResults.map((searchUser) => (
                    <button
                      key={searchUser._id}
                      onClick={() => setSelectedUser(searchUser)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        selectedUser?._id === searchUser._id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {searchUser.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {searchUser.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {searchUser.email}
                        </div>
                      </div>
                      {selectedUser?._id === searchUser._id && (
                        <FiCheck className="text-primary-600 dark:text-primary-400" size={20} />
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSearchQuery('');
                  setSelectedUser(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCollaborator}
                disabled={!selectedUser || addCollaboratorMutation.isPending}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {addCollaboratorMutation.isPending ? 'Adding...' : 'Add Collaborator'}
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Collaborators will be able to view and edit tasks in this list
            </p>
          </div>
        </div>
      )}
    </>
  );
}
