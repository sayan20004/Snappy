import Todo from '../models/Todo.model.js';
import List from '../models/List.model.js';
import Activity from '../models/Activity.model.js';
import { AppError } from '../middleware/error.middleware.js';

// @desc    Get todos with filters
// @route   GET /api/todos
// @access  Private
export const getTodos = async (req, res, next) => {
  try {
    const { listId, tag, status, limit = 100, skip = 0 } = req.query;
    
    const query = { owner: req.userId };
    
    if (listId) query.listId = listId;
    if (tag) query.tags = tag;
    if (status) query.status = status;

    const todos = await Todo.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    const total = await Todo.countDocuments(query);

    res.json({
      todos,
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

// @desc    Create todo
// @route   POST /api/todos
// @access  Private
export const createTodo = async (req, res, next) => {
  try {
    const { title, note, listId, tags, priority, dueAt, subSteps, links, voiceNote, energyLevel, effortMinutes, location, mood, bestTimeToComplete, assignedTo, source } = req.body;

    // Verify list ownership if listId provided
    if (listId) {
      const list = await List.findById(listId);
      if (!list || !list.hasAccess(req.userId)) {
        throw new AppError('List not found or access denied', 404);
      }
    }

    // Direct Mongoose create - no BaseService
    const todo = await Todo.create({
      title,
      note: note || '',
      owner: req.userId,
      listId: listId || null,
      tags: tags || [],
      priority: priority ?? 2,
      dueAt: dueAt || null,
      subSteps: subSteps || [],
      links: links || [],
      voiceNote,
      energyLevel,
      effortMinutes,
      location,
      mood,
      bestTimeToComplete,
      assignedTo: assignedTo || [],
      source: source || 'manual'
    });

    // Log activity
    await Activity.create({
      actor: req.userId,
      action: 'create_todo',
      targetType: 'todo',
      targetId: todo._id,
      payload: { title }
    });

    // Emit socket event
    const io = req.app.get('io');
    if (listId) io.to(`list:${listId}`).emit('todo:created', todo);
    io.to(`user:${req.userId}`).emit('todo:created', todo);

    res.status(201).json({ todo });
  } catch (error) {
    next(error);
  }
};

// @desc    Update todo
// @route   PATCH /api/todos/:id
// @access  Private
export const updateTodo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Direct Mongoose findById - no BaseService
    const todo = await Todo.findById(id);
    
    if (!todo) {
      throw new AppError('Todo not found', 404);
    }

    // Check permissions
    const isOwner = todo.owner.toString() === req.userId.toString();
    let hasListAccess = false;
    
    if (todo.listId && !isOwner) {
      const list = await List.findById(todo.listId);
      if (list) hasListAccess = list.canEdit(req.userId);
    }
    
    if (!isOwner && !hasListAccess && todo.listId !== null) {
      throw new AppError('Permission denied', 403);
    }

    // Apply allowed updates directly
    const allowedUpdates = ['title', 'note', 'status', 'priority', 'tags', 'dueAt', 'listId', 'subSteps', 'links', 'voiceNote', 'energyLevel', 'effortMinutes', 'location', 'mood', 'bestTimeToComplete', 'assignedTo', 'comments', 'reactions'];
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) todo[field] = updates[field];
    });

    await todo.save();

    // Log activity
    await Activity.create({
      actor: req.userId,
      action: 'update_todo',
      targetType: 'todo',
      targetId: todo._id,
      payload: updates
    });

    // Emit socket event
    const io = req.app.get('io');
    if (todo.listId) io.to(`list:${todo.listId}`).emit('todo:updated', todo);
    io.to(`user:${req.userId}`).emit('todo:updated', todo);

    res.json({ todo });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete todo
// @route   DELETE /api/todos/:id
// @access  Private
export const deleteTodo = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find todo
    const todo = await Todo.findById(id);
    
    if (!todo) {
      throw new AppError('Todo not found', 404);
    }

    // Check if user has permission to delete
    const isOwner = todo.owner.toString() === req.userId.toString();
    let hasListAccess = false;
    
    if (todo.listId && !isOwner) {
      const list = await List.findById(todo.listId);
      if (list) {
        hasListAccess = list.canEdit(req.userId);
      }
    }
    
    // Allow delete if owner OR has list access OR if listId is null (inbox items)
    if (!isOwner && !hasListAccess && todo.listId !== null) {
      throw new AppError('Permission denied', 403);
    }

    await todo.deleteOne();

    // Log activity
    await Activity.create({
      actor: req.userId,
      action: 'delete_todo',
      targetType: 'todo',
      targetId: todo._id,
      payload: { title: todo.title }
    });

    // Emit socket event
    const io = req.app.get('io');
    if (todo.listId) {
      io.to(`list:${todo.listId}`).emit('todo:deleted', { id: todo._id });
    }
    io.to(`user:${req.userId}`).emit('todo:deleted', { id: todo._id });

    res.json({ message: 'Todo deleted', id: todo._id });
  } catch (error) {
    next(error);
  }
};
