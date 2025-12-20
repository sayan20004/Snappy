import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { FiZap, FiTarget, FiClock, FiCloud, FiShield, FiUsers, FiCheck, FiArrowRight, FiStar, FiTrendingUp, FiLayout, FiCpu, FiUserPlus, FiFileText, FiPaperclip, FiSearch, FiCommand, FiPlay, FiPause, FiBarChart2, FiEdit3, FiFilter, FiCalendar, FiRepeat, FiCheckCircle, FiX } from 'react-icons/fi';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const [activeFeature, setActiveFeature] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(1500);
  const [progressValue, setProgressValue] = useState(2);
  const [isRepeating, setIsRepeating] = useState(false);
  const [repeatType, setRepeatType] = useState('weekly');
  const [happinessScore, setHappinessScore] = useState(7);

  // Timer countdown effect
  useEffect(() => {
    let interval;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const demoTasks = [
    { id: 1, title: 'Redesign Dashboard', highlighted: 'Dashboard' },
    { id: 2, title: 'Coffee with Sarah', highlighted: 'Coffee' },
    { id: 3, title: 'Espresso machine manual', highlighted: 'Espresso' },
  ];

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Helmet>
        <title>Snappy — Your Daily Tasks Organized Effortlessly</title>
        <meta name="description" content="Tasktrox helps you manage daily tasks, assign teammates, and track progress — all in a simple, fast, and visual workspace." />
        <link rel="canonical" href="https://tasktrox.com" />
      </Helmet>

      {/* Promo Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 text-center text-sm">
        <p>
          ✨ We're excited to offer you an exclusive promotion to save <span className="font-bold">37% off</span> our Starter or Advanced plans{' '}
          <a href="#pricing" className="underline hover:no-underline">Learn More →</a>
        </p>
      </div>

      {/* Navigation */}
      <nav className="fixed top-10 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex gap-2 items-center">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-white">
              <path d="M12 8L8 12L12 16M20 8L24 12L20 16M16 4L14 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-xl font-bold text-white">
              Snappy
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#home" className="text-gray-300 hover:text-white transition-colors">Home</a>
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
            <a href="#solutions" className="text-gray-300 hover:text-white transition-colors">Solutions</a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
            <a href="#contact" className="text-gray-300 hover:text-white transition-colors">Contact</a>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-gray-300 hover:text-white transition-colors font-medium"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
            >
              Try for Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-6 bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/50 backdrop-blur-sm text-white rounded-full text-sm mb-8 border border-gray-700">
                <span className="px-2.5 py-0.5 bg-gray-900 rounded-full text-xs font-semibold">New</span>
                <span className="text-gray-300">Built for Smart Teams</span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-white max-w-4xl mx-auto">
                Your Daily Tasks<br />
                Organized <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Effortlessly</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                Snappy helps you manage daily tasks, assign teammates, and track progress — all in a simple, fast, and visual workspace.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  to="/register"
                  className="px-8 py-3.5 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all shadow-lg border border-gray-700"
                >
                  Get Started
                </Link>
                <Link
                  to="/register"
                  className="px-8 py-3.5 bg-transparent text-gray-300 rounded-lg font-semibold hover:bg-gray-800/50 transition-all border border-gray-700"
                >
                  View Demo
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Hero Visual Mockup - Flow Diagram */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative max-w-5xl mx-auto mt-12"
          >
            <div className="relative flex items-center justify-center gap-8 flex-wrap lg:flex-nowrap">
              {/* Left: Add Member Card */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-gray-200"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Add New Member</h3>
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
                
                <div className="relative mb-6">
                  <input
                    type="text"
                    placeholder="Search"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                  <svg className="absolute left-3 top-3 text-gray-400" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-3 font-medium">Team Members</p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-400"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Awais Raza</p>
                          <p className="text-xs text-gray-500">Designer</p>
                        </div>
                      </div>
                      <button className="px-4 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-800 transition-colors">
                        Invite
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-400"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Harnail Hassan</p>
                          <p className="text-xs text-gray-500">Senior Designer</p>
                        </div>
                      </div>
                      <button className="px-4 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-800 transition-colors">
                        Invite
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Center: Flow Connections */}
              <div className="hidden lg:flex flex-col items-center gap-6 relative">
                {/* Connection lines */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-px bg-gray-300"></div>
                
                {/* Center Logo/Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  className="w-14 h-14 bg-gray-900 rounded-full flex items-center justify-center shadow-xl relative z-10"
                >
                  <svg width="24" height="24" viewBox="0 0 32 32" fill="none" className="text-white">
                    <path d="M12 8L8 12L12 16M20 8L24 12L20 16M16 4L14 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.div>

                {/* Action Button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg text-sm font-semibold hover:from-purple-700 hover:to-purple-600 transition-all shadow-lg relative z-10"
                >
                  Add Member
                </motion.button>

                {/* Bottom badge */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                  className="px-4 py-1.5 bg-gradient-to-r from-pink-500 to-pink-400 text-white rounded-full text-xs font-semibold shadow-lg"
                >
                  Harnail Hassan
                </motion.div>
              </div>

              {/* Right: Task Card */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="relative w-full max-w-md"
              >
                {/* New Task Button */}
                <div className="flex justify-end mb-4">
                  <button className="px-5 py-2 bg-gradient-to-r from-yellow-500 to-yellow-400 text-white rounded-lg text-sm font-semibold hover:from-yellow-600 hover:to-yellow-500 transition-all shadow-lg flex items-center gap-2">
                    <span className="text-lg">+</span> New Task
                  </button>
                </div>

                {/* Task Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <rect x="2" y="3" width="10" height="9" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                        <path d="M4.5 1.5V4.5M9.5 1.5V4.5M2 6H12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                      July 6, 2025
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2">Redesign Dashboard</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Refine header with minimal layout, icon buttons, and improved spacing.
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Awais Raza</span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">UI/UX</span>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Design</span>
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">High</span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Wireframe</span>
                    <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-medium">Prototype</span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <FiPaperclip />
                      <span>5 Files</span>
                    </div>
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 border-2 border-white"></div>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 border-2 border-white"></div>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-2 border-white"></div>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 border-2 border-white"></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-20 text-center"
          >
            <p className="text-gray-400 text-sm mb-8">Trusted by 10k+ companies and businesses to scale sales & generate revenue</p>
            <div className="flex flex-wrap items-center justify-center gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
              <div className="text-gray-400 font-bold text-2xl">GitHub</div>
              <div className="text-gray-400 font-bold text-2xl">Airbnb</div>
              <div className="text-gray-400 font-bold text-2xl">Stripe</div>
              <div className="text-gray-400 font-bold text-2xl">Notion</div>
              <div className="text-gray-400 font-bold text-2xl">Figma</div>
            </div>
          </motion.div>
        </div>
        
        {/* Gradient transition to next section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-gray-900 pointer-events-none"></div>
      </section>

      {/* Interactive Features Showcase */}
      <section className="py-24 px-6 bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/30 relative overflow-hidden">
        {/* Smooth gradient overlay from top */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-gray-900 to-transparent pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Experience the <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Power</span>
            </h2>
            <p className="text-xl text-gray-300">
              Interactive features designed to boost your productivity
            </p>
          </div>

          {/* Feature Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {[
              { id: 'search', icon: FiSearch, label: 'Smart Search' },
              { id: 'command', icon: FiCommand, label: 'Command Palette' },
              { id: 'focus', icon: FiTarget, label: 'Focus Timer' },
              { id: 'progress', icon: FiBarChart2, label: 'Progress Tracking' },
              { id: 'repeat', icon: FiRepeat, label: 'Recurring Tasks' },
              { id: 'mood', icon: FiCheckCircle, label: 'Mood Tracker' },
            ].map((feature) => (
              <button
                key={feature.id}
                onClick={() => setActiveFeature(feature.id)}
                className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  activeFeature === feature.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl shadow-purple-500/50'
                    : 'bg-white/10 backdrop-blur-sm text-gray-300 hover:bg-white/20 border border-white/10'
                }`}
              >
                <feature.icon size={18} />
                <span className="hidden sm:inline">{feature.label}</span>
              </button>
            ))}
          </div>

          {/* Interactive Demo Area */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Interactive Component */}
            <motion.div
              key={activeFeature}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-700"
            >
              <AnimatePresence mode="wait">
                {/* Smart Search Feature */}
                {activeFeature === 'search' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <FiSearch className="text-white text-2xl" />
                      <h3 className="text-xl font-bold text-white">Smart Search</h3>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Try: tag:work, due:today, @john..."
                        className="w-full px-4 py-3 bg-gray-700/50 border-2 border-gray-600 rounded-lg focus:border-purple-500 focus:outline-none text-white placeholder-gray-400"
                      />
                      <FiSearch className="absolute right-4 top-4 text-gray-400" />
                    </div>
                    
                    {searchQuery && (
                      <div className="mt-4 max-h-64 overflow-y-auto">
                        <p className="text-sm text-gray-400 font-medium mb-2">FOUND 3 RESULTS</p>
                        <div className="space-y-2">
                          {demoTasks
                            .filter(task => 
                              task.title.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map((task) => (
                              <div key={task.id} className="p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-all cursor-pointer">
                                <p className="text-sm text-gray-400">Tasks / Projects</p>
                                <p className="text-white">
                                  The{' '}
                                  <span className="bg-green-500/30 text-green-300 px-1 rounded">
                                    {task.highlighted}
                                  </span>{' '}
                                  {task.title.replace(task.highlighted, '').trim()}
                                </p>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                      <p className="text-sm text-purple-300 font-medium mb-2">Search Syntax:</p>
                      <div className="space-y-1 text-xs text-gray-300">
                        <p><code className="bg-gray-700 px-2 py-0.5 rounded">tag:work</code> - Filter by tags</p>
                        <p><code className="bg-gray-700 px-2 py-0.5 rounded">due:today</code> - Due date filter</p>
                        <p><code className="bg-gray-700 px-2 py-0.5 rounded">@user</code> - Find mentions</p>
                        <p><code className="bg-gray-700 px-2 py-0.5 rounded">priority:high</code> - Priority filter</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Command Palette Feature */}
                {activeFeature === 'command' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <FiCommand className="text-white text-2xl" />
                      <h3 className="text-xl font-bold text-white">Command Palette</h3>
                    </div>
                    
                    <div className="bg-gray-700/30 border border-gray-600 text-white rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <FiSearch className="text-gray-400" />
                        <input
                          type="text"
                          placeholder="Type a command..."
                          className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500"
                        />
                        <div className="px-2 py-1 bg-gray-800 rounded text-xs">⌘K</div>
                      </div>
                      
                      <div className="space-y-2">
                        {[
                          { icon: FiEdit3, label: 'New Task', shortcut: '⌘⇧T' },
                          { icon: FiTarget, label: 'Focus Mode', shortcut: '' },
                          { icon: FiBarChart2, label: 'Activity Timeline', shortcut: '' },
                          { icon: FiFilter, label: 'Advanced Filters', shortcut: '⌘⇧F' },
                          { icon: FiLayout, label: 'Toggle Kanban View', shortcut: '⌘⇧K' },
                        ].map((cmd, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 rounded hover:bg-gray-800 transition-all cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <cmd.icon className="text-gray-400" />
                              <span>{cmd.label}</span>
                            </div>
                            {cmd.shortcut && (
                              <span className="text-xs text-gray-500">{cmd.shortcut}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-purple-900 font-medium mb-2">Keyboard Shortcuts:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs text-purple-800">
                        <p>⌘K - Open palette</p>
                        <p>⌘⇧T - Quick add</p>
                        <p>⌘F - Search</p>
                        <p>Esc - Close</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Focus Timer Feature */}
                {activeFeature === 'focus' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <FiTarget className="text-white text-2xl" />
                      <h3 className="text-xl font-bold text-white">Focus Timer</h3>
                    </div>

                    <div className="text-center">
                      <div className="text-6xl font-bold text-white mb-6">
                        {formatTime(timerSeconds)}
                      </div>
                      <div className="flex justify-center gap-3 mb-6">
                        <button
                          onClick={() => setIsTimerRunning(!isTimerRunning)}
                          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2 shadow-lg"
                        >
                          {isTimerRunning ? (
                            <>
                              <FiPause /> Pause
                            </>
                          ) : (
                            <>
                              <FiPlay /> Start
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setTimerSeconds(1500)}
                          className="px-6 py-3 border-2 border-gray-600 text-white rounded-lg hover:bg-gray-700/50 transition-all"
                        >
                          Reset
                        </button>
                      </div>

                      <div className="flex justify-center gap-2 mb-6">
                        {[
                          { label: '25 min', value: 1500 },
                          { label: '45 min', value: 2700 },
                          { label: '60 min', value: 3600 },
                        ].map((preset) => (
                          <button
                            key={preset.value}
                            onClick={() => setTimerSeconds(preset.value)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              timerSeconds === preset.value
                                ? 'bg-gray-700 text-white'
                                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>

                      <div className="p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-400">Current Task</span>
                          <span className="font-medium text-white">Redesign Dashboard</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Completed Sessions</span>
                          <span className="font-medium text-white">3 sessions</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Progress Tracking Feature */}
                {activeFeature === 'progress' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <FiBarChart2 className="text-white text-2xl" />
                      <h3 className="text-xl font-bold text-white">Progress Tracking</h3>
                    </div>

                    <div className="bg-gradient-to-br from-gray-700 to-gray-600 text-white rounded-xl p-6 border border-gray-600">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm opacity-80">COMPLETION RATE</span>
                        <span className="text-2xl font-bold">{progressValue}/4 Completed</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-3 mb-4">
                        <div
                          className="bg-white h-3 rounded-full transition-all duration-500"
                          style={{ width: `${(progressValue / 4) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs opacity-70">
                        <span>Started</span>
                        <span>{Math.round((progressValue / 4) * 100)}%</span>
                        <span>Complete</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {[
                        { label: 'How it all started', done: true },
                        { label: 'Our values and approach', done: true },
                        { label: 'Working together', done: false },
                        { label: 'Company culture', done: false },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            if (idx < 2) setProgressValue(Math.max(0, progressValue - 1));
                            else setProgressValue(Math.min(4, progressValue + 1));
                          }}
                          className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-all cursor-pointer border border-gray-600"
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              item.done
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-600 text-gray-400'
                            }`}
                          >
                            {item.done && <FiCheck size={14} />}
                          </div>
                          <span
                            className={`flex-1 ${
                              item.done ? 'text-white' : 'text-gray-400'
                            }`}
                          >
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Recurring Tasks Feature */}
                {activeFeature === 'repeat' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <FiRepeat className="text-white text-2xl" />
                      <h3 className="text-xl font-bold text-white">Recurring Tasks</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                        <span className="font-medium text-white">Is repeating</span>
                        <button
                          onClick={() => setIsRepeating(!isRepeating)}
                          className={`relative w-14 h-7 rounded-full transition-all ${
                            isRepeating ? 'bg-green-500' : 'bg-gray-600'
                          }`}
                        >
                          <div
                            className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                              isRepeating ? 'transform translate-x-7' : ''
                            }`}
                          />
                        </button>
                      </div>

                      {isRepeating && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-4"
                        >
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Repeat
                            </label>
                            <select
                              value={repeatType}
                              onChange={(e) => setRepeatType(e.target.value)}
                              className="w-full px-4 py-2 bg-gray-700 border-2 border-gray-600 rounded-lg focus:border-purple-500 focus:outline-none text-white"
                            >
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                              <option value="monthly">Monthly</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3">
                              Repeat on
                            </label>
                            <div className="grid grid-cols-7 gap-2">
                              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day, idx) => (
                                <button
                                  key={day}
                                  className={`p-2 text-xs font-medium rounded-lg transition-all ${
                                    idx < 5
                                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                  }`}
                                >
                                  {day}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 p-3 bg-purple-500/20 rounded-lg border border-purple-500/30">
                            <FiCalendar className="text-purple-400" />
                            <span className="text-sm text-purple-300">
                              Task will repeat every {repeatType}
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Mood Tracker Feature */}
                {activeFeature === 'mood' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <FiCheckCircle className="text-white text-2xl" />
                      <h3 className="text-xl font-bold text-white">Mood & Energy Tracking</h3>
                    </div>

                    <div className="text-center">
                      <p className="text-lg font-medium text-white mb-4">
                        How happy are you at work?
                      </p>
                      
                      <div className="flex justify-center items-center gap-2 mb-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <button
                            key={num}
                            onClick={() => setHappinessScore(num)}
                            className={`w-10 h-10 rounded-lg font-bold transition-all ${
                              num === happinessScore
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white scale-110 shadow-lg'
                                : num < happinessScore
                                ? 'bg-gray-700 text-gray-500'
                                : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>

                      <div className="relative w-full h-2 bg-gray-700 rounded-full mb-4">
                        <div
                          className="absolute top-0 left-0 h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full transition-all duration-300"
                          style={{ width: `${(happinessScore / 10) * 100}%` }}
                        />
                      </div>

                      <p className="text-sm text-gray-300">
                        {happinessScore <= 3 && "Let's turn that around! 💪"}
                        {happinessScore > 3 && happinessScore <= 7 && "Good! Room for improvement 👍"}
                        {happinessScore > 7 && "Excellent! Keep it up! 🎉"}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-4">
                      <div className="p-4 bg-green-500/20 rounded-lg text-center border border-green-500/30">
                        <div className="text-2xl font-bold text-green-400">40</div>
                        <div className="text-xs text-green-300">Promoters</div>
                      </div>
                      <div className="p-4 bg-gray-700/50 rounded-lg text-center border border-gray-600">
                        <div className="text-2xl font-bold text-gray-300">23</div>
                        <div className="text-xs text-gray-400">Passives</div>
                      </div>
                      <div className="p-4 bg-red-500/20 rounded-lg text-center border border-red-500/30">
                        <div className="text-2xl font-bold text-red-400">17</div>
                        <div className="text-xs text-red-300">Detractors</div>
                      </div>
                    </div>

                    <div className="p-4 bg-green-500/20 rounded-lg flex items-center justify-between border border-green-500/30">
                      <span className="text-sm font-medium text-green-300">eNPS Score</span>
                      <span className="text-2xl font-bold text-green-400">+28.8</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Right: Feature Description */}
            <motion.div
              key={`desc-${activeFeature}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {activeFeature === 'search' && (
                <div>
                  <h3 className="text-3xl font-bold text-white mb-4">
                    Advanced Search Syntax
                  </h3>
                  <p className="text-lg text-gray-300 mb-6">
                    Find anything instantly with powerful search operators. Filter by tags, mentions, due dates, priority, and more.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <FiCheck className="text-green-400" size={14} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Natural Language</h4>
                        <p className="text-gray-300 text-sm">Search using plain English or advanced syntax</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <FiCheck className="text-green-400" size={14} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Instant Results</h4>
                        <p className="text-gray-300 text-sm">Results appear as you type with highlighted matches</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <FiCheck className="text-green-400" size={14} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Smart Filters</h4>
                        <p className="text-gray-300 text-sm">Combine multiple filters for precise results</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeFeature === 'command' && (
                <div>
                  <h3 className="text-3xl font-bold text-white mb-4">
                    Keyboard-First Workflow
                  </h3>
                  <p className="text-lg text-gray-300 mb-6">
                    Access any feature instantly with the command palette. Navigate your entire workspace without touching your mouse.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <FiCheck className="text-green-400" size={14} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Lightning Fast</h4>
                        <p className="text-gray-300 text-sm">Execute actions in milliseconds with keyboard shortcuts</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <FiCheck className="text-green-400" size={14} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Customizable</h4>
                        <p className="text-gray-300 text-sm">Create your own shortcuts and commands</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <FiCheck className="text-green-400" size={14} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Learn As You Go</h4>
                        <p className="text-gray-300 text-sm">Shortcuts displayed inline for easy learning</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeFeature === 'focus' && (
                <div>
                  <h3 className="text-3xl font-bold text-white mb-4">
                    Pomodoro Focus Timer
                  </h3>
                  <p className="text-lg text-gray-300 mb-6">
                    Stay focused with customizable work sessions. Track your focus time and build productive habits.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <FiCheck className="text-green-400" size={14} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Distraction-Free</h4>
                        <p className="text-gray-300 text-sm">Full-screen mode with ambient sounds</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <FiCheck className="text-green-400" size={14} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Auto-Logging</h4>
                        <p className="text-gray-300 text-sm">Sessions automatically tracked to your tasks</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <FiCheck className="text-green-400" size={14} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Smart Breaks</h4>
                        <p className="text-gray-300 text-sm">Automatic break reminders to prevent burnout</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeFeature === 'progress' && (
                <div>
                  <h3 className="text-3xl font-bold text-white mb-4">
                    Visual Progress Tracking
                  </h3>
                  <p className="text-lg text-gray-300 mb-6">
                    See your accomplishments with beautiful progress indicators. Stay motivated with visual feedback.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <FiCheck className="text-green-400" size={14} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Real-Time Updates</h4>
                        <p className="text-gray-300 text-sm">Watch your progress bars fill as you complete tasks</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <FiCheck className="text-green-400" size={14} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Multiple Views</h4>
                        <p className="text-gray-300 text-sm">Track progress by project, list, or time period</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <FiCheck className="text-green-400" size={14} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Milestone Celebrations</h4>
                        <p className="text-gray-300 text-sm">Get recognized when you hit important milestones</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeFeature === 'repeat' && (
                <div>
                  <h3 className="text-3xl font-bold text-white mb-4">
                    Recurring Tasks Made Easy
                  </h3>
                  <p className="text-lg text-gray-300 mb-6">
                    Set up tasks that repeat automatically. Perfect for habits, routines, and recurring responsibilities.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <FiCheck className="text-green-400" size={14} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Flexible Scheduling</h4>
                        <p className="text-gray-300 text-sm">Daily, weekly, monthly, or custom patterns</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <FiCheck className="text-green-400" size={14} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Smart Skipping</h4>
                        <p className="text-gray-300 text-sm">Skip occurrences without breaking the pattern</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <FiCheck className="text-green-400" size={14} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Habit Tracking</h4>
                        <p className="text-gray-300 text-sm">Build streaks and see your consistency over time</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeFeature === 'mood' && (
                <div>
                  <h3 className="text-3xl font-bold text-white mb-4">
                    Mood & Energy Insights
                  </h3>
                  <p className="text-lg text-gray-300 mb-6">
                    Track how you feel and understand your energy patterns. Make better decisions about when to tackle challenging tasks.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <FiCheck className="text-green-400" size={14} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Pattern Recognition</h4>
                        <p className="text-gray-300 text-sm">Discover when you're most productive</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <FiCheck className="text-green-400" size={14} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Task Matching</h4>
                        <p className="text-gray-300 text-sm">Get task suggestions based on your current energy</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <FiCheck className="text-green-400" size={14} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Wellbeing Focus</h4>
                        <p className="text-gray-300 text-sm">Balance productivity with mental health</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
        
        {/* Gradient transition to next section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent via-gray-900/50 to-gray-900 pointer-events-none"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/40 relative overflow-hidden">
        {/* Smooth gradient overlay from top */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-gray-900 to-transparent pointer-events-none"></div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Everything you need to stay organized
            </h2>
            <p className="text-xl md:text-2xl text-gray-300">
              Powerful features designed for modern teams
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="group bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 lg:p-10 hover:bg-gray-800/70 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 border border-gray-700"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <FiZap className="text-3xl text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Fast & Intuitive</h3>
              <p className="text-gray-300 text-lg leading-relaxed">Create and manage tasks in seconds with our streamlined interface.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="group bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 lg:p-10 hover:bg-gray-800/70 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 border border-gray-700"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <FiUsers className="text-3xl text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Team Collaboration</h3>
              <p className="text-gray-300 text-lg leading-relaxed">Assign tasks, share progress, and work together seamlessly.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="group bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 lg:p-10 hover:bg-gray-800/70 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 border border-gray-700"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <FiTarget className="text-3xl text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Track Progress</h3>
              <p className="text-gray-300 text-lg leading-relaxed">Monitor your team's progress with visual dashboards and insights.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="group bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 lg:p-10 hover:bg-gray-800/70 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 border border-gray-700"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <FiClock className="text-3xl text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Time Management</h3>
              <p className="text-gray-300 text-lg leading-relaxed">Set deadlines, reminders, and prioritize what matters most.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="group bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 lg:p-10 hover:bg-gray-800/70 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 border border-gray-700"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <FiShield className="text-3xl text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Secure & Private</h3>
              <p className="text-gray-300 text-lg leading-relaxed">Your data is encrypted and protected with enterprise-grade security.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="group bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 lg:p-10 hover:bg-gray-800/70 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 border border-gray-700"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <FiCloud className="text-3xl text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Cloud Sync</h3>
              <p className="text-gray-300 text-lg leading-relaxed">Access your tasks from anywhere, on any device, in real-time.</p>
            </motion.div>
          </div>
        </div>
        
        {/* Gradient transition to next section */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-b from-transparent via-purple-900/30 to-purple-900/60 pointer-events-none"></div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 bg-gradient-to-br from-purple-900/60 via-gray-900 to-gray-900 text-white relative overflow-hidden">
        {/* Smooth gradient overlay from top */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-purple-900/60 to-transparent pointer-events-none"></div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Ready to get <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">organized</span>?
            </h2>
            <p className="text-xl text-gray-300 mb-10">
              Join thousands of teams already using Snappy to manage their daily tasks
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-2xl shadow-purple-500/50"
              >
                Get Started Free <FiArrowRight />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-10 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-all border border-white/20"
              >
                View Demo
              </Link>
            </div>
            <p className="text-sm text-gray-400 mt-8">
              ⭐ No credit card required • Free forever • Setup in 2 minutes
            </p>
          </motion.div>
        </div>
        
        {/* Gradient transition to footer */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-gray-900 pointer-events-none"></div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-gray-900 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-1 mb-4">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-white mt-[0.35rem]">
                  <path d="M12 8L8 12L12 16M20 8L24 12L20 16M16 4L14 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-xl font-bold text-white">Snappy</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Your daily tasks organized effortlessly.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="text-gray-400 hover:text-white text-sm transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-white text-sm transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Security</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © 2025 Snappy. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Status</a>
              <a href="#" className="hover:text-white transition-colors">Documentation</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
