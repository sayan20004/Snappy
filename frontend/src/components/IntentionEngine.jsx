import { useState, useEffect } from 'react';
import { FiSun, FiTrendingUp, FiZap, FiClock, FiRefreshCw, FiCheckCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useTodos, useUpdateTodo } from '../hooks/useTodos';
import { format, startOfDay, addHours } from 'date-fns';
import toast from 'react-hot-toast';

export default function IntentionEngine() {
  const { data: todosData } = useTodos({ status: 'todo' });
  const updateTodoMutation = useUpdateTodo();
  const [isGenerating, setIsGenerating] = useState(false);
  const [dailyPlan, setDailyPlan] = useState(null);
  const [userContext, setUserContext] = useState({
    currentTime: new Date(),
    energyLevel: 'high',
    availableTime: 480, // minutes
    priorities: []
  });

  useEffect(() => {
    // Auto-generate plan on mount if no plan exists
    if (!dailyPlan && todosData?.todos?.length > 0) {
      generatePlan();
    }
  }, [todosData]);

  const generatePlan = async () => {
    setIsGenerating(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    const todos = todosData?.todos || [];
    const now = new Date();
    const currentHour = now.getHours();

    // AI-powered task prioritization logic
    const scoredTasks = todos.map(todo => {
      let score = 0;
      
      // Priority weight
      score += (todo.priority || 2) * 10;
      
      // Urgency (due date)
      if (todo.dueAt) {
        const daysUntilDue = (new Date(todo.dueAt) - now) / (1000 * 60 * 60 * 24);
        if (daysUntilDue < 1) score += 50;
        else if (daysUntilDue < 3) score += 30;
        else if (daysUntilDue < 7) score += 15;
      }
      
      // Energy level matching
      const timeOfDay = currentHour < 12 ? 'morning' : currentHour < 17 ? 'afternoon' : 'evening';
      if (todo.energyLevel === 'high' && timeOfDay === 'morning') score += 20;
      if (todo.energyLevel === 'low' && timeOfDay === 'evening') score += 20;
      
      // Quick wins (low effort)
      if (todo.effortMinutes && todo.effortMinutes <= 15) score += 15;
      
      // Long-standing tasks (created more than 3 days ago)
      const daysOld = (now - new Date(todo.createdAt)) / (1000 * 60 * 60 * 24);
      if (daysOld > 3) score += Math.min(daysOld * 2, 30);
      
      return { ...todo, aiScore: score };
    });

    // Sort by AI score
    const prioritized = scoredTasks.sort((a, b) => b.aiScore - a.aiScore);

    // Create time blocks
    const blocks = [];
    let currentTime = startOfDay(now);
    currentTime = addHours(currentTime, Math.max(9, currentHour)); // Start from current hour or 9 AM
    let remainingTime = userContext.availableTime;

    for (const task of prioritized.slice(0, 8)) {
      if (remainingTime <= 0) break;
      
      const duration = Math.min(task.effortMinutes || 30, remainingTime);
      blocks.push({
        task,
        startTime: new Date(currentTime),
        duration,
        reason: getRecommendationReason(task, currentHour)
      });
      
      currentTime = addHours(currentTime, duration / 60);
      remainingTime -= duration;
    }

    setDailyPlan({
      generatedAt: now,
      blocks,
      insights: generateInsights(prioritized, blocks),
      focusScore: Math.min(100, Math.round((blocks.length / todos.length) * 100))
    });

    setIsGenerating(false);
    toast.success('Your day is planned! 🎯');
  };

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
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            🧠 Intention Engine
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            AI-powered daily planning and task prioritization
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={generatePlan}
            disabled={isGenerating}
            className="btn btn-primary flex items-center gap-2"
          >
            <FiRefreshCw className={isGenerating ? 'animate-spin' : ''} />
            {isGenerating ? 'Analyzing...' : 'Generate Plan'}
          </button>
          
          {dailyPlan && (
            <button
              onClick={applyPlan}
              className="btn bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            >
              <FiCheckCircle />
              Apply to Tasks
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card p-8 text-center"
        >
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Analyzing your tasks and energy patterns...</p>
        </motion.div>
      )}

      {/* Daily Plan */}
      {dailyPlan && !isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Insights */}
          <div className="grid grid-cols-2 gap-4">
            {dailyPlan.insights.map((insight, idx) => {
              const Icon = insight.icon;
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
