import { useState, useRef, useEffect } from 'react';
import { FiMessageCircle, FiSend, FiThumbsUp, FiHeart, FiCheck, FiZap, FiMoreVertical, FiTrash2, FiEdit2 } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { getUsers } from '../api/users';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { getFullAvatarUrl } from '../utils/avatarUrl';

const REACTIONS = [
  { type: 'like', icon: FiThumbsUp, label: 'Like', color: 'text-blue-500' },
  { type: 'love', icon: FiHeart, label: 'Love', color: 'text-red-500' },
  { type: 'check', icon: FiCheck, label: 'Done', color: 'text-green-500' },
  { type: 'zap', icon: FiZap, label: 'Quick', color: 'text-yellow-500' }
];

export default function TaskComments({ task, onUpdate }) {
  const [comments, setComments] = useState(task?.comments || []);
  const [newComment, setNewComment] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionUsers, setMentionUsers] = useState([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [showMenu, setShowMenu] = useState(null);
  const textareaRef = useRef(null);
  const { user: currentUser } = useAuthStore();

  // Fetch real users for mentions
  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers(),
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  const allUsers = usersData?.users || [];

  // Detect @mentions
  useEffect(() => {
    const text = newComment;
    const lastAtIndex = text.lastIndexOf('@', cursorPosition);
    
    if (lastAtIndex !== -1 && lastAtIndex < cursorPosition) {
      const query = text.slice(lastAtIndex + 1, cursorPosition);
      if (!query.includes(' ') && allUsers.length > 0) {
        setMentionQuery(query);
        const filtered = allUsers.filter(u =>
          u.name.toLowerCase().includes(query.toLowerCase()) ||
          u.email.toLowerCase().includes(query.toLowerCase())
        );
        setMentionUsers(filtered);
        setShowMentions(filtered.length > 0);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  }, [newComment, cursorPosition, allUsers]);

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
    setCursorPosition(e.target.selectionStart);
  };

  const insertMention = (user) => {
    const text = newComment;
    const lastAtIndex = text.lastIndexOf('@', cursorPosition);
    const before = text.slice(0, lastAtIndex);
    const after = text.slice(cursorPosition);
    const newText = `${before}@${user.name} ${after}`;
    setNewComment(newText);
    setShowMentions(false);
    textareaRef.current?.focus();
  };

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;

    // Extract mentions from text
    const mentionRegex = /@([A-Za-z\s]+)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(newComment)) !== null) {
      const mentionedUser = allUsers.find(u => u.name === match[1].trim());
      if (mentionedUser) mentions.push(mentionedUser._id || mentionedUser.id);
    }

    const comment = {
      id: Date.now(),
      text: newComment,
      author: { 
        id: currentUser?._id || currentUser?.id, 
        name: currentUser?.name || 'You', 
        avatar: getFullAvatarUrl(currentUser?.avatarUrl) || '👤' 
      },
      mentions,
      reactions: [],
      createdAt: new Date().toISOString()
    };

    const updatedComments = [...comments, comment];
    setComments(updatedComments);
    setNewComment('');

    // Update task via onUpdate callback
    if (onUpdate) {
      onUpdate({ ...task, comments: updatedComments });
    }
  };

  const handleToggleReaction = (commentId, reactionType) => {
    const currentUserId = currentUser?._id || currentUser?.id;
    const updatedComments = comments.map(c => {
      if (c.id === commentId) {
        const existingReaction = c.reactions.find(r => r.type === reactionType && r.userId === currentUserId);
        if (existingReaction) {
          return {
            ...c,
            reactions: c.reactions.filter(r => !(r.type === reactionType && r.userId === currentUserId))
          };
        } else {
          return {
            ...c,
            reactions: [...c.reactions, { type: reactionType, userId: currentUserId, userName: currentUser?.name || 'You' }]
          };
        }
      }
      return c;
    });
    setComments(updatedComments);
    if (onUpdate) onUpdate({ ...task, comments: updatedComments });
  };

  const handleDeleteComment = (commentId) => {
    const updatedComments = comments.filter(c => c.id !== commentId);
    setComments(updatedComments);
    setShowMenu(null);
    if (onUpdate) onUpdate({ ...task, comments: updatedComments });
  };

  const handleEditComment = (comment) => {
    setEditingId(comment.id);
    setEditText(comment.text);
    setShowMenu(null);
  };

  const handleSaveEdit = (commentId) => {
    const updatedComments = comments.map(c =>
      c.id === commentId ? { ...c, text: editText, edited: true } : c
    );
    setComments(updatedComments);
    setEditingId(null);
    if (onUpdate) onUpdate({ ...task, comments: updatedComments });
  };

  const renderMentions = (text) => {
    const parts = text.split(/(@[A-Za-z\s]+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        const userName = part.slice(1).trim();
        const user = allUsers.find(u => u.name === userName);
        return (
          <span
            key={i}
            className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1 rounded font-medium"
            title={user?.email}
          >
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="space-y-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
        <FiMessageCircle size={18} />
        <h3 className="font-semibold">Comments ({comments.length})</h3>
      </div>

      {/* Comments List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {comments.map(comment => (
          <div key={comment.id} className="bg-white dark:bg-gray-900 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <span className="text-2xl">{comment.author.avatar}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{comment.author.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                    {comment.edited && (
                      <span className="text-xs text-gray-400 dark:text-gray-500 italic">(edited)</span>
                    )}
                  </div>
                  {editingId === comment.id ? (
                    <div className="mt-2">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                        rows={2}
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleSaveEdit(comment.id)}
                          className="px-3 py-1 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-400 dark:hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300 mt-1 leading-relaxed">
                      {renderMentions(comment.text)}
                    </p>
                  )}

                  {/* Reactions */}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {REACTIONS.map(reaction => {
                      const Icon = reaction.icon;
                      const userReactions = comment.reactions.filter(r => r.type === reaction.type);
                      const hasReacted = userReactions.some(r => r.userId === (currentUser?._id || currentUser?.id));
                      return (
                        <button
                          key={reaction.type}
                          onClick={() => handleToggleReaction(comment.id, reaction.type)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors ${
                            hasReacted
                              ? `${reaction.color} bg-gray-200 dark:bg-gray-700 font-semibold`
                              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                          title={reaction.label}
                        >
                          <Icon size={14} />
                          {userReactions.length > 0 && <span>{userReactions.length}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Menu */}
              {comment.author.id === (currentUser?._id || currentUser?.id) && (
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(showMenu === comment.id ? null : comment.id)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  >
                    <FiMoreVertical size={16} className="text-gray-500" />
                  </button>
                  {showMenu === comment.id && (
                    <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 py-1 z-10 min-w-[120px]">
                      <button
                        onClick={() => handleEditComment(comment)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm"
                      >
                        <FiEdit2 size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="w-full px-3 py-2 text-left hover:bg-red-50 dark:hover:bg-red-900 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm"
                      >
                        <FiTrash2 size={14} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* New Comment Input */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={newComment}
          onChange={handleCommentChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              handleSubmitComment();
            }
          }}
          placeholder="Add a comment... (Use @ to mention someone)"
          className="w-full p-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          rows={3}
        />
        
        {/* @mention autocomplete */}
        {showMentions && (
          <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 py-1 max-h-48 overflow-y-auto z-20 min-w-[250px]">
            {mentionUsers.map(user => (
              <button
                key={user._id || user.id}
                onClick={() => insertMention(user)}
                className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
              >
                <span className="text-xl">{user.avatarUrl || '👤'}</span>
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{user.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        <button
          onClick={handleSubmitComment}
          disabled={!newComment.trim()}
          className="absolute right-3 bottom-3 p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <FiSend size={16} />
        </button>

        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Press <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Ctrl</kbd> + <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Enter</kbd> to send
        </div>
      </div>
    </div>
  );
}
