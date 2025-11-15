import { useMemo } from 'react';
import { motion } from 'framer-motion';
import EnhancedTaskCard from './EnhancedTaskCard';
import { FiAlertCircle, FiCalendar, FiTrash, FiInbox } from 'react-icons/fi';

export default function MatrixView({ todos }) {
  const quadrants = useMemo(() => {
    // Eisenhower Matrix: Urgent/Important
    const matrix = {
      urgentImportant: [],
      notUrgentImportant: [],
      urgentNotImportant: [],
      notUrgentNotImportant: []
    };

    todos.forEach(todo => {
      const isUrgent = todo.priority >= 2 || (todo.dueAt && new Date(todo.dueAt) < new Date(Date.now() + 2 * 24 * 60 * 60 * 1000));
      const isImportant = todo.priority >= 2;

      if (isUrgent && isImportant) {
        matrix.urgentImportant.push(todo);
      } else if (!isUrgent && isImportant) {
        matrix.notUrgentImportant.push(todo);
      } else if (isUrgent && !isImportant) {
        matrix.urgentNotImportant.push(todo);
      } else {
        matrix.notUrgentNotImportant.push(todo);
      }
    });

    return [
      {
        id: 'urgentImportant',
        title: 'Do First',
        subtitle: 'Urgent & Important',
        icon: FiAlertCircle,
        color: 'red',
        todos: matrix.urgentImportant,
        description: 'Critical tasks requiring immediate attention'
      },
      {
        id: 'notUrgentImportant',
        title: 'Schedule',
        subtitle: 'Not Urgent but Important',
        icon: FiCalendar,
        color: 'blue',
        todos: matrix.notUrgentImportant,
        description: 'Strategic work for long-term success'
      },
      {
        id: 'urgentNotImportant',
        title: 'Delegate',
        subtitle: 'Urgent but Not Important',
        icon: FiInbox,
        color: 'yellow',
        todos: matrix.urgentNotImportant,
        description: 'Tasks that could be delegated'
      },
      {
        id: 'notUrgentNotImportant',
        title: 'Eliminate',
        subtitle: 'Not Urgent & Not Important',
        icon: FiTrash,
        color: 'gray',
        todos: matrix.notUrgentNotImportant,
        description: 'Low-value activities to minimize'
      }
    ];
  }, [todos]);

  return (
    <div className="h-full">
      <div className="grid grid-cols-2 gap-4 h-full">
        {quadrants.map((quadrant, idx) => {
          const Icon = quadrant.icon;
          
          return (
            <motion.div
              key={quadrant.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={`bg-${quadrant.color}-50 border-2 border-${quadrant.color}-200 rounded-lg p-4 flex flex-col overflow-hidden`}
            >
              {/* Quadrant Header */}
              <div className="mb-4">
                <div className="flex items-start gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-lg bg-${quadrant.color}-100 flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`text-${quadrant.color}-600`} size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-xl font-bold text-${quadrant.color}-900 mb-1`}>
                      {quadrant.title}
                    </h3>
                    <p className={`text-sm font-medium text-${quadrant.color}-700`}>
                      {quadrant.subtitle}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full bg-${quadrant.color}-200 text-${quadrant.color}-700 font-semibold`}>
                    {quadrant.todos.length}
                  </span>
                </div>
                <p className={`text-xs text-${quadrant.color}-600`}>
                  {quadrant.description}
                </p>
              </div>

              {/* Tasks */}
              <div className="flex-1 overflow-y-auto space-y-2">
                {quadrant.todos.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No tasks in this quadrant
                  </div>
                ) : (
                  quadrant.todos.map((todo, todoIdx) => (
                    <motion.div
                      key={todo._id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 + todoIdx * 0.05 }}
                    >
                      <EnhancedTaskCard todo={todo} />
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Matrix Guide */}
      <div className="mt-4 bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">📊 Eisenhower Matrix Guide</h4>
        <div className="grid grid-cols-4 gap-3 text-xs">
          <div>
            <span className="font-medium text-red-700">Do First:</span>
            <span className="text-gray-600"> Crisis management, deadlines</span>
          </div>
          <div>
            <span className="font-medium text-blue-700">Schedule:</span>
            <span className="text-gray-600"> Planning, relationships, growth</span>
          </div>
          <div>
            <span className="font-medium text-yellow-700">Delegate:</span>
            <span className="text-gray-600"> Interruptions, some emails</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Eliminate:</span>
            <span className="text-gray-600"> Time wasters, busy work</span>
          </div>
        </div>
      </div>
    </div>
  );
}
