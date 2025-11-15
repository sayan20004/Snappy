import { useState } from 'react';
import { useUpdateTodo, useDeleteTodo } from '../hooks/useTodos';
import { FiTrash2, FiEdit2, FiCheck, FiMoreVertical, FiLink, FiList, FiClock, FiBattery, FiMapPin, FiChevronDown, FiChevronRight, FiMessageCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import TaskComments from './TaskComments';

export default function EnhancedTaskCard({ todo }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [showMenu, setShowMenu] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  
  const updateTodoMutation = useUpdateTodo();
  const deleteTodoMutation = useDeleteTodo();

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

  const handleToggleSubStep = (subStepId, completed) => {
    const updatedSubSteps = todo.subSteps?.map(step =>
      step._id === subStepId ? { ...step, completed: !completed } : step
    );
    updateTodoMutation.mutate({
      id: todo._id,
      data: { subSteps: updatedSubSteps },
    });
  };

  const priorityColors = {
    0: 'bg-gray-200',
    1: 'bg-blue-200',
    2: 'bg-yellow-200',
    3: 'bg-red-200',
  };

  const energyIcons = {
    low: '🔋',
    medium: '⚡',
    high: '🚀',
  };

  const moodIcons = {
    creative: '🎨',
    analytical: '🧠',
    administrative: '📋',
    social: '💬',
  };

  const hasContext = todo.note || todo.links?.length > 0 || todo.subSteps?.length > 0;
  const completedSubSteps = todo.subSteps?.filter(s => s.completed).length || 0;
  const totalSubSteps = todo.subSteps?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.15 }}
      className={`card card-hover p-4 ${
        todo.status === 'done' ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={handleToggleComplete}
          className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
            todo.status === 'done'
              ? 'bg-primary-600 border-primary-600'
              : 'border-gray-300 hover:border-primary-500'
          }`}
        >
          {todo.status === 'done' && <FiCheck className="text-white" size={14} />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
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
            <div className="flex items-start gap-2">
              <h3
                onDoubleClick={() => setIsEditing(true)}
                className={`text-base font-medium cursor-text flex-1 ${
                  todo.status === 'done' ? 'line-through text-gray-500' : 'text-gray-900'
                }`}
              >
                {todo.title}
              </h3>
              
              {hasContext && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  title="Show details"
                >
                  {expanded ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
                </button>
              )}
            </div>
          )}

          {/* Quick Meta Info */}
          <div className="flex items-center gap-3 mt-2 flex-wrap text-xs">
            {/* Energy Level */}
            {todo.energyLevel && (
              <span className="flex items-center gap-1 text-gray-600" title={`${todo.energyLevel} energy`}>
                {energyIcons[todo.energyLevel]}
                <span className="capitalize">{todo.energyLevel}</span>
              </span>
            )}

            {/* Effort */}
            {todo.effortMinutes && (
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full" title="Estimated time">
                <FiClock size={10} className="inline mr-1" />
                {todo.effortMinutes < 60 ? `${todo.effortMinutes}m` : `${Math.round(todo.effortMinutes / 60)}h`}
              </span>
            )}

            {/* Location */}
            {todo.location && todo.location !== 'anywhere' && (
              <span className="flex items-center gap-1 text-gray-600">
                <FiMapPin size={10} />
                {todo.location}
              </span>
            )}

            {/* Mood/Type */}
            {todo.mood && (
              <span className="flex items-center gap-1 text-gray-600" title={todo.mood}>
                {moodIcons[todo.mood]}
              </span>
            )}

            {/* Sub-steps progress */}
            {totalSubSteps > 0 && (
              <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full">
                <FiList size={10} className="inline mr-1" />
                {completedSubSteps}/{totalSubSteps}
              </span>
            )}

            {/* Tags */}
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

            {/* Due date */}
            {todo.dueAt && (
              <span className="text-gray-500">
                Due {format(new Date(todo.dueAt), 'MMM d')}
              </span>
            )}

            {/* Created */}
            <span className="text-gray-400">
              {format(new Date(todo.createdAt), 'MMM d, h:mm a')}
            </span>
          </div>

          {/* Expanded Context */}
          <AnimatePresence>
            {expanded && hasContext && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-3 space-y-3 overflow-hidden"
              >
                {/* Note */}
                {todo.note && (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{todo.note}</p>
                  </div>
                )}

                {/* Links */}
                {todo.links?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                      <FiLink size={12} />
                      Links
                    </h4>
                    {todo.links.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-2 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <FiLink size={12} className="text-blue-600 flex-shrink-0" />
                          <span className="text-sm text-blue-700 truncate">{link.title || link.url}</span>
                        </div>
                        {link.description && (
                          <p className="text-xs text-gray-600 mt-1">{link.description}</p>
                        )}
                      </a>
                    ))}
                  </div>
                )}

                {/* Sub-steps */}
                {todo.subSteps?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                      <FiList size={12} />
                      Sub-steps
                    </h4>
                    <div className="space-y-1">
                      {todo.subSteps.map((step, idx) => (
                        <div
                          key={step._id || idx}
                          className="flex items-center gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                        >
                          <button
                            onClick={() => handleToggleSubStep(step._id, step.completed)}
                            className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                              step.completed
                                ? 'bg-primary-600 border-primary-600'
                                : 'border-gray-300'
                            }`}
                          >
                            {step.completed && <FiCheck className="text-white" size={10} />}
                          </button>
                          <span className={`text-sm flex-1 ${step.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                            {step.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Comments Section */}
          <AnimatePresence>
            {showComments && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <TaskComments 
                  task={todo} 
                  onUpdate={(updatedTask) => {
                    updateTodoMutation.mutate({
                      id: todo._id,
                      data: { comments: updatedTask.comments }
                    });
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Priority indicator */}
        <div className={`w-1 h-8 rounded flex-shrink-0 ${priorityColors[todo.priority || 2]}`} />

        {/* Actions */}
        <div className="relative flex-shrink-0">
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
