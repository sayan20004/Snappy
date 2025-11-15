import { useState, useMemo } from 'react';
import { format, startOfDay, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isSameDay } from 'date-fns';
import { FiActivity, FiClock, FiCheckCircle, FiPlus, FiEdit, FiTrash, FiBarChart2 } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function ActivityTimeline({ todos }) {
  const [view, setView] = useState('daily'); // 'daily' | 'weekly'
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Calculate daily statistics
  const dailyStats = useMemo(() => {
    if (!todos) return null;

    const today = startOfDay(selectedDate);
    const todayTodos = todos.filter(todo => 
      isSameDay(new Date(todo.createdAt), today)
    );
    const completedToday = todos.filter(todo => 
      todo.status === 'done' && todo.completedAt && isSameDay(new Date(todo.completedAt), today)
    );

    const totalFocusTime = completedToday.reduce((sum, todo) => 
      sum + (todo.totalFocusTime || 0), 0
    );

    const activityLog = [
      ...todayTodos.map(todo => ({
        type: 'created',
        time: new Date(todo.createdAt),
        todo,
        icon: FiPlus,
        color: 'blue'
      })),
      ...completedToday.map(todo => ({
        type: 'completed',
        time: new Date(todo.completedAt),
        todo,
        icon: FiCheckCircle,
        color: 'green'
      }))
    ].sort((a, b) => b.time - a.time);

    return {
      created: todayTodos.length,
      completed: completedToday.length,
      focusTime: totalFocusTime,
      activityLog
    };
  }, [todos, selectedDate]);

  // Calculate weekly statistics
  const weeklyStats = useMemo(() => {
    if (!todos) return null;

    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
    const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const dailyData = daysInWeek.map(day => {
      const dayTodos = todos.filter(todo => 
        isSameDay(new Date(todo.createdAt), day)
      );
      const completed = todos.filter(todo => 
        todo.status === 'done' && todo.completedAt && isSameDay(new Date(todo.completedAt), day)
      );
      const focusTime = completed.reduce((sum, todo) => sum + (todo.totalFocusTime || 0), 0);

      return {
        date: day,
        created: dayTodos.length,
        completed: completed.length,
        focusTime
      };
    });

    const totalCompleted = dailyData.reduce((sum, day) => sum + day.completed, 0);
    const totalFocusTime = dailyData.reduce((sum, day) => sum + day.focusTime, 0);
    const avgCompletionRate = totalCompleted / daysInWeek.length;

    return {
      dailyData,
      totalCompleted,
      totalFocusTime,
      avgCompletionRate
    };
  }, [todos, selectedDate]);

  const formatFocusTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiActivity />
            Activity Timeline
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Track your productivity patterns
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setView('daily')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              view === 'daily'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setView('weekly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              view === 'weekly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Weekly
          </button>
        </div>
      </div>

      {/* Daily View */}
      {view === 'daily' && dailyStats && (
        <div className="space-y-6">
          {/* Date Picker */}
          <div className="flex items-center gap-4">
            <input
              type="date"
              value={format(selectedDate, 'yyyy-MM-dd')}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="input"
            />
            {!isToday(selectedDate) && (
              <button
                onClick={() => setSelectedDate(new Date())}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Go to Today
              </button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FiPlus className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="text-2xl font-bold text-gray-900">{dailyStats.created}</p>
                </div>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <FiCheckCircle className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{dailyStats.completed}</p>
                </div>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <FiClock className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Focus Time</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatFocusTime(dailyStats.focusTime)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiActivity size={20} />
              Today's Activity
            </h3>
            
            {dailyStats.activityLog.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <FiActivity size={48} className="mx-auto mb-3 opacity-50" />
                <p>No activity recorded for this day</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dailyStats.activityLog.map((activity, idx) => {
                  const Icon = activity.icon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className={`w-8 h-8 rounded-full bg-${activity.color}-100 flex items-center justify-center flex-shrink-0 mt-1`}>
                        <Icon className={`text-${activity.color}-600`} size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium capitalize">{activity.type}</span>
                          {' '}
                          <span className="text-gray-600">{activity.todo.title}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {format(activity.time, 'h:mm a')}
                        </p>
                      </div>
                      {activity.todo.effortMinutes && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {formatFocusTime(activity.todo.effortMinutes)}
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Weekly View */}
      {view === 'weekly' && weeklyStats && (
        <div className="space-y-6">
          {/* Week Selector */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() - 7)))}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Previous Week
            </button>
            <span className="text-sm font-medium text-gray-900">
              {format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'MMM d')} - {format(endOfWeek(selectedDate, { weekStartsOn: 1 }), 'MMM d, yyyy')}
            </span>
            <button
              onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() + 7)))}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Next Week →
            </button>
          </div>

          {/* Weekly Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="card p-4">
              <p className="text-sm text-gray-500 mb-1">Total Completed</p>
              <p className="text-3xl font-bold text-gray-900">{weeklyStats.totalCompleted}</p>
            </div>
            <div className="card p-4">
              <p className="text-sm text-gray-500 mb-1">Total Focus Time</p>
              <p className="text-3xl font-bold text-gray-900">{formatFocusTime(weeklyStats.totalFocusTime)}</p>
            </div>
            <div className="card p-4">
              <p className="text-sm text-gray-500 mb-1">Avg per Day</p>
              <p className="text-3xl font-bold text-gray-900">{weeklyStats.avgCompletionRate.toFixed(1)}</p>
            </div>
          </div>

          {/* Daily Chart */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <FiBarChart2 size={20} />
              Daily Breakdown
            </h3>
            
            <div className="space-y-4">
              {weeklyStats.dailyData.map((day, idx) => {
                const maxCompleted = Math.max(...weeklyStats.dailyData.map(d => d.completed), 1);
                const width = (day.completed / maxCompleted) * 100;
                
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className={`font-medium ${isToday(day.date) ? 'text-primary-600' : 'text-gray-700'}`}>
                        {format(day.date, 'EEE, MMM d')}
                        {isToday(day.date) && ' (Today)'}
                      </span>
                      <span className="text-gray-500">
                        {day.completed} completed · {formatFocusTime(day.focusTime)}
                      </span>
                    </div>
                    <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${width}%` }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                        className={`h-full ${
                          isToday(day.date) ? 'bg-primary-500' : 'bg-blue-400'
                        } rounded-lg flex items-center justify-end px-3`}
                      >
                        {day.completed > 0 && (
                          <span className="text-white text-sm font-medium">
                            {day.completed}
                          </span>
                        )}
                      </motion.div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
