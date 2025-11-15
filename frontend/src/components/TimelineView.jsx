import { useMemo } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addDays, differenceInDays } from 'date-fns';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useState } from 'react';

export default function TimelineView({ todos }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const tasksWithDates = useMemo(() => {
    return todos.filter(todo => todo.dueAt).map(todo => ({
      ...todo,
      dueDate: new Date(todo.dueAt),
      startDate: todo.createdAt ? new Date(todo.createdAt) : new Date()
    }));
  }, [todos]);

  const getTaskPosition = (task) => {
    const daysSinceWeekStart = differenceInDays(task.dueDate, weekStart);
    if (daysSinceWeekStart < 0 || daysSinceWeekStart > 6) return null;
    
    const left = (daysSinceWeekStart / 7) * 100;
    const width = Math.max(2, (task.effortMinutes || 30) / 60 * 2); // Width based on effort
    
    return { left: `${left}%`, width: `${width}%` };
  };

  const priorityColors = {
    0: 'bg-gray-400',
    1: 'bg-blue-400',
    2: 'bg-yellow-400',
    3: 'bg-red-400'
  };

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
        <button
          onClick={() => setCurrentDate(addDays(currentDate, -7))}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiChevronLeft />
        </button>
        
        <h3 className="font-semibold text-gray-900">
          {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
        </h3>
        
        <button
          onClick={() => setCurrentDate(addDays(currentDate, 7))}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiChevronRight />
        </button>
      </div>

      {/* Timeline Grid */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
          {daysInWeek.map(day => (
            <div
              key={day.toString()}
              className="px-4 py-3 text-center border-r border-gray-200 last:border-r-0"
            >
              <div className="text-xs font-medium text-gray-500 uppercase">
                {format(day, 'EEE')}
              </div>
              <div className={`text-lg font-bold mt-1 ${
                isSameDay(day, new Date()) ? 'text-primary-600' : 'text-gray-900'
              }`}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>

        {/* Timeline Tracks */}
        <div className="p-4 min-h-[400px] relative">
          {/* Day Dividers */}
          <div className="absolute inset-0 grid grid-cols-7">
            {daysInWeek.map((day, idx) => (
              <div
                key={idx}
                className="border-r border-gray-100 last:border-r-0"
              />
            ))}
          </div>

          {/* Tasks */}
          <div className="relative space-y-2">
            {tasksWithDates.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                No tasks with due dates this week
              </div>
            ) : (
              tasksWithDates.map((task, idx) => {
                const position = getTaskPosition(task);
                if (!position) return null;

                return (
                  <motion.div
                    key={task._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`absolute h-12 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer group ${
                      priorityColors[task.priority || 2]
                    }`}
                    style={{
                      left: position.left,
                      width: position.width,
                      minWidth: '80px',
                      top: `${idx * 56}px`
                    }}
                  >
                    <div className="px-3 py-2 h-full flex flex-col justify-center">
                      <div className="text-sm font-medium text-white truncate">
                        {task.title}
                      </div>
                      {task.effortMinutes && (
                        <div className="text-xs text-white/80">
                          {task.effortMinutes < 60 ? `${task.effortMinutes}m` : `${Math.round(task.effortMinutes / 60)}h`}
                        </div>
                      )}
                    </div>
                    
                    {/* Hover Tooltip */}
                    <div className="absolute left-0 top-full mt-2 w-64 bg-gray-900 text-white p-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-sm">
                      <div className="font-medium mb-1">{task.title}</div>
                      {task.note && <div className="text-gray-300 text-xs">{task.note}</div>}
                      <div className="text-xs text-gray-400 mt-1">
                        Due: {format(task.dueDate, 'MMM d, h:mm a')}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
