import { useState } from 'react';
import { useUpdateTodo, useDeleteTodo } from '../hooks/useTodos';
import { FiTrash2, FiEdit2, FiCheck, FiMoreVertical, FiBatteryCharging, FiBattery, FiZap } from 'react-icons/fi';
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

  // Energy level visual indicators
  const EnergyIndicator = ({ level }) => {
    const config = {
      low: { color: 'text-green-500 dark:text-green-400', icon: FiBattery, label: 'Low' },
      medium: { color: 'text-yellow-500 dark:text-yellow-400', icon: FiBatteryCharging, label: 'Med' },
      high: { color: 'text-red-500 dark:text-red-400', icon: FiZap, label: 'High' }
    };
    const { color, icon: Icon, label } = config[level] || config.low;
    return (
      <div className={`flex items-center gap-1 ${color}`} title={`${label} energy required`}>
        <Icon size={16} />
      </div>
    );
  };

  // Duration visual indicator (pie chart)
  const DurationIndicator = ({ minutes }) => {
    if (!minutes) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const displayTime = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    
    // Progress ring based on duration (normalize to 0-100)
    const normalizedPercent = Math.min((minutes / 120) * 100, 100);
    const circumference = 2 * Math.PI * 10;
    const strokeDashoffset = circumference - (normalizedPercent / 100) * circumference;

    return (
      <div className="flex items-center gap-1.5" title={`${displayTime} estimated`}>
        <svg width="20" height="20" className="transform -rotate-90">
          <circle
            cx="10"
            cy="10"
            r="8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-gray-200 dark:text-gray-700"
          />
          <circle
            cx="10"
            cy="10"
            r="8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="text-primary-500 dark:text-primary-400"
          />
        </svg>
        <span className="text-xs text-gray-600 dark:text-gray-400">{displayTime}</span>
      </div>
    );
  };

  const priorityColors = {
    0: 'bg-gray-200 dark:bg-gray-700',
    1: 'bg-blue-200 dark:bg-blue-900',
    2: 'bg-yellow-200 dark:bg-yellow-900',
    3: 'bg-red-200 dark:bg-red-900',
  };dark:text-gray-400 mt-1">{todo.note}</p>
          )}

          {/* Visual Meta Info */}
          <div className="flex items-center gap-4 mt-3">
            {/* Energy Level (Battery Icon) */}
            {todo.energyLevel && <EnergyIndicator level={todo.energyLevel} />}

            {/* Duration (Pie Chart) */}
            {todo.effortMinutes && <DurationIndicator minutes={todo.effortMinutes} />}

            {/* AI Confidence Badge */}
            {todo.aiClassification?.confidence > 0 && (
              <div 
                className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400"
                title={`AI confidence: ${Math.round(todo.aiClassification.confidence * 100)}%`}
              >
                <span className="text-xs">🤖</span>
                <span>{Math.round(todo.aiClassification.confidence * 100)}%</span>
              </div>
            )}

            {/* Tags */}
            {todo.tags?.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {todo.tags.slice(0, 2).map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  >
                    #{tag}
                  </span>
                ))}
                {todo.tags.length > 2 && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">+{todo.tags.length - 2}</span>
                )}
              </div>
            )}

            {/* Due Date */}
            {todo.dueAt && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                📅 {format(new Date(todo.dueAt), 'MMM d')}
              </span>
            )}
          </div>
        </div>

        {/* Priority indicator (vertical bar)
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
