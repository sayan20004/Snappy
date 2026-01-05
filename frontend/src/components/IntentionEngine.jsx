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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            🧠 Intention Engine
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            AI-powered intelligent scheduling • Real backend analysis
          </p>
        </div>

        <div className="flex gap-3 items-center">
          {/* Energy Level Selector */}
          <select
            value={userEnergy}
            onChange={(e) => setUserEnergy(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="low">Low Energy</option>
            <option value="medium">Medium Energy</option>
            <option value="high">High Energy</option>
          </select>

          <button
            onClick={generateSchedule}
            disabled={isGenerating}
            className="btn btn-primary flex items-center gap-2"
          >
            <FiRefreshCw className={isGenerating ? 'animate-spin' : ''} />
            {isGenerating ? 'AI Thinking...' : 'Generate Schedule'}
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
          <FiAlertCircle className="text-red-600 dark:text-red-400" size={20} />
          <div>
            <p className="text-red-800 dark:text-red-200 font-medium">Schedule generation failed</p>
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card p-8 text-center bg-white dark:bg-gray-800"
        >
          <div className="w-16 h-16 border-4 border-primary-200 dark:border-primary-800 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Real AI analyzing your tasks, energy levels, and deadlines...</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Using Google Gemini for intelligent scheduling</p>
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
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg">
                <FiZap className="text-white" size={28} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">✨ AI Schedule Ready</h3>
                <p className="text-white/95 font-medium">{schedule.summary}</p>
                <p className="text-xs text-white/75 mt-3 font-medium">
                  Generated {new Date(schedule.generatedAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>

          {/* Warnings */}
          {schedule.warnings && schedule.warnings.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              {schedule.warnings.map((warning, i) => (
                <p key={i} className="text-yellow-800 dark:text-yellow-200 text-sm flex items-center gap-2">
                  <FiAlertCircle size={16} />
                  {warning}
                </p>
              ))}
            </div>
          )}

          {/* Schedule Blocks */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <FiClock className="text-primary-600" />
              Your Optimized Day
            </h3>
            {schedule.schedule.map((block, idx) => {
              const isBreak = block.title.toLowerCase().includes('break') || block.title.toLowerCase().includes('lunch');
              
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className={`rounded-lg p-5 border-2 shadow-sm hover:shadow-md transition-all ${
                    isBreak 
                      ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600'
                      : 'bg-white dark:bg-gray-800 border-primary-200 dark:border-primary-700 hover:border-primary-400 dark:hover:border-primary-500'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 bg-gradient-to-br from-primary-500 to-purple-600 text-white px-3 py-2 rounded-lg font-bold text-sm shadow-sm">
                      {block.startTime} — {block.endTime}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {block.title}
                      </h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {block.reasoning}
                      </p>
                      {block.energyMatch && block.energyMatch > 0 && (
                        <div className="mt-3 flex items-center gap-3">
                          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                block.energyMatch >= 0.8 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                                block.energyMatch >= 0.6 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                                'bg-gradient-to-r from-orange-400 to-orange-600'
                              }`}
                              style={{ width: `${block.energyMatch * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {Math.round(block.energyMatch * 100)}% match
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Regenerate button */}
          <button
            onClick={generateSchedule}
            className="w-full btn btn-outline flex items-center justify-center gap-2"
          >
            <FiRefreshCw />
            Regenerate Schedule
          </button>
        </motion.div>
      )}
    </div>
  );
}
