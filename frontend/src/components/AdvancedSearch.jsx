import { useState, useEffect, useMemo } from 'react';
import { FiSearch, FiX, FiHelpCircle, FiFilter } from 'react-icons/fi';
import { useTodos } from '../hooks/useTodos';
import { useLists } from '../hooks/useLists';

// Search syntax parser
// Supports: tag:work @user due:today priority:high energy:high location:office mood:creative status:done
const parseSearchQuery = (query) => {
  const filters = {
    text: [],
    tags: [],
    mentions: [],
    dueDate: null,
    priority: null,
    energy: null,
    location: null,
    mood: null,
    status: null
  };

  const tokens = query.split(/\s+/);

  tokens.forEach(token => {
    if (token.startsWith('tag:')) {
      filters.tags.push(token.slice(4).toLowerCase());
    } else if (token.startsWith('@')) {
      filters.mentions.push(token.slice(1).toLowerCase());
    } else if (token.startsWith('due:')) {
      filters.dueDate = token.slice(4).toLowerCase();
    } else if (token.startsWith('priority:')) {
      const p = token.slice(9).toLowerCase();
      if (p === 'low') filters.priority = 1;
      else if (p === 'medium') filters.priority = 2;
      else if (p === 'high') filters.priority = 3;
    } else if (token.startsWith('energy:')) {
      filters.energy = token.slice(7).toLowerCase();
    } else if (token.startsWith('location:')) {
      filters.location = token.slice(9).toLowerCase();
    } else if (token.startsWith('mood:')) {
      filters.mood = token.slice(5).toLowerCase();
    } else if (token.startsWith('status:')) {
      filters.status = token.slice(7).toLowerCase();
    } else if (token.trim()) {
      filters.text.push(token.toLowerCase());
    }
  });

  return filters;
};

