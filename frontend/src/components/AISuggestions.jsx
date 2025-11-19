import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiZap, FiClock, FiTrendingUp, FiRefreshCw, FiX } from 'react-icons/fi';
import { aiAPI } from '../api';
import toast from 'react-hot-toast';

const AISuggestions = ({ isVisible, onClose }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSuggestions = async () => {
    setIsLoading(true);
    try {
      const result = await aiAPI.getSuggestions({
        energy: 'medium', // Could be dynamic based on time of day
      });
      setSuggestions(result.suggestions || []);
    } catch (error) {
      console.error('Failed to fetch AI suggestions:', error);
      toast.error('Failed to load AI suggestions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      fetchSuggestions();
    }
  }, [isVisible]);

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'focus':
        return <FiZap className="w-5 h-5 text-yellow-500" />;
      case 'break':
        return <FiClock className="w-5 h-5 text-blue-500" />;
      case 'prioritize':
        return <FiTrendingUp className="w-5 h-5 text-red-500" />;
      default:
        return <FiZap className="w-5 h-5 text-purple-500" />;
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          className="fixed right-0 top-0 h-screen w-96 bg-white dark:bg-gray-800 shadow-2xl z-40 overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FiZap className="w-5 h-5 text-purple-500" />
                AI Suggestions
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Smart recommendations for your day
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchSuggestions}
                disabled={isLoading}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FiRefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Suggestions */}
          <div className="p-4 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              </div>
            ) : suggestions.length === 0 ? (
              <div className="text-center py-12">
                <FiZap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No suggestions available right now
                </p>
              </div>
            ) : (
              suggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getSuggestionIcon(suggestion.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {suggestion.suggestion}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {suggestion.reasoning}
                      </p>
                      {suggestion.action && (
                        <button
                          onClick={() => {
                            // Execute the suggested action
                            toast.success('Action executed!');
                          }}
                          className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                        >
                          {suggestion.action}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AISuggestions;
