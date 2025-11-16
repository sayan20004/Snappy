import { useState, useMemo } from 'react';
import { useUIStore } from '../store/uiStore';
import { useTodos } from '../hooks/useTodos';
import EnhancedQuickAdd from './EnhancedQuickAdd';
import AdvancedFilters from './AdvancedFilters';
import AdvancedSearch from './AdvancedSearch';
import CollaborationPresence from './CollaborationPresence';
import TaskList from './TaskList';
import KanbanView from './KanbanView';
import TimelineView from './TimelineView';
import MatrixView from './MatrixView';
import { FiTarget, FiList, FiColumns, FiCalendar, FiGrid, FiSearch } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { isToday, isThisWeek, isThisMonth, isPast } from 'date-fns';

export default function MainFeed() {
  const { selectedList, filterStatus, advancedFilters, setAdvancedFilters, resetAdvancedFilters } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'kanban' | 'timeline' | 'matrix'

  const filters = {
    ...(selectedList && { listId: selectedList }),
    ...(filterStatus && { status: filterStatus }),
  };

  const { data, isLoading } = useTodos(filters);

  // Apply advanced filters client-side
  const filteredTodos = useMemo(() => {
    if (!data?.todos) return [];
    let filtered = [...data.todos];

    // Energy level filter
    if (advancedFilters.energyLevel) {
      filtered = filtered.filter(t => t.energyLevel === advancedFilters.energyLevel);
    }

    // Effort range filter
    if (advancedFilters.effortRange) {
      const ranges = {
        quick: [0, 15],
        short: [15, 30],
        medium: [30, 60],
        long: [60, 120],
        extended: [120, 999]
      };
      const [min, max] = ranges[advancedFilters.effortRange];
      filtered = filtered.filter(t => t.effortMinutes >= min && t.effortMinutes < max);
    }

    // Location filter
    if (advancedFilters.location) {
      filtered = filtered.filter(t => t.location === advancedFilters.location);
    }

    // Mood filter
    if (advancedFilters.mood) {
      filtered = filtered.filter(t => t.mood === advancedFilters.mood);
    }

    // Deadline horizon filter
    if (advancedFilters.deadlineHorizon && advancedFilters.deadlineHorizon !== 'none') {
      filtered = filtered.filter(t => {
        if (!t.dueAt) return false;
        const dueDate = new Date(t.dueAt);
        switch (advancedFilters.deadlineHorizon) {
          case 'today': return isToday(dueDate);
          case 'week': return isThisWeek(dueDate, { weekStartsOn: 1 });
          case 'month': return isThisMonth(dueDate);
          case 'overdue': return isPast(dueDate) && !isToday(dueDate);
          default: return true;
        }
      });
    }

    // Quick toggles
    if (advancedFilters.hasDueDate) {
      filtered = filtered.filter(t => t.dueAt);
    }
    if (advancedFilters.hasSubSteps) {
      filtered = filtered.filter(t => t.subSteps?.length > 0);
    }
    if (advancedFilters.hasLinks) {
      filtered = filtered.filter(t => t.links?.length > 0);
    }

    return filtered;
  }, [data?.todos, advancedFilters]);

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {selectedList ? 'List View' : 'All Tasks'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {filteredTodos.length} of {data?.todos?.length || 0} tasks
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Mode Switcher */}
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {[
                { id: 'list', icon: FiList, label: 'List' },
                { id: 'kanban', icon: FiColumns, label: 'Kanban' },
                { id: 'timeline', icon: FiCalendar, label: 'Timeline' },
                { id: 'matrix', icon: FiGrid, label: 'Matrix' }
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setViewMode(id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                    viewMode === id
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                  title={label}
                >
                  <Icon size={16} />
                  <span className="hidden md:inline">{label}</span>
                </button>
              ))}
            </div>

            {/* Search toggle */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`p-2 rounded-lg transition-colors ${
                showSearch 
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title="Search tasks (Ctrl+F)"
            >
              <FiSearch size={20} />
            </button>

            <AdvancedFilters
              filters={advancedFilters}
              onFilterChange={setAdvancedFilters}
              onReset={resetAdvancedFilters}
            />
            {selectedList && <CollaborationPresence listId={selectedList} />}
            <Link
              to="/focus"
              className="btn btn-primary flex items-center gap-2"
            >
              <FiTarget />
              Focus Mode
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="mt-4">
            <AdvancedSearch onResultClick={(todo) => {
              // Scroll to task or show in modal
              setShowSearch(false);
            }} />
          </div>
        )}
      </header>

      {/* Quick Add */}
      <div className="px-8 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <EnhancedQuickAdd listId={selectedList} />
      </div>

      {/* Content Views */}
      <div className="flex-1 overflow-y-auto px-8 py-4 bg-gray-50 dark:bg-gray-900">
        {isLoading ? (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">
            Loading tasks...
          </div>
        ) : filteredTodos.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {data?.todos?.length === 0 ? 'All caught up!' : 'No tasks match your filters'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {data?.todos?.length === 0 
                ? <>Add one with <kbd className="px-2 py-1 bg-gray-100 rounded">/</kbd></>
                : 'Try adjusting your filters to see more tasks'
              }
            </p>
          </div>
        ) : (
          <>
            {viewMode === 'list' && <TaskList todos={filteredTodos} searchQuery={searchQuery} />}
            {viewMode === 'kanban' && <KanbanView todos={filteredTodos} />}
            {viewMode === 'timeline' && <TimelineView todos={filteredTodos} />}
            {viewMode === 'matrix' && <MatrixView todos={filteredTodos} />}
          </>
        )}
      </div>
    </div>
  );
}
