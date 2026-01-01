import { useState } from 'react';
import { FiPlus, FiClock, FiCopy, FiEdit, FiTrash } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useCreateTodo } from '../hooks/useTodos';
import toast from 'react-hot-toast';

const builtInTemplates = [
  {
    id: 'weekly-report',
    name: '📊 Weekly Report',
    description: 'Standard weekly team update',
    template: {
      title: 'Weekly Report - Week of [DATE]',
      subSteps: [
        { title: 'Accomplishments this week', completed: false },
        { title: 'Challenges faced', completed: false },
        { title: 'Next week priorities', completed: false },
        { title: 'Team updates', completed: false }
      ],
      tags: ['reporting', 'weekly'],
      effortMinutes: 60,
      mood: 'administrative'
    }
  },
  {
    id: 'meeting-prep',
    name: '🤝 Meeting Preparation',
    description: 'Get ready for important meetings',
    template: {
      title: 'Prepare for [MEETING NAME]',
      subSteps: [
        { title: 'Review agenda', completed: false },
        { title: 'Prepare talking points', completed: false },
        { title: 'Gather materials/data', completed: false },
        { title: 'Send pre-read docs', completed: false }
      ],
      tags: ['meeting', 'preparation'],
      effortMinutes: 30,
      mood: 'analytical'
    }
  },
  {
    id: 'bug-fix',
    name: '🐛 Bug Fix Workflow',
    description: 'Systematic bug resolution',
    template: {
      title: 'Fix: [BUG DESCRIPTION]',
      subSteps: [
        { title: 'Reproduce bug', completed: false },
        { title: 'Identify root cause', completed: false },
        { title: 'Write fix + tests', completed: false },
        { title: 'Code review', completed: false },
        { title: 'Deploy to staging', completed: false }
      ],
      tags: ['bug', 'development'],
      effortMinutes: 120,
      energyLevel: 'high',
      mood: 'analytical'
    }
  },
  {
    id: 'blog-post',
    name: '✍️ Write Blog Post',
    description: 'Content creation workflow',
    template: {
      title: 'Blog Post: [TOPIC]',
      subSteps: [
        { title: 'Research topic', completed: false },
        { title: 'Create outline', completed: false },
        { title: 'Write first draft', completed: false },
        { title: 'Add images/media', completed: false },
        { title: 'Edit and proofread', completed: false },
        { title: 'Publish and promote', completed: false }
      ],
      tags: ['content', 'writing'],
      effortMinutes: 180,
      energyLevel: 'high',
      mood: 'creative'
    }
  },
  {
    id: 'onboarding',
    name: '👋 New Team Member Onboarding',
    description: 'Welcome new hires',
    template: {
      title: 'Onboard [NAME]',
      subSteps: [
        { title: 'Send welcome email', completed: false },
        { title: 'Setup accounts & access', completed: false },
        { title: 'Schedule 1:1 intro calls', completed: false },
        { title: 'Share documentation', completed: false },
        { title: 'Assign first task', completed: false }
      ],
      tags: ['hr', 'onboarding'],
      effortMinutes: 90,
      mood: 'social'
    }
  },
  {
    id: 'project-kickoff',
    name: '🚀 Project Kickoff',
    description: 'Start new projects right',
    template: {
      title: 'Kickoff: [PROJECT NAME]',
      subSteps: [
        { title: 'Define project scope', completed: false },
        { title: 'Identify stakeholders', completed: false },
        { title: 'Create timeline', completed: false },
        { title: 'Setup project board', completed: false },
        { title: 'Schedule kickoff meeting', completed: false }
      ],
      tags: ['project', 'planning'],
      effortMinutes: 120,
      energyLevel: 'high',
      mood: 'analytical'
    }
  }
];

export default function TaskTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customValues, setCustomValues] = useState({});
  const createTodoMutation = useCreateTodo();

  const handleUseTemplate = async (template) => {
    const task = { ...template.template };
    
    // Replace placeholders with custom values
    if (customValues[template.id]) {
      Object.entries(customValues[template.id]).forEach(([key, value]) => {
        task.title = task.title.replace(`[${key}]`, value);
      });
    }

    // Replace [DATE] with current date
    task.title = task.title.replace('[DATE]', new Date().toLocaleDateString());

    try {
      await createTodoMutation.mutateAsync(task);
      toast.success(`Created task from "${template.name}"!`);
      setSelectedTemplate(null);
      setCustomValues({});
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const detectPlaceholders = (template) => {
    const placeholders = [];
    const regex = /\[([A-Z\s]+)\]/g;
    let match;
    while ((match = regex.exec(template.title)) !== null) {
      if (match[1] !== 'DATE') {
        placeholders.push(match[1]);
      }
    }
    return placeholders;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Task Templates</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Quick-start tasks with pre-defined checklists and settings
        </p>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {builtInTemplates.map((template, idx) => (
          <motion.button
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => setSelectedTemplate(template)}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-600 transition-all text-left group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="text-3xl">{template.name.split(' ')[0]}</div>
              <FiCopy className="text-gray-400 group-hover:text-primary-600 transition-colors" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              {template.name.split(' ').slice(1).join(' ')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{template.description}</p>
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
                {template.template.subSteps.length} steps
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <FiClock className="w-3 h-3" />
                {template.template.effortMinutes}min
              </span>
              {template.template.tags && (
                <>
                  <span>•</span>
                  <span className="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-xs font-medium">
                    {template.template.tags[0]}
                  </span>
                </>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Template Detail Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedTemplate.name}</h3>
                <p className="text-sm text-gray-500">{selectedTemplate.description}</p>
              </div>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Placeholders */}
              {detectPlaceholders(selectedTemplate).length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Customize Template</h4>
                  {detectPlaceholders(selectedTemplate).map(placeholder => (
                    <div key={placeholder}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {placeholder.toLowerCase().replace(/_/g, ' ')}
                      </label>
                      <input
                        type="text"
                        value={customValues[selectedTemplate.id]?.[placeholder] || ''}
                        onChange={(e) => setCustomValues(prev => ({
                          ...prev,
                          [selectedTemplate.id]: {
                            ...prev[selectedTemplate.id],
                            [placeholder]: e.target.value
                          }
                        }))}
                        placeholder={`Enter ${placeholder.toLowerCase()}`}
                        className="input w-full"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Preview */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Task Preview</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-3">
                    {selectedTemplate.template.title}
                  </h5>
                  <div className="space-y-2">
                    {selectedTemplate.template.subSteps.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="w-4 h-4 rounded border-2 border-gray-300" />
                        {step.title}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <FiClock size={14} />
                  {selectedTemplate.template.effortMinutes}min
                </span>
                {selectedTemplate.template.energyLevel && (
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded capitalize">
                    {selectedTemplate.template.energyLevel} energy
                  </span>
                )}
                {selectedTemplate.template.mood && (
                  <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded capitalize">
                    {selectedTemplate.template.mood}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50">
              <button
                onClick={() => setSelectedTemplate(null)}
                className="text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUseTemplate(selectedTemplate)}
                className="btn btn-primary flex items-center gap-2"
              >
                <FiPlus />
                Create Task
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Recurring Tasks Section */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recurring Tasks</h3>
        <div className="card p-6 bg-blue-50 border border-blue-200">
          <div className="flex items-start gap-3">
            <FiClock className="text-blue-600 flex-shrink-0 mt-1" size={20} />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">Coming Soon</h4>
              <p className="text-sm text-blue-800">
                Set up tasks that automatically repeat daily, weekly, or monthly. Perfect for habits, routines, and regular check-ins.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
