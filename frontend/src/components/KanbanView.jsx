import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiPlus } from 'react-icons/fi';
import EnhancedTaskCard from './EnhancedTaskCard';
import { useUpdateTodo } from '../hooks/useTodos';

export default function KanbanView({ todos }) {
  const updateTodoMutation = useUpdateTodo();

  const columns = useMemo(() => {
    const grouped = {
      todo: [],
      'in-progress': [],
      done: []
    };

    todos.forEach(todo => {
      if (grouped[todo.status]) {
        grouped[todo.status].push(todo);
      }
    });

    return [
      { id: 'todo', title: 'To Do', color: 'gray', todos: grouped.todo },
      { id: 'in-progress', title: 'In Progress', color: 'blue', todos: grouped['in-progress'] },
      { id: 'done', title: 'Done', color: 'green', todos: grouped.done }
    ];
  }, [todos]);

  const handleDragStart = (e, todo) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('todoId', todo._id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, status) => {
    e.preventDefault();
    const todoId = e.dataTransfer.getData('todoId');
    updateTodoMutation.mutate({
      id: todoId,
      data: { status }
    });
  };

  return (
    <div className="flex gap-6 h-full overflow-x-auto pb-4">
      {columns.map(column => (
        <div
          key={column.id}
          className="flex-shrink-0 w-96"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          {/* Column Header */}
          <div className={`bg-${column.color}-50 border-2 border-${column.color}-200 rounded-lg p-4 mb-4`}>
            <div className="flex items-center justify-between">
              <h3 className={`font-semibold text-${column.color}-900 flex items-center gap-2`}>
                {column.title}
                <span className={`text-xs px-2 py-1 rounded-full bg-${column.color}-200 text-${column.color}-700`}>
                  {column.todos.length}
                </span>
              </h3>
              <button className={`p-1 hover:bg-${column.color}-100 rounded transition-colors`}>
                <FiPlus size={16} />
              </button>
            </div>
          </div>

          {/* Cards */}
          <div className="space-y-3 min-h-[200px]">
            {column.todos.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                Drop tasks here
              </div>
            ) : (
              column.todos.map((todo, idx) => (
                <motion.div
                  key={todo._id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, todo)}
                  className="cursor-move"
                >
                  <EnhancedTaskCard todo={todo} />
                </motion.div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
