import { useState, useEffect } from 'react';
import { FiSun, FiTrendingUp, FiZap, FiClock, FiRefreshCw, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useTodos, useUpdateTodo } from '../hooks/useTodos';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../api/client';

// STEVE JOBS: "Real World Solution" - No fake setTimeout, real AI backend calls
export default function IntentionEngine() {
  const { data: todosData, isLoading: todosLoading } = useTodos({ status: 'todo' });
  const updateTodoMutation = useUpdateTodo();
  const [isGenerating, setIsGenerating] = useState(false);
  const [schedule, setSchedule] = useState(null);
  const [error, setError] = useState(null);
  const [userEnergy, setUserEnergy] = useState('medium');

  const generateSchedule = async () => {
    if (!todosData?.todos?.length) {
      toast.error('No tasks to schedule');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // REAL AI CALL - No fake logic
      const response = await api.post('/ai/schedule/generate', {
        workHoursStart: '09:00',
        workHoursEnd: '17:00',
        userEnergy
      });

      setSchedule(response.data);
      toast.success('✨ ' + (response.data.summary || 'Your intelligent schedule is ready!'));
    } catch (err) {
      console.error('Schedule generation failed:', err);
      setError(err.response?.data?.message || 'Failed to generate schedule');
      toast.error('AI scheduling failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    // Auto-generate on mount if we have todos
    if (todosData?.todos?.length > 0 && !schedule) {
      generateSchedule();
    }
  }, [todosData]);

  if (todosLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!todosData?.todos?.length) {
    return (
      <div className="p-8 text-center">
        <FiCheckCircle className="mx-auto text-gray-400 mb-4" size={48} />
        <p className="text-gray-600 dark:text-gray-400">All caught up! Add tasks to see your AI-powered schedule.</p>
      </div>
    );
  }

  const getRecommendationReason = (task, hour) => {
    const reasons = [];
    
    if (task.priority >= 3) reasons.push('High priority');
    if (task.dueAt && (new Date(task.dueAt) - Date.now()) < 24 * 60 * 60 * 1000) {
      reasons.push('Due soon');
    }
    if (task.energyLevel === 'high' && hour < 12) reasons.push('Peak energy time');
    if (task.effortMinutes <= 15) reasons.push('Quick win');
    if ((Date.now() - new Date(task.createdAt)) > 3 * 24 * 60 * 60 * 1000) {
      reasons.push('Long-standing');
    }
    
    return reasons[0] || 'Suggested by AI';
  };

  const generateInsights = (allTasks, blocks) => {
    const insights = [];
    
    const quickWins = blocks.filter(b => b.task.effortMinutes <= 15).length;
    if (quickWins >= 2) {
      insights.push({
        type: 'success',
        icon: FiZap,
        text: `Start with ${quickWins} quick wins to build momentum`
      });
    }
    
    const highEnergyTasks = blocks.filter(b => b.task.energyLevel === 'high').length;
    if (highEnergyTasks > 0 && new Date().getHours() < 12) {
      insights.push({
        type: 'info',
        icon: FiSun,
        text: `${highEnergyTasks} high-energy tasks scheduled for morning peak`
      });
    }
    
    const overdueTasks = allTasks.filter(t => t.dueAt && new Date(t.dueAt) < Date.now()).length;
    if (overdueTasks > 0) {
      insights.push({
        type: 'warning',
        icon: FiClock,
        text: `${overdueTasks} overdue tasks need attention`
      });
    }
    
    const totalFocusTime = blocks.reduce((sum, b) => sum + b.duration, 0);
    insights.push({
      type: 'success',
      icon: FiTrendingUp,
      text: `${Math.round(totalFocusTime / 60)}h of focused work planned`
    });
    
    return insights;
  };

  const applyPlan = async () => {
    if (!dailyPlan) return;
    
    for (let i = 0; i < dailyPlan.blocks.length; i++) {
      const block = dailyPlan.blocks[i];
      await updateTodoMutation.mutateAsync({
        id: block.task._id,
        data: {
          priority: Math.max(block.task.priority, 2),
          bestTimeToComplete: format(block.startTime, 'HH:mm')
        }
      });
    }
    
    toast.success('Plan applied to your tasks!');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent flex items-center gap-3">
            <span className="text-4xl">🧠</span>
            Intention Engine
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
            AI-powered intelligent scheduling • Real-time optimization
          </p>
        </div>

        <div className="flex gap-3 items-center flex-wrap">
          {/* Energy Level Selector */}
          <div className="relative">
            <select
              value={userEnergy}
              onChange={(e) => setUserEnergy(e.target.value)}
              className="appearance-none px-4 py-2.5 pr-10 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-sm font-semibold bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:border-primary-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 transition-all cursor-pointer"
            >
              <option value="low">⚡ Low Energy</option>
              <option value="medium">⚡⚡ Medium Energy</option>
              <option value="high">⚡⚡⚡ High Energy</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <button
            onClick={generateSchedule}
            disabled={isGenerating}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <FiRefreshCw className={isGenerating ? 'animate-spin' : ''} size={18} />
            {isGenerating ? 'AI Analyzing...' : 'Generate Schedule'}
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 dark:bg-red-500/20 border-2 border-red-500/50 rounded-xl p-5 flex items-start gap-4 backdrop-blur-sm"
        >
          <div className="p-2 bg-red-500/20 rounded-lg">
            <FiAlertCircle className="text-red-600 dark:text-red-400" size={24} />
          </div>
          <div className="flex-1">
            <p className="text-red-900 dark:text-red-200 font-bold text-lg">Schedule Generation Failed</p>
            <p className="text-red-700 dark:text-red-300 text-sm mt-1">{error}</p>
            <button 
              onClick={generateSchedule}
              className="mt-3 text-sm font-semibold text-red-600 dark:text-red-400 hover:underline"
            >
              Try Again →
            </button>
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 border-2 border-blue-300/50 dark:border-blue-500/30 rounded-2xl p-12 text-center backdrop-blur-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 animate-pulse" />
          <div className="relative z-10">
            <div className="w-20 h-20 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              AI is analyzing your workflow...
            </h3>
            <p className="text-gray-600 dark:text-gray-300 font-medium mb-2">
              Considering tasks, energy levels, priorities, and deadlines
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Powered by Google Gemini • Real-time optimization
            </p>
          </div>
        </motion.div>
      )}

      {/* AI-Generated Schedule */}
      {schedule && !isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Summary Banner */}
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 dark:from-blue-500 dark:via-purple-500 dark:to-pink-500 rounded-2xl p-8 shadow-2xl">
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
            
            <div className="relative z-10 flex items-start gap-6">
              <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl shadow-lg">
                <FiZap className="text-white drop-shadow-lg" size={32} />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-2 drop-shadow-lg">
                  ✨ Your AI-Optimized Schedule is Ready
                </h3>
                <p className="text-white/95 text-lg font-medium leading-relaxed drop-shadow">
                  {schedule.summary}
                </p>
                <div className="mt-4 flex items-center gap-4 text-white/80 text-sm">
                  <div className="flex items-center gap-2">
                    <FiClock size={16} />
                    <span>Generated {new Date(schedule.generatedAt).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiCheckCircle size={16} />
                    <span>{schedule.schedule.length} time blocks</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Warnings */}
          {schedule.warnings && schedule.warnings.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-amber-500/10 dark:bg-amber-500/20 border-2 border-amber-500/50 rounded-xl p-4 backdrop-blur-sm"
            >
              {schedule.warnings.map((warning, i) => (
                <div key={i} className="flex items-start gap-3 text-amber-900 dark:text-amber-200">
                  <FiAlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{warning}</p>
                </div>
              ))}
            </motion.div>
          )}

          {/* Schedule Blocks */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                  <FiClock className="text-white" size={20} />
                </div>
                Your Optimized Timeline
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                {schedule.schedule.length} blocks scheduled
              </span>
            </div>

            <div className="space-y-3">
              {schedule.schedule.map((block, idx) => {
                const isBreak = block.title.toLowerCase().includes('break') || 
                               block.title.toLowerCase().includes('lunch') || 
                               block.title.toLowerCase().includes('buffer');
                
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`group relative overflow-hidden rounded-2xl transition-all duration-300 ${
                      isBreak 
                        ? 'bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800/70 border-2 border-gray-300/50 dark:border-gray-700/50' 
                        : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xl'
                    }`}
                  >
                    {!isBreak && (
                      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-600" />
                    )}
                    
                    <div className="p-6">
                      <div className="flex items-start gap-5">
                        {/* Time Badge */}
                        <div className={`flex-shrink-0 px-4 py-3 rounded-xl font-bold text-sm shadow-md transition-all ${
                          isBreak
                            ? 'bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            : 'bg-gradient-to-br from-blue-600 to-purple-600 text-white group-hover:shadow-lg group-hover:scale-105'
                        }`}>
                          <div className="flex flex-col items-center">
                            <span className="text-xs opacity-75">Start</span>
                            <span className="text-base">{block.startTime}</span>
                            <div className="w-8 border-t border-current opacity-30 my-1" />
                            <span className="text-xs opacity-75">End</span>
                            <span className="text-base">{block.endTime}</span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <h4 className={`text-xl font-bold leading-tight ${
                              isBreak 
                                ? 'text-gray-600 dark:text-gray-400' 
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {isBreak ? '☕ ' : '📌 '}
                              {block.title}
                            </h4>
                            {!isBreak && (
                              <div className="flex-shrink-0 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full">
                                Task #{idx + 1}
                              </div>
                            )}
                          </div>

                          <p className={`text-sm leading-relaxed mb-4 ${
                            isBreak 
                              ? 'text-gray-600 dark:text-gray-400 italic' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {block.reasoning}
                          </p>

                          {/* Energy Match Bar */}
                          {block.energyMatch && block.energyMatch > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs font-semibold">
                                <span className="text-gray-600 dark:text-gray-400">
                                  Energy Match Score
                                </span>
                                <span className={`${
                                  block.energyMatch >= 0.8 ? 'text-green-600 dark:text-green-400' :
                                  block.energyMatch >= 0.6 ? 'text-amber-600 dark:text-amber-400' :
                                  'text-orange-600 dark:text-orange-400'
                                }`}>
                                  {Math.round(block.energyMatch * 100)}% Perfect Match
                                </span>
                              </div>
                              <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${block.energyMatch * 100}%` }}
                                  transition={{ duration: 1, delay: idx * 0.1 }}
                                  className={`h-full rounded-full relative overflow-hidden ${
                                    block.energyMatch >= 0.8 ? 'bg-gradient-to-r from-green-400 via-green-500 to-green-600' :
                                    block.energyMatch >= 0.6 ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600' :
                                    'bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600'
                                  }`}
                                >
                                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                </motion.div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
                </motion.div>
              );
            })}
          </div>

          {/* Regenerate button */}
          <button
            onClick={generateSchedule}
            disabled={isGenerating}
            className="w-full py-4 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-600 text-gray-900 dark:text-white font-bold rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 group"
          >
            <FiRefreshCw className="group-hover:rotate-180 transition-transform duration-500" size={20} />
            <span>Regenerate Schedule with Different Strategy</span>
          </button>
        </motion.div>
      )}
    </div>
  );
}
