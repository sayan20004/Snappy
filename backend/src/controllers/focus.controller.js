import Todo from '../models/Todo.model.js';
import { AppError } from '../middleware/error.middleware.js';

// @desc    Start focus session
// @route   POST /api/todos/:id/focus/start
// @access  Private
export const startFocusSession = async (req, res, next) => {
  try {
    const { id } = req.params;

    const todo = await Todo.findOne({ _id: id, owner: req.userId });

    if (!todo) {
      throw new AppError('Todo not found', 404);
    }

    // Check if there's already an active session
    const activeSession = todo.focusSessions.find(s => !s.endedAt);
    if (activeSession) {
      throw new AppError('Focus session already in progress', 400);
    }

    // Start new session
    todo.focusSessions.push({
      startedAt: new Date(),
      interrupted: false
    });

    await todo.save();

    const session = todo.focusSessions[todo.focusSessions.length - 1];

    // Emit socket event
    const io = req.app.get('io');
    io.to(`user:${req.userId}`).emit('focus:started', {
      todoId: id,
      sessionId: session._id
    });

    res.status(201).json({
      message: 'Focus session started',
      session: {
        id: session._id,
        startedAt: session.startedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Stop focus session
// @route   POST /api/todos/:id/focus/stop
// @access  Private
export const stopFocusSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { interrupted = false } = req.body;

    const todo = await Todo.findOne({ _id: id, owner: req.userId });

    if (!todo) {
      throw new AppError('Todo not found', 404);
    }

    // Find active session
    const activeSession = todo.focusSessions.find(s => !s.endedAt);
    if (!activeSession) {
      throw new AppError('No active focus session found', 400);
    }

    // End session
    const now = new Date();
    activeSession.endedAt = now;
    activeSession.interrupted = interrupted;
    activeSession.duration = Math.floor((now - activeSession.startedAt) / 1000 / 60); // minutes

    // Update total focus time
    todo.totalFocusTime = (todo.totalFocusTime || 0) + activeSession.duration;

    await todo.save();

    // Emit socket event
    const io = req.app.get('io');
    io.to(`user:${req.userId}`).emit('focus:stopped', {
      todoId: id,
      sessionId: activeSession._id,
      duration: activeSession.duration
    });

    res.json({
      message: 'Focus session ended',
      session: {
        id: activeSession._id,
        startedAt: activeSession.startedAt,
        endedAt: activeSession.endedAt,
        duration: activeSession.duration,
        interrupted: activeSession.interrupted
      },
      totalFocusTime: todo.totalFocusTime
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active focus session
// @route   GET /api/todos/:id/focus/active
// @access  Private
export const getActiveFocusSession = async (req, res, next) => {
  try {
    const { id } = req.params;

    const todo = await Todo.findOne({ _id: id, owner: req.userId });

    if (!todo) {
      throw new AppError('Todo not found', 404);
    }

    const activeSession = todo.focusSessions.find(s => !s.endedAt);

    if (!activeSession) {
      return res.json({ active: false });
    }

    res.json({
      active: true,
      session: {
        id: activeSession._id,
        startedAt: activeSession.startedAt,
        duration: Math.floor((new Date() - activeSession.startedAt) / 1000 / 60)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get focus statistics
// @route   GET /api/focus/stats
// @access  Private
export const getFocusStats = async (req, res, next) => {
  try {
    const { period = '7d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case '24h':
        startDate.setHours(now.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    const todos = await Todo.find({
      owner: req.userId,
      'focusSessions.startedAt': { $gte: startDate }
    }).lean();

    // Calculate statistics
    const stats = {
      totalSessions: 0,
      totalFocusTime: 0,
      completedSessions: 0,
      interruptedSessions: 0,
      averageSessionLength: 0,
      byDay: {},
      mostProductiveTime: null
    };

    const hourCounts = Array(24).fill(0);

    todos.forEach(todo => {
      todo.focusSessions.forEach(session => {
        if (session.startedAt < startDate) return;

        stats.totalSessions++;
        if (session.duration) {
          stats.totalFocusTime += session.duration;
          stats.completedSessions++;
        }
        if (session.interrupted) {
          stats.interruptedSessions++;
        }

        // Track by day
        const day = session.startedAt.toISOString().split('T')[0];
        stats.byDay[day] = (stats.byDay[day] || 0) + (session.duration || 0);

        // Track by hour
        const hour = new Date(session.startedAt).getHours();
        hourCounts[hour]++;
      });
    });

    // Calculate average
    if (stats.completedSessions > 0) {
      stats.averageSessionLength = Math.round(stats.totalFocusTime / stats.completedSessions);
    }

    // Find most productive time
    const maxHour = hourCounts.indexOf(Math.max(...hourCounts));
    stats.mostProductiveTime = `${maxHour}:00`;

    res.json({ stats });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all user's focus sessions
// @route   GET /api/focus/sessions
// @access  Private
export const getAllFocusSessions = async (req, res, next) => {
  try {
    const { limit = 50, skip = 0 } = req.query;

    const todos = await Todo.find({
      owner: req.userId,
      focusSessions: { $exists: true, $ne: [] }
    })
      .select('title focusSessions')
      .lean();

    // Flatten all sessions with todo info
    const allSessions = [];
    todos.forEach(todo => {
      todo.focusSessions.forEach(session => {
        allSessions.push({
          ...session,
          todoId: todo._id,
          todoTitle: todo.title
        });
      });
    });

    // Sort by date
    allSessions.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));

    // Paginate
    const paginatedSessions = allSessions.slice(
      parseInt(skip),
      parseInt(skip) + parseInt(limit)
    );

    res.json({
      sessions: paginatedSessions,
      total: allSessions.length
    });
  } catch (error) {
    next(error);
  }
};
