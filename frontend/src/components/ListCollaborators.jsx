import { useState } from 'react';
import { FiX, FiUserPlus, FiTrash2, FiUser } from 'react-icons/fi';
import { useInviteCollaborator, useRemoveCollaborator, useUpdateCollaboratorRole } from '../hooks/useLists';
import { useAuthStore } from '../store/authStore';
import { getFullAvatarUrl } from '../utils/avatarUrl';

export default function ListCollaborators({ list, onClose }) {
  const { user } = useAuthStore();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  
  const inviteCollaboratorMutation = useInviteCollaborator();
  const removeCollaboratorMutation = useRemoveCollaborator();
  const updateRoleMutation = useUpdateCollaboratorRole();

  const isOwner = list.owner && (String(list.owner._id || list.owner) === String(user?._id));

  const handleInvite = () => {
    if (!email.trim()) return;
    
    inviteCollaboratorMutation.mutate({
      listId: list._id,
      data: { email: email.trim(), role }
    }, {
      onSuccess: () => {
        setEmail('');
        setRole('editor');
      }
    });
  };

  const handleRemove = (userId) => {
    if (!confirm('Remove this collaborator from the list?')) return;
    
    removeCollaboratorMutation.mutate({
      listId: list._id,
      userId
    });
  };

  const handleRoleChange = (userId, newRole) => {
    updateRoleMutation.mutate({
      listId: list._id,
      userId,
      role: newRole
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Manage Collaborators
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            List: <span className="font-medium text-gray-900 dark:text-gray-100">{list.icon} {list.name}</span>
          </p>
        </div>

        {/* Invite Section - Only for owner */}
        {isOwner && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <FiUserPlus /> Invite Collaborator
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleInvite()}
                  placeholder="colleague@example.com"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="editor">Editor - Can edit tasks and list</option>
                  <option value="viewer">Viewer - Can only view</option>
                </select>
              </div>
              <button
                onClick={handleInvite}
                disabled={!email.trim() || inviteCollaboratorMutation.isPending}
                className="w-full px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {inviteCollaboratorMutation.isPending ? 'Inviting...' : 'Send Invite'}
              </button>
            </div>
          </div>
        )}

        {/* Owner Section */}
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
            Owner
          </h4>
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            {list.owner?.avatarUrl ? (
              <img
                src={getFullAvatarUrl(list.owner.avatarUrl)}
                alt={list.owner.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-medium">
                {list.owner?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {list.owner?.name || 'Unknown'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {list.owner?.email || ''}
              </div>
            </div>
            <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full">
              Owner
            </span>
          </div>
        </div>

        {/* Collaborators List */}
        {list.collaborators && list.collaborators.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
              Collaborators ({list.collaborators.length})
            </h4>
            <div className="space-y-2">
              {list.collaborators.map((collaborator) => {
                const collabUser = collaborator.userId;
                return (
                  <div key={collabUser._id || collabUser} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    {collabUser.avatarUrl ? (
                      <img
                        src={getFullAvatarUrl(collabUser.avatarUrl)}
                        alt={collabUser.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-600 text-white flex items-center justify-center font-medium">
                        {collabUser.name?.charAt(0).toUpperCase() || <FiUser />}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {collabUser.name || 'Unknown'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {collabUser.email || ''}
                      </div>
                    </div>
                    {isOwner ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={collaborator.role}
                          onChange={(e) => handleRoleChange(collabUser._id || collabUser, e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          disabled={updateRoleMutation.isPending}
                        >
                          <option value="editor">Editor</option>
                          <option value="viewer">Viewer</option>
                        </select>
                        <button
                          onClick={() => handleRemove(collabUser._id || collabUser)}
                          className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-600 dark:text-red-400 transition-colors"
                          title="Remove collaborator"
                          disabled={removeCollaboratorMutation.isPending}
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                        {collaborator.role}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {(!list.collaborators || list.collaborators.length === 0) && !isOwner && (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            No other collaborators yet.
          </p>
        )}
      </div>
    </div>
  );
}
