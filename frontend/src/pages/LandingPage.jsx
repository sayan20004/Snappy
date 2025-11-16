import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiZap, FiTarget, FiClock, FiCloud, FiShield, FiUsers, FiCheck, FiArrowRight, FiStar, FiTrendingUp, FiLayout, FiCpu } from 'react-icons/fi';

export default function LandingPage() {
  const features = [
    {
      icon: <FiZap className="text-4xl" />,
      title: "Brain-Dump Mode",
      description: "Tasks extract and organize themselves. Just think, type, and watch them transform into actionable items.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: <FiLayout className="text-4xl" />,
      title: "Life OS Dashboard",
      description: "Context-aware daily overview that adapts to your energy, schedule, and priorities in real-time.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <FiClock className="text-4xl" />,
      title: "Dynamic Timeboxing",
      description: "Tasks auto-fit your schedule. Intelligent time allocation that respects your reality.",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: <FiTarget className="text-4xl" />,
      title: "Focus Mode",
      description: "Flow-state on demand. Distraction-free environment designed for deep work sessions.",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: <FiTrendingUp className="text-4xl" />,
      title: "Retro-Snappy UI",
      description: "Ultra-fast micro-interactions meet retro-modern aesthetics. Every click feels instant.",
      gradient: "from-yellow-500 to-amber-500"
    }
  ];

  const painPoints = [
    "Stop juggling tasks across multiple apps",
    "No more overwhelming, endless lists",
    "Plan your day realistically, not optimistically",
    "Capture ideas instantly without losing flow",
    "Stay in flow state longer",
    "Reduce decision fatigue by 80%"
  ];

  const credibility = [
    { icon: <FiCloud />, text: "Offline-first architecture" },
    { icon: <FiShield />, text: "Privacy-first, your data stays yours" },
    { icon: <FiUsers />, text: "Real-time collaboration built-in" },
    { icon: <FiCpu />, text: "AI-powered but user-controlled" }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <Helmet>
        <title>Snappy Todo — Ultra-Fast Task Management App | Brain-Dump Your Life</title>
        <meta name="description" content="A lightning-fast, brain-first todo app with AI-powered intention detection, collaborative lists, focus modes, and real-time sync. Organize your life effortlessly." />
        <link rel="canonical" href="https://snappy-todo.com" />
      </Helmet>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">⚡️</span>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
              Snappy Todo
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-6 py-2 bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg font-medium hover:shadow-lg hover:shadow-primary-500/50 transition-all"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              A Todo App That
              <span className="block bg-gradient-to-r from-primary-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Thinks For You
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-3xl mx-auto">
              Instant capture, dynamic timeboxing, adaptive dashboards, and focus tools in one place.
            </p>
            <p className="text-sm text-gray-500 mb-10">
              ✨ Loved by 1,200+ students, developers & creators
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-8 py-4 bg-gradient-to-r from-primary-600 to-purple-600 rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-primary-500/50 transition-all transform hover:scale-105"
              >
                Get Started Free <FiArrowRight className="inline ml-2" />
              </Link>
              <button className="px-8 py-4 bg-gray-800 border border-gray-700 rounded-xl font-semibold text-lg hover:bg-gray-700 transition-all">
                View Demo
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Badge */}
      <section className="py-12 border-y border-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-400">
            <div className="flex items-center gap-2">
              <FiStar className="text-yellow-500" />
              <span className="text-sm">Offline-first</span>
            </div>
            <div className="flex items-center gap-2">
              <FiShield className="text-green-500" />
              <span className="text-sm">Privacy-first</span>
            </div>
            <div className="flex items-center gap-2">
              <FiUsers className="text-blue-500" />
              <span className="text-sm">Real-time Sync</span>
            </div>
            <div className="flex items-center gap-2">
              <FiZap className="text-purple-500" />
              <span className="text-sm">Ultra-fast</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Teasers */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              This is not a normal todo app
            </h2>
            <p className="text-xl text-gray-400">
              Built for how your brain actually works
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity blur-xl -z-10"
                  style={{
                    background: `linear-gradient(135deg, ${feature.gradient.split(' ')[0].replace('from-', '')}, ${feature.gradient.split(' ')[1].replace('to-', '')})`
                  }}
                />
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 h-full hover:border-gray-600 transition-all">
                  <div className={`bg-gradient-to-r ${feature.gradient} w-16 h-16 rounded-xl flex items-center justify-center mb-6`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 px-6 bg-gray-900/50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Turn chaos into clarity
            </h2>
            <p className="text-xl text-gray-400">
              Get more done with half the mental load
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 gap-4"
          >
            {painPoints.map((point, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="flex items-start gap-3 bg-gray-800/30 rounded-xl p-4 border border-gray-800"
              >
                <FiCheck className="text-green-500 text-xl flex-shrink-0 mt-1" />
                <span className="text-gray-300">{point}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Credibility Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for trust, privacy & performance
            </h2>
            <p className="text-lg text-gray-400">
              Enterprise-grade features for everyone
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {credibility.map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center bg-gray-800/30 rounded-xl p-6 border border-gray-800"
              >
                <div className="text-4xl text-primary-400 mb-4 flex justify-center">
                  {item.icon}
                </div>
                <p className="text-gray-300">{item.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Demo Preview Section */}
      <section className="py-20 px-6 bg-gray-900/50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              See it in action
            </h2>
            <p className="text-xl text-gray-400">
              Experience the speed, clarity, and power
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden border border-gray-700 shadow-2xl"
          >
            <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <div className="text-center">
                <FiZap className="text-6xl text-primary-400 mx-auto mb-4" />
                <p className="text-gray-400">Demo Preview Coming Soon</p>
                <p className="text-sm text-gray-500 mt-2">Quick add • Focus mode • Timeboxing • Command palette</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Simple, honest pricing
            </h2>
            <p className="text-xl text-gray-400">
              Start free. Upgrade when you're ready.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gray-800/30 rounded-2xl p-8 border border-gray-700"
            >
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <p className="text-gray-400 mb-6">Perfect to get started</p>
              <div className="text-4xl font-bold mb-6">$0<span className="text-lg text-gray-500">/forever</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <FiCheck className="text-green-500" />
                  <span className="text-gray-300">Unlimited tasks</span>
                </li>
                <li className="flex items-center gap-2">
                  <FiCheck className="text-green-500" />
                  <span className="text-gray-300">Basic timeboxing</span>
                </li>
                <li className="flex items-center gap-2">
                  <FiCheck className="text-green-500" />
                  <span className="text-gray-300">Focus mode</span>
                </li>
                <li className="flex items-center gap-2">
                  <FiCheck className="text-green-500" />
                  <span className="text-gray-300">Mobile apps</span>
                </li>
              </ul>
              <Link
                to="/register"
                className="block text-center px-6 py-3 bg-gray-700 rounded-lg font-medium hover:bg-gray-600 transition-all"
              >
                Start Free
              </Link>
            </motion.div>

            {/* Pro Plan */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-primary-900/30 to-purple-900/30 rounded-2xl p-8 border-2 border-primary-500 relative"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary-600 to-purple-600 rounded-full text-sm font-medium">
                Coming Soon
              </div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <p className="text-gray-400 mb-6">For power users</p>
              <div className="text-4xl font-bold mb-6">$9<span className="text-lg text-gray-500">/month</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <FiCheck className="text-primary-400" />
                  <span className="text-gray-300">Everything in Free</span>
                </li>
                <li className="flex items-center gap-2">
                  <FiCheck className="text-primary-400" />
                  <span className="text-gray-300">AI-powered insights</span>
                </li>
                <li className="flex items-center gap-2">
                  <FiCheck className="text-primary-400" />
                  <span className="text-gray-300">Advanced analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <FiCheck className="text-primary-400" />
                  <span className="text-gray-300">Team collaboration</span>
                </li>
                <li className="flex items-center gap-2">
                  <FiCheck className="text-primary-400" />
                  <span className="text-gray-300">Priority support</span>
                </li>
              </ul>
              <button className="block w-full text-center px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg font-medium hover:shadow-xl hover:shadow-primary-500/50 transition-all">
                Coming Soon
              </button>
            </motion.div>
          </div>

          <p className="text-center text-gray-500 mt-8">
            No credit card required • Cancel anytime • 30-day money-back guarantee
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-primary-900/20 to-purple-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Upgrade how you work — starting today
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Join thousands who've transformed their productivity in less than 2 minutes
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-primary-600 to-purple-600 rounded-xl font-semibold text-xl hover:shadow-2xl hover:shadow-primary-500/50 transition-all transform hover:scale-105"
            >
              Start Free — No Signup Hassle <FiArrowRight />
            </Link>
            <p className="text-sm text-gray-500 mt-6">
              Free forever • No credit card • Takes 30 seconds
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-800">
        <div className="max-w-6xl mx-auto text-center text-gray-500">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">⚡️</span>
            <span className="text-lg font-bold text-gray-400">Snappy Todo</span>
          </div>
          <p className="text-sm">
            © 2025 Snappy Todo. Built for students, developers & creators.
          </p>
        </div>
      </footer>
    </div>
  );
}
