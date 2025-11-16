import Activity from '../models/Activity.model.js';
import { AppError } from '../middleware/error.middleware.js';

// @desc    Get user's activity feed
// @route   GET /api/activities
// @access  Private
export const getActivities = async (req, res, next) => {
  try {
    const { limit = 50, skip = 0, targetType, targetId } = req.query;

    const query = { actor: req.userId };
    
    if (targetType) query.targetType = targetType;
    if (targetId) query.targetId = targetId;

    const activities = await Activity.find(query)
      .populate('actor', 'name email avatarUrl')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    const total = await Activity.countDocuments(query);

    res.json({
      activities,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: total > parseInt(skip) + parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get activities for a specific list
// @route   GET /api/activities/list/:listId
// @access  Private
export const getListActivities = async (req, res, next) => {
  try {
    const { listId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    // Verify user has access to list
    const List = (await import('../models/List.model.js')).default;
    const list = await List.findById(listId);
    
    if (!list || !list.hasAccess(req.userId)) {
      throw new AppError('List not found or access denied', 404);
    }

    // Get activities related to this list
    const Todo = (await import('../models/Todo.model.js')).default;
    const listTodos = await Todo.find({ listId }).select('_id').lean();
    const todoIds = listTodos.map(t => t._id);

    const activities = await Activity.find({
      $or: [
        { targetType: 'list', targetId: listId },
        { targetType: 'todo', targetId: { $in: todoIds } }
      ]
    })
      .populate('actor', 'name email avatarUrl')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    res.json({ activities });
  } catch (error) {
    next(error);
  }
};

// @desc    Get activity statistics
// @route   GET /api/activities/stats
// @access  Private
export const getActivityStats = async (req, res, next) => {
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

    const activities = await Activity.find({
      actor: req.userId,
      createdAt: { $gte: startDate }
    }).lean();

    // Aggregate statistics
    const stats = {
      total: activities.length,
      byAction: {},
      byDay: {},
      mostActive: null
    };

    // Count by action type
    activities.forEach(activity => {
      stats.byAction[activity.action] = (stats.byAction[activity.action] || 0) + 1;
      
      const day = activity.createdAt.toISOString().split('T')[0];
      stats.byDay[day] = (stats.byDay[day] || 0) + 1;
    });

    // Find most active day
    let maxCount = 0;
    for (const [day, count] of Object.entries(stats.byDay)) {
      if (count > maxCount) {
        maxCount = count;
        stats.mostActive = day;
      }
    }

    res.json({ stats });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete old activities (cleanup)
// @route   DELETE /api/activities/cleanup
// @access  Private
export const cleanupActivities = async (req, res, next) => {
  try {
    const { days = 90 } = req.query;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    const result = await Activity.deleteMany({
      actor: req.userId,
      createdAt: { $lt: cutoffDate }
    });

    res.json({ 
      message: 'Activities cleaned up',
      deleted: result.deletedCount
    });
  } catch (error) {
    next(error);
  }
};
