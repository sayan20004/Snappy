import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiX, FiPlay, FiPause, FiSkipForward, FiVolume2, FiVolumeX, FiCoffee } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useTodos, useUpdateTodo } from '../hooks/useTodos';

export default function FocusMode() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const taskId = searchParams.get('taskId');
  
  const [duration, setDuration] = useState(25); // minutes
  const [timer, setTimer] = useState(25 * 60); // seconds
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState('work'); // 'work' | 'break'
  const [completedSessions, setCompletedSessions] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showInterruptBuffer, setShowInterruptBuffer] = useState(false);
  const [interruptNote, setInterruptNote] = useState('');

  const { data: todosData } = useTodos();
  const updateTodoMutation = useUpdateTodo();
  
  const currentTask = todosData?.todos?.find(t => t._id === taskId);

  // Timer logic
  useEffect(() => {
    let interval;
    if (isRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
    } else if (timer === 0 && isRunning) {
      handleSessionComplete();
    }
    return () => clearInterval(interval);
  }, [isRunning, timer]);

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') navigate('/');
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [navigate]);

  const handleSessionComplete = () => {
    setIsRunning(false);
    
    // Play notification sound
    if (soundEnabled) {
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => {});
    }

    // Browser notification
    if (Notification.permission === 'granted') {
      new Notification(
        sessionType === 'work' ? 'Focus session complete! 🎉' : 'Break time over! 💪',
        { body: sessionType === 'work' ? 'Time for a break!' : 'Ready to focus again?' }
      );
    }

    if (sessionType === 'work') {
      // Log focus session to task
      if (currentTask) {
        const focusSession = {
          startedAt: new Date(Date.now() - duration * 60 * 1000),
          endedAt: new Date(),
          duration: duration * 60,
          completed: true
        };

        updateTodoMutation.mutate({
          id: currentTask._id,
          data: {
            focusSessions: [...(currentTask.focusSessions || []), focusSession],
            totalFocusTime: (currentTask.totalFocusTime || 0) + duration
          }
        });
      }

      setCompletedSessions(prev => prev + 1);
      
      // Auto-switch to break after 4 sessions
      if ((completedSessions + 1) % 4 === 0) {
        switchToBreak(15); // Long break
      } else {
        switchToBreak(5); // Short break
      }
    } else {
      // Switch back to work
      setSessionType('work');
      setTimer(duration * 60);
    }
  };

  const switchToBreak = (minutes) => {
    setSessionType('break');
    setDuration(minutes);
    setTimer(minutes * 60);
  };

  const toggleTimer = () => {
    // Request notification permission
    if (!isRunning && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setTimer(duration * 60);
    setIsRunning(false);
  };

  const skipSession = () => {
    handleSessionComplete();
  };

  const handleInterrupt = () => {
    setShowInterruptBuffer(true);
    setIsRunning(false);
  };

  const saveInterrupt = () => {
    if (interruptNote.trim() && currentTask) {
      const comment = {
        text: `⚠️ Interrupted: ${interruptNote}`,
        createdAt: new Date(),
        author: 'You'
      };
      updateTodoMutation.mutate({
        id: currentTask._id,
        data: {
          comments: [...(currentTask.comments || []), comment]
        }
      });
    }
    setInterruptNote('');
    setShowInterruptBuffer(false);
  };

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;
  const progress = ((duration * 60 - timer) / (duration * 60)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full bg-primary-500 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full bg-purple-500 blur-3xl"
        />
      </div>

      {/* Header Controls */}
      <div className="absolute top-4 left-0 right-0 px-8 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          {/* Session Counter */}
          <div className="flex items-center gap-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i < completedSessions % 4 ? 'bg-primary-500' : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-400">
            {completedSessions} sessions completed
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            title={soundEnabled ? 'Mute' : 'Unmute'}
          >
            {soundEnabled ? <FiVolume2 size={20} /> : <FiVolumeX size={20} />}
          </button>

          {/* Close */}
          <Link
            to="/"
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <FiX size={24} />
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="text-center space-y-8 animate-fade-in relative z-10 max-w-2xl">
        {/* Task Title */}
        {currentTask ? (
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">{currentTask.title}</h1>
            {currentTask.note && (
              <p className="text-gray-400 text-lg">{currentTask.note}</p>
            )}
          </div>
        ) : (
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              {sessionType === 'work' ? 'Focus Session' : 'Break Time'}
            </h1>
            <p className="text-gray-400 text-lg">
              {sessionType === 'work' 
                ? 'Stay focused, stay productive' 
                : 'Relax and recharge ☕'}
            </p>
          </div>
        )}

        {/* Progress Circle */}
        <div className="relative w-80 h-80 mx-auto">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="160"
              cy="160"
              r="140"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              className="text-gray-700"
            />
            {/* Progress circle */}
            <motion.circle
              cx="160"
              cy="160"
              r="140"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              className={sessionType === 'work' ? 'text-primary-500' : 'text-green-500'}
              initial={{ strokeDasharray: '0 880' }}
              animate={{ 
                strokeDasharray: `${(progress * 880) / 100} 880`,
              }}
              transition={{ duration: 0.5 }}
            />
          </svg>

          {/* Timer Display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-7xl md:text-8xl font-mono font-bold tracking-wider">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </div>
              <p className="text-gray-400 text-sm mt-2">
                {sessionType === 'work' ? 'Work' : 'Break'} · {duration} min
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4 justify-center items-center flex-wrap">
          <button
            onClick={toggleTimer}
            className="btn bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 text-lg shadow-lg shadow-primary-500/50"
          >
            {isRunning ? (
              <>
                <FiPause className="inline mr-2" />
                Pause
              </>
            ) : (
              <>
                <FiPlay className="inline mr-2" />
                Start
              </>
            )}
          </button>
          
          <button
            onClick={resetTimer}
            className="btn bg-gray-700 hover:bg-gray-600 text-white px-6 py-4 text-lg"
          >
            Reset
          </button>

          {isRunning && (
            <>
              <button
                onClick={handleInterrupt}
                className="btn bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-4 text-lg"
              >
                Interrupt
              </button>
              
              <button
                onClick={skipSession}
                className="btn bg-gray-700 hover:bg-gray-600 text-white px-6 py-4 text-lg"
              >
                <FiSkipForward className="inline mr-2" />
                Skip
              </button>
            </>
          )}
        </div>

        {/* Duration Presets */}
        {!isRunning && (
          <div className="flex gap-2 justify-center">
            {[15, 25, 45, 60].map((mins) => (
              <button
                key={mins}
                onClick={() => {
                  setDuration(mins);
                  setTimer(mins * 60);
                  setSessionType('work');
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  duration === mins
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>
        )}

        <div className="text-sm text-gray-500">
          Press <kbd className="px-2 py-1 bg-gray-800 rounded">Esc</kbd> to exit
        </div>
      </div>

      {/* Interrupt Buffer Modal */}
      {showInterruptBuffer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 rounded-lg p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold mb-4">Log Interruption</h3>
            <p className="text-gray-400 text-sm mb-4">
              What pulled you away from focus?
            </p>
            <textarea
              value={interruptNote}
              onChange={(e) => setInterruptNote(e.target.value)}
              placeholder="E.g., 'Got a call from boss about urgent meeting'"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              rows={3}
              autoFocus
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowInterruptBuffer(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveInterrupt}
                className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
              >
                Save & Resume
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
