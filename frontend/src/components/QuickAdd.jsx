import { useState } from 'react';
import { useCreateTodo } from '../hooks/useTodos';
import { FiPlus } from 'react-icons/fi';

export default function QuickAdd({ listId }) {
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [showNote, setShowNote] = useState(false);
  const createTodoMutation = useCreateTodo();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    createTodoMutation.mutate(
      {
        title: title.trim(),
        note: note.trim(),
        listId: listId || null,
      },
      {
        onSuccess: () => {
          setTitle('');
          setNote('');
          setShowNote(false);
        },
      }
    );
  };

  const handleKeyDown = (e) => {
    // Cmd/Ctrl + Enter to submit
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <input
          id="quick-add-input"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a task... (press / to focus)"
          className="input flex-1 text-lg"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={!title.trim() || createTodoMutation.isPending}
          className="btn btn-primary px-6"
        >
          <FiPlus size={20} />
        </button>
      </div>

      {showNote ? (
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note (optional)"
          className="input w-full resize-none"
          rows={2}
        />
      ) : (
        <button
          type="button"
          onClick={() => setShowNote(true)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          + Add note
        </button>
      )}

      <p className="text-xs text-gray-400">
        Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">Cmd/Ctrl + Enter</kbd> to add
      </p>
    </form>
  );
}