const matchesFilters = (todo, filters) => {
  // Text search (title, note, sub-steps)
  if (filters.text.length > 0) {
    const searchableText = [
      todo.title,
      todo.note,
      ...(todo.subSteps?.map(s => s.title) || []),
      ...(todo.tags || [])
    ].join(' ').toLowerCase();

    const allTextMatches = filters.text.every(text => searchableText.includes(text));
    if (!allTextMatches) return false;
  }

  // Tag filter
  if (filters.tags.length > 0) {
    const todoTags = (todo.tags || []).map(t => t.toLowerCase());
    const hasAllTags = filters.tags.every(tag => todoTags.includes(tag));
    if (!hasAllTags) return false;
  }

  // Due date filter
  if (filters.dueDate) {
    if (!todo.deadline) return false;
    const dueDate = new Date(todo.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (filters.dueDate === 'today') {
      if (dueDate.toDateString() !== today.toDateString()) return false;
    } else if (filters.dueDate === 'overdue') {
      if (dueDate >= today) return false;
    } else if (filters.dueDate === 'week') {
      const weekFromNow = new Date(today);
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      if (dueDate < today || dueDate > weekFromNow) return false;
    }
  }

  // Priority filter
  if (filters.priority !== null && todo.priority !== filters.priority) {
    return false;
  }

  // Energy filter
  if (filters.energy && todo.energyLevel !== filters.energy) {
    return false;
  }

  // Location filter
  if (filters.location && todo.location?.toLowerCase() !== filters.location) {
    return false;
  }

  // Mood filter
  if (filters.mood && todo.mood !== filters.mood) {
    return false;
  }

  // Status filter
  if (filters.status && todo.status !== filters.status) {
    return false;
  }

  return true;
};

export default function AdvancedSearch({ onResultClick }) {
  const [query, setQuery] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const { data: todosData } = useTodos();
  const { data: listsData } = useLists();

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];

    const todos = todosData?.todos || [];
    const lists = listsData?.lists || [];
    const filters = parseSearchQuery(query);
    
    const allTodos = todos.map(todo => {
      const list = lists.find(l => l._id === todo.listId);
      return {
        ...todo,
        listName: list?.name || 'Inbox'
      };
    });

    return allTodos
      .filter(todo => matchesFilters(todo, filters))
      .slice(0, 20); // Limit results
  }, [query, todosData, listsData]);

  const handleClear = () => {
    setQuery('');
  };

  const SYNTAX_EXAMPLES = [
    { syntax: 'meeting report', desc: 'Search in title and notes' },
    { syntax: 'tag:work tag:urgent', desc: 'Filter by multiple tags' },
    { syntax: '@john', desc: 'Find tasks mentioning @john' },
    { syntax: 'due:today', desc: 'Due today (also: overdue, week)' },
    { syntax: 'priority:high', desc: 'High priority (low/medium/high)' },
    { syntax: 'energy:high', desc: 'Energy level (low/medium/high)' },
    { syntax: 'location:office', desc: 'Specific location' },
    { syntax: 'mood:creative', desc: 'Mood type (creative/analytical/admin/social)' },
    { syntax: 'status:done', desc: 'Task status (todo/done/in-progress)' },
    { syntax: 'design tag:work priority:high', desc: 'Combine multiple filters' }
  ];

  return (
    <div className="relative w-full max-w-2xl">
      {/* Search Input */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tasks... (try: tag:work due:today priority:high)"
          className="w-full pl-10 pr-20 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <button
              onClick={handleClear}
              className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              title="Clear search"
            >
              <FiX size={16} className="text-gray-500" />
            </button>
          )}
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title="Search syntax help"
          >
            <FiHelpCircle size={16} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Help Panel */}
      {showHelp && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 shadow-xl rounded-lg border border-gray-200 dark:border-gray-700 p-4 z-50 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <FiFilter size={16} />
              Advanced Search Syntax
            </h3>
            <button
              onClick={() => setShowHelp(false)}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <FiX size={16} />
            </button>
          </div>
          <div className="space-y-2">
            {SYNTAX_EXAMPLES.map((example, idx) => (
              <div key={idx} className="flex gap-3 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <code className="px-2 py-1 bg-gray-100 dark:bg-gray-900 text-primary-600 dark:text-primary-400 rounded text-sm font-mono flex-shrink-0">
                  {example.syntax}
                </code>
                <span className="text-sm text-gray-600 dark:text-gray-400">{example.desc}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-700 dark:text-blue-300">
            💡 Tip: Combine multiple filters to narrow results. Press <kbd className="px-1 py-0.5 bg-white dark:bg-gray-800 rounded">Esc</kbd> to close this help.
          </div>
        </div>
      )}

      {/* Search Results */}
      {query && searchResults.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 shadow-xl rounded-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto z-40">
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
            </span>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {searchResults.map(todo => (
              <button
                key={todo._id}
                onClick={() => {
                  onResultClick?.(todo);
                  setQuery('');
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium text-gray-900 dark:text-gray-100 truncate ${
                      todo.status === 'done' ? 'line-through text-gray-500' : ''
                    }`}>
                      {todo.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{todo.listName}</span>
                      {todo.priority >= 3 && (
                        <span className="text-xs px-1.5 py-0.5 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded">
                          High Priority
                        </span>
                      )}
                      {todo.energyLevel && (
                        <span className="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded capitalize">
                          {todo.energyLevel} energy
                        </span>
                      )}
                      {todo.tags?.length > 0 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {todo.tags.slice(0, 2).map(tag => `#${tag}`).join(' ')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {query && searchResults.length === 0 && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 shadow-xl rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center z-40">
          <p className="text-gray-500 dark:text-gray-400">No tasks match your search</p>
          <button
            onClick={() => setShowHelp(true)}
            className="mt-2 text-sm text-primary-600 dark:text-primary-400 hover:underline"
          >
            View search syntax help
          </button>
        </div>
      )}
    </div>
  );
}
