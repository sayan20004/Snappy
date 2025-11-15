import { useState } from 'react';
import { useUpdateTodo, useDeleteTodo } from '../hooks/useTodos';
import { FiTrash2, FiEdit2, FiCheck, FiMoreVertical } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useSwipe, triggerHaptic } from '../hooks/useMobile';
import { format } from 'date-fns';

export default function TaskCard({ todo }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [showMenu, setShowMenu] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  
  const updateTodoMutation = useUpdateTodo();
  const deleteTodoMutation = useDeleteTodo();

  const swipeHandlers = useSwipe(
    () => {
      // Swipe left to delete
      if (confirm('Delete this task?')) {
        triggerHaptic('success');
        deleteTodoMutation.mutate(todo._id);
      } else {
        setSwipeOffset(0);
      }
    },
    () => {
      // Swipe right to complete
      triggerHaptic('light');
      updateTodoMutation.mutate({
        id: todo._id,
        data: { status: todo.status === 'done' ? 'todo' : 'done' }
      });
    },
    100
  );

  const handleToggleComplete = () => {
    updateTodoMutation.mutate({
      id: todo._id,
      data: { status: todo.status === 'done' ? 'todo' : 'done' },
    });
  };

  const handleSaveEdit = () => {
    if (editTitle.trim() && editTitle !== todo.title) {
      updateTodoMutation.mutate({
        id: todo._id,
        data: { title: editTitle.trim() },
      });
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm('Delete this task?')) {
      deleteTodoMutation.mutate(todo._id);
    }
  };

  const priorityColors = {
    0: 'bg-gray-200',
    1: 'bg-blue-200',
    2: 'bg-yellow-200',
    3: 'bg-red-200',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.15 }}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all p-4 ${
        todo.status === 'done' ? 'opacity-60' : ''
      }`}
      {...swipeHandlers}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={handleToggleComplete}
          className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
            todo.status === 'done'
              ? 'bg-primary-600 border-primary-600'
              : 'border-gray-300 hover:border-primary-500'
          }`}
        >
          {todo.status === 'done' && <FiCheck className="text-white" size={14} />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSaveEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveEdit();
                if (e.key === 'Escape') {
                  setIsEditing(false);
                  setEditTitle(todo.title);
                }
              }}
              className="input w-full"
              autoFocus
            />
          ) : (
            <h3
              onDoubleClick={() => setIsEditing(true)}
              className={`text-base font-medium cursor-text ${
                todo.status === 'done' ? 'line-through text-gray-500' : 'text-gray-900'
              }`}
            >
              {todo.title}
            </h3>
          )}

          {todo.note && (
            <p className="text-sm text-gray-600 mt-1">{todo.note}</p>
          )}

          {/* Meta info */}
          <div className="flex items-center gap-3 mt-2">
            {todo.tags?.length > 0 && (
              <div className="flex gap-1">
                {todo.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {todo.dueAt && (
              <span className="text-xs text-gray-500">
                Due {format(new Date(todo.dueAt), 'MMM d')}
              </span>
            )}

            <span className="text-xs text-gray-400">
              {format(new Date(todo.createdAt), 'MMM d, h:mm a')}
            </span>
          </div>
        </div>

        {/* Priority indicator */}
        <div className={`w-1 h-8 rounded ${priorityColors[todo.priority]}`} />

        {/* Actions */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <FiMoreVertical />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 animate-scale-in">
              <button
                onClick={() => {
                  setIsEditing(true);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <FiEdit2 size={14} />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-red-600 flex items-center gap-2"
              >
                <FiTrash2 size={14} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
