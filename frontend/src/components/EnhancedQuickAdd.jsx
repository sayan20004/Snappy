import { useState, useEffect, useRef } from 'react';
import { useCreateTodo } from '../hooks/useTodos';
import { FiPlus, FiLink, FiList, FiClock, FiZap, FiMapPin, FiBattery, FiSettings } from 'react-icons/fi';

export default function EnhancedQuickAdd({ listId }) {
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Advanced fields
  const [links, setLinks] = useState([]);
  const [linkInput, setLinkInput] = useState('');
  const [subSteps, setSubSteps] = useState([]);
  const [subStepInput, setSubStepInput] = useState('');
  const [energyLevel, setEnergyLevel] = useState('medium');
  const [effortMinutes, setEffortMinutes] = useState(15);
  const [location, setLocation] = useState('anywhere');
  const [mood, setMood] = useState('administrative');
  const [bestTime, setBestTime] = useState('');
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [customEffort, setCustomEffort] = useState('');
  
  const inputRef = useRef(null);
  const createTodoMutation = useCreateTodo();

  // Global shortcut: Ctrl+Shift+T
  useEffect(() => {
    const handleGlobalShortcut = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleGlobalShortcut);
    return () => window.removeEventListener('keydown', handleGlobalShortcut);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const todoData = {
      title: title.trim(),
      note: note.trim(),
      listId: listId || null,
      links: links.map(url => ({ url })),
      subSteps: subSteps.map((title, idx) => ({ title, order: idx, completed: false })),
      energyLevel,
      effortMinutes: parseInt(effortMinutes),
      location,
      mood,
      bestTimeToComplete: bestTime,
    };

    createTodoMutation.mutate(todoData, {
      onSuccess: () => {
        setTitle('');
        setNote('');
        setLinks([]);
        setSubSteps([]);
        setLinkInput('');
        setSubStepInput('');
        setShowAdvanced(false);
        setEnergyLevel('medium');
        setEffortMinutes(15);
        setLocation('anywhere');
        setMood('administrative');
        setBestTime('');
        inputRef.current?.focus();
      },
    });
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
    if (e.key === 'Escape') {
      setShowAdvanced(false);
    }
  };

  const addLink = () => {
    if (linkInput.trim() && !links.includes(linkInput.trim())) {
      setLinks([...links, linkInput.trim()]);
      setLinkInput('');
    }
  };

  const addSubStep = () => {
    if (subStepInput.trim()) {
      setSubSteps([...subSteps, subStepInput.trim()]);
      setSubStepInput('');
    }
  };

  return (
    <div className="card dark:bg-gray-800 p-4 space-y-3">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Main Input */}
        <div className="flex gap-2">
          <input
            ref={inputRef}
            id="quick-add-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What needs to be done? (Ctrl+Shift+T)"
            className="input flex-1 text-base bg-gray-800 dark:bg-gray-900 text-gray-100 border-gray-600 dark:border-gray-700 placeholder:text-gray-500"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!title.trim() || createTodoMutation.isPending}
            className="btn btn-primary px-6 flex items-center gap-2"
          >
            <FiPlus size={18} />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
              showAdvanced
                ? 'bg-primary-50 border-primary-300 text-primary-700'
                : 'border-gray-300 text-gray-600 hover:border-primary-400'
            }`}
          >
            <FiZap size={12} className="inline mr-1" />
            Context
          </button>

          {/* Energy Level Quick Select */}
          <div className="flex gap-1 border border-gray-300 dark:border-gray-600 rounded-lg p-0.5">
            {['low', 'medium', 'high'].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setEnergyLevel(level)}
                className={`text-xs px-2 py-1 rounded transition-colors capitalize ${
                  energyLevel === level
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <FiBattery size={12} className={energyLevel === level ? 'inline' : 'inline opacity-50'} />
                <span className="ml-1 capitalize">{level}</span>
              </button>
            ))}
          </div>

          {/* Effort Quick Select */}
          <div className="flex items-center gap-1">
            <select
              value={effortMinutes}
              onChange={(e) => setEffortMinutes(e.target.value)}
              className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800"
            >
              <option value={2}>2 mins</option>
              <option value={5}>5 mins</option>
              <option value={15}>15 mins</option>
              <option value={30}>30 mins</option>
              <option value={60}>1 hour</option>
              <option value={120}>2 hours</option>
              <option value={180}>3 hours</option>
            </select>
            <button
              type="button"
              onClick={() => setShowCustomTime(!showCustomTime)}
              className="text-xs p-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Customize time"
            >
              <FiSettings size={14} />
            </button>
          </div>
        </div>

        {/* Custom Time Period Input */}
        {showCustomTime && (
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 animate-slide-up">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Custom Time Period (minutes)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={customEffort}
                onChange={(e) => setCustomEffort(e.target.value)}
                placeholder="e.g., 45"
                min="1"
                max="480"
                className="input flex-1 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
              <button
                type="button"
                onClick={() => {
                  if (customEffort && parseInt(customEffort) > 0) {
                    setEffortMinutes(parseInt(customEffort));
                    setShowCustomTime(false);
                    setCustomEffort('');
                  }
                }}
                className="btn btn-primary text-xs px-4"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCustomTime(false);
                  setCustomEffort('');
                }}
                className="btn text-xs px-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Enter any value between 1 and 480 minutes (8 hours)
            </p>
          </div>
        )}

        {/* Advanced Context Panel */}
        {showAdvanced && (
          <div className="mt-4 space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 animate-slide-up">
            {/* Note */}
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">Notes</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add details, context, or thoughts..."
                className="input w-full resize-none text-sm"
                rows={3}
              />
            </div>

            {/* Links */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                <FiLink size={12} />
                Links
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLink())}
                  placeholder="https://..."
                  className="input flex-1 text-sm"
                />
                <button
                  type="button"
                  onClick={addLink}
                  className="btn btn-secondary text-xs"
                >
                  Add
                </button>
              </div>
              {links.length > 0 && (
                <div className="space-y-1">
                  {links.map((link, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs bg-white px-2 py-1 rounded border">
                      <FiLink size={10} className="text-blue-500" />
                      <span className="flex-1 truncate text-blue-600">{link}</span>
                      <button
                        type="button"
                        onClick={() => setLinks(links.filter((_, i) => i !== idx))}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sub-steps */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                <FiList size={12} />
                Sub-steps
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={subStepInput}
                  onChange={(e) => setSubStepInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubStep())}
                  placeholder="Add a sub-step..."
                  className="input flex-1 text-sm"
                />
                <button
                  type="button"
                  onClick={addSubStep}
                  className="btn btn-secondary text-xs"
                >
                  Add
                </button>
              </div>
              {subSteps.length > 0 && (
                <div className="space-y-1">
                  {subSteps.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs bg-white px-2 py-1 rounded border">
                      <span className="text-gray-400">{idx + 1}.</span>
                      <span className="flex-1">{step}</span>
                      <button
                        type="button"
                        onClick={() => setSubSteps(subSteps.filter((_, i) => i !== idx))}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Smart Filters */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <FiMapPin size={10} />
                  Location
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="input text-sm"
                >
                  <option value="anywhere">Anywhere</option>
                  <option value="home">Home</option>
                  <option value="office">Office</option>
                  <option value="commute">Commute</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <FiClock size={10} />
                  Best Time
                </label>
                <select
                  value={bestTime}
                  onChange={(e) => setBestTime(e.target.value)}
                  className="input text-sm"
                >
                  <option value="">Any time</option>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                  <option value="night">Night</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 mb-1">Mood/Type</label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="input text-sm"
                >
                  <option value="creative">Creative</option>
                  <option value="analytical">Analytical</option>
                  <option value="administrative">Administrative</option>
                  <option value="social">Social</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Keyboard Shortcuts Hint */}
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300">Ctrl+Shift+T</kbd> to focus
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300">Ctrl+Enter</kbd> to add
        </span>
      </form>
    </div>
  );
}
