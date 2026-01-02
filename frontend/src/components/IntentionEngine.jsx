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
      const response = await api.post('/api/ai/schedule/generate', {
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
          <div className="bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-primary-200 dark:border-primary-800">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <FiZap className="text-primary-600 dark:text-primary-400" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">AI Schedule Ready</h3>
                <p className="text-gray-700 dark:text-gray-300">{schedule.summary}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
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
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Your Day</h3>
            {schedule.schedule.map((block, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="text-sm font-mono text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    {block.startTime} - {block.endTime}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">{block.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{block.reasoning}</p>
                    {block.energyMatch && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1.5 w-24 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 dark:bg-green-400 rounded-full"
                            style={{ width: `${block.energyMatch * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {Math.round(block.energyMatch * 100)}% energy match
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
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
