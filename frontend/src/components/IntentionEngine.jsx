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
              const colors = {
                success: 'bg-green-50 border-green-200 text-green-700',
                info: 'bg-blue-50 border-blue-200 text-blue-700',
                warning: 'bg-yellow-50 border-yellow-200 text-yellow-700'
              };
              
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`card p-4 border-2 ${colors[insight.type]}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} />
                    <p className="text-sm font-medium">{insight.text}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Focus Score */}
          <div className="card p-6 bg-gradient-to-r from-primary-50 to-purple-50 border border-primary-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Today's Focus Score</h3>
                <p className="text-sm text-gray-600">Based on task coverage and energy alignment</p>
              </div>
              <div className="text-5xl font-bold text-primary-600">
                {dailyPlan.focusScore}
                <span className="text-2xl text-gray-400">/100</span>
              </div>
            </div>
          </div>

          {/* Time Blocks */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiClock />
              Recommended Schedule
            </h3>
            
            <div className="space-y-3">
              {dailyPlan.blocks.map((block, idx) => (
                <motion.div
                  key={block.task._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {/* Time */}
                  <div className="text-center flex-shrink-0 w-20">
                    <div className="text-sm font-semibold text-gray-900">
                      {format(block.startTime, 'h:mm a')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {block.duration}m
                    </div>
                  </div>

                  {/* Connector */}
                  <div className="w-3 h-3 rounded-full bg-primary-500 flex-shrink-0" />

                  {/* Task */}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{block.task.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {block.reason}
                      {block.task.energyLevel && (
                        <span className="ml-2">
                          • Energy: <span className="capitalize">{block.task.energyLevel}</span>
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Priority Badge */}
                  {block.task.priority >= 2 && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                      High Priority
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Generated timestamp */}
          <p className="text-xs text-gray-400 text-center">
            Plan generated at {format(dailyPlan.generatedAt, 'h:mm a')}
          </p>
        </motion.div>
      )}

      {/* Empty State */}
      {!dailyPlan && !isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          
          <div className="relative text-center py-16 px-8">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center transform rotate-3 shadow-xl">
              <span className="text-5xl">🧠</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              Ready to plan your day?
            </h3>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              The Intention Engine uses AI to create an optimal daily schedule based on your tasks, energy levels, and priorities.
            </p>
            <button
              onClick={generatePlan}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-500 to-purple-600 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <FiZap size={20} />
              Generate My Daily Plan
            </button>
            
            {/* Features */}
            <div className="grid grid-cols-3 gap-6 mt-12 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-white/10 rounded-lg flex items-center justify-center">
                  <FiZap className="text-yellow-400" size={24} />
                </div>
                <h4 className="text-white font-medium mb-1">Smart Prioritization</h4>
                <p className="text-gray-400 text-sm">AI ranks tasks by urgency and importance</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-white/10 rounded-lg flex items-center justify-center">
                  <FiSun className="text-orange-400" size={24} />
                </div>
                <h4 className="text-white font-medium mb-1">Energy Matching</h4>
                <p className="text-gray-400 text-sm">Tasks aligned with your peak hours</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-white/10 rounded-lg flex items-center justify-center">
                  <FiTrendingUp className="text-green-400" size={24} />
                </div>
                <h4 className="text-white font-medium mb-1">Productivity Boost</h4>
                <p className="text-gray-400 text-sm">Optimized schedule for maximum output</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
