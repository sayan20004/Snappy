import { useState } from 'react';
import { FiFilter, FiX, FiChevronDown } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdvancedFilters({ filters, onFilterChange, onReset }) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters || {});

  const handleApply = () => {
    onFilterChange(localFilters);
    setIsOpen(false);
  };

  const handleReset = () => {
    const emptyFilters = {
      energyLevel: null,
      effortRange: null,
      location: null,
      mood: null,
      deadlineHorizon: null,
      hasDueDate: null,
      hasSubSteps: null,
      hasLinks: null
    };
    setLocalFilters(emptyFilters);
    onReset();
    setIsOpen(false);
  };

  const updateFilter = (key, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: prev[key] === value ? null : value
    }));
  };

  const activeFilterCount = Object.values(localFilters).filter(Boolean).length;

  return (
    <div className="relative">
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`btn flex items-center gap-2 relative ${
          activeFilterCount > 0 ? 'btn-primary' : 'border border-gray-300'
        }`}
      >
        <FiFilter size={16} />
        Filters
        {activeFilterCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Filter Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Filter Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <FiFilter size={16} />
                  Advanced Filters
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* Filter Content */}
              <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
                {/* Energy Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Energy Level
                  </label>
                  <div className="flex gap-2">
                    {[
                      { value: 'low', label: 'Low 🔋', color: 'blue' },
                      { value: 'medium', label: 'Medium ⚡', color: 'yellow' },
                      { value: 'high', label: 'High 🚀', color: 'red' }
                    ].map(({ value, label, color }) => (
                      <button
                        key={value}
                        onClick={() => updateFilter('energyLevel', value)}
                        className={`flex-1 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                          localFilters.energyLevel === value
                            ? `border-${color}-500 bg-${color}-50 text-${color}-700`
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Effort Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Effort
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'quick', label: '< 15 min', range: [0, 15] },
                      { value: 'short', label: '15-30 min', range: [15, 30] },
                      { value: 'medium', label: '30-60 min', range: [30, 60] },
                      { value: 'long', label: '1-2 hrs', range: [60, 120] },
                      { value: 'extended', label: '2+ hrs', range: [120, 999] }
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => updateFilter('effortRange', value)}
                        className={`px-3 py-2 rounded-lg border-2 text-xs font-medium transition-all ${
                          localFilters.effortRange === value
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location Context
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'anywhere', label: '🌍 Anywhere' },
                      { value: 'home', label: '🏠 Home' },
                      { value: 'office', label: '🏢 Office' },
                      { value: 'commute', label: '🚇 Commute' }
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => updateFilter('location', value)}
                        className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                          localFilters.location === value
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mood/Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'creative', label: '🎨 Creative' },
                      { value: 'analytical', label: '🧠 Analytical' },
                      { value: 'administrative', label: '📋 Administrative' },
                      { value: 'social', label: '💬 Social' }
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => updateFilter('mood', value)}
                        className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                          localFilters.mood === value
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Deadline Horizon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deadline Horizon
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'today', label: '📌 Today' },
                      { value: 'week', label: '📅 This Week' },
                      { value: 'month', label: '🗓️ This Month' },
                      { value: 'overdue', label: '🚨 Overdue' }
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => updateFilter('deadlineHorizon', value)}
                        className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                          localFilters.deadlineHorizon === value
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Toggles */}
                <div className="pt-2 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quick Filters
                  </label>
                  <div className="space-y-2">
                    {[
                      { key: 'hasDueDate', label: 'Has due date' },
                      { key: 'hasSubSteps', label: 'Has sub-steps' },
                      { key: 'hasLinks', label: 'Has links' }
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localFilters[key] || false}
                          onChange={(e) => setLocalFilters(prev => ({ ...prev, [key]: e.target.checked || null }))}
                          className="checkbox"
                        />
                        <span className="text-sm text-gray-700">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                <button
                  onClick={handleReset}
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                >
                  Reset All
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApply}
                    className="btn btn-primary"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
