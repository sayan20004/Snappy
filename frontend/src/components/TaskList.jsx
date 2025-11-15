import { useMemo } from 'react';
import EnhancedTaskCard from './EnhancedTaskCard';

export default function TaskList({ todos, searchQuery }) {
  const filteredTodos = useMemo(() => {
    if (!searchQuery) return todos;
    
    const query = searchQuery.toLowerCase();
    return todos.filter(
      (todo) =>
        todo.title.toLowerCase().includes(query) ||
        todo.note?.toLowerCase().includes(query) ||
        todo.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [todos, searchQuery]);

  if (filteredTodos.length === 0 && searchQuery) {
    return (
      <div className="text-center py-12 text-gray-400">
        No tasks match "{searchQuery}"
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {filteredTodos.map((todo) => (
        <EnhancedTaskCard key={todo._id} todo={todo} />
      ))}
    </div>
  );
}