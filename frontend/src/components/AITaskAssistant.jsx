import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiSend, FiX, FiLoader } from 'react-icons/fi';
import { aiAPI } from '../api';
import toast from 'react-hot-toast';

const AITaskAssistant = ({ task, isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi! I'm here to help you with "${task.title}". I can:
• Break it into smaller steps
• Draft content for you
• Analyze its priority
• Explain how to approach it
• Generate related resources

What would you like help with?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);

    setIsLoading(true);
    try {
      // Detect intent and route to appropriate AI function
      const lowerInput = userMessage.toLowerCase();
      let response;

      if (lowerInput.includes('break') || lowerInput.includes('subtask') || lowerInput.includes('step')) {
        const result = await aiAPI.breakdownTask(task._id);
        response = `I've broken down your task into these steps:\n\n${result.subtasks
          .map((sub, i) => `${i + 1}. ${sub.text} (${sub.estimatedMinutes} min)`)
          .join('\n')}`;
      } else if (lowerInput.includes('draft') || lowerInput.includes('write') || lowerInput.includes('content')) {
        const contentType = lowerInput.includes('email') ? 'email' : 'general';
        const result = await aiAPI.draftTaskContent(task._id, contentType);
        response = `Here's a draft for you:\n\n${result.draft}`;
      } else if (lowerInput.includes('priority') || lowerInput.includes('urgent') || lowerInput.includes('important')) {
        const result = await aiAPI.analyzeTaskPriority(task._id);
        response = `Priority Analysis:\n\nSuggested Priority: ${
          ['Urgent', 'High', 'Normal', 'Low'][result.analysis.suggestedPriority]
        }\n\nReasoning: ${result.analysis.reasoning}\n\nEmotional Difficulty: ${
          result.analysis.emotionalDifficulty
        }\nOptimal Time: ${result.analysis.optimalTime}\nEstimated Energy Required: ${
          result.analysis.estimatedEnergy
        }`;
      } else {
        // General chat
        const result = await aiAPI.chatWithAI(userMessage, {
          task: {
            title: task.title,
            note: task.note,
            priority: task.priority,
            dueAt: task.dueAt,
          },
        });
        response = result.response;
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('AI assistant error:', error);
      toast.error('Failed to get AI response');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { label: 'Break down', command: 'Break this into smaller steps' },
    { label: 'Draft content', command: 'Draft content for this task' },
    { label: 'Analyze priority', command: 'Analyze the priority of this task' },
    { label: 'How to start?', command: 'How should I approach this task?' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <FiMessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Task Assistant
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                    {task.title}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-2">
                    <FiLoader className="w-5 h-5 animate-spin text-purple-500" />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            {messages.length === 1 && (
              <div className="px-4 pb-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Quick actions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setInput(action.command);
                        setTimeout(() => handleSend(), 100);
                      }}
                      disabled={isLoading}
                      className="px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me anything about this task..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <FiSend className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AITaskAssistant;
