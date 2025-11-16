import Todo from '../models/Todo.model.js';
import { AppError } from '../middleware/error.middleware.js';

// @desc    Add comment to todo
// @route   POST /api/todos/:id/comments
// @access  Private
export const addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text, mentions } = req.body;

    const todo = await Todo.findById(id);
    
    if (!todo) {
      throw new AppError('Todo not found', 404);
    }

    // Verify user has access (owner or collaborator)
    if (todo.listId) {
      const List = (await import('../models/List.model.js')).default;
      const list = await List.findById(todo.listId);
      if (!list || !list.hasAccess(req.userId)) {
        throw new AppError('Access denied', 403);
      }
    } else if (todo.owner.toString() !== req.userId) {
      throw new AppError('Access denied', 403);
    }

    const comment = {
      user: req.userId,
      text,
      mentions: mentions || [],
      reactions: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    todo.comments.push(comment);
    await todo.save();

    // Populate user info for response
    const populatedTodo = await Todo.findById(id)
      .populate('comments.user', 'name email avatarUrl')
      .populate('comments.mentions', 'name email');

    const addedComment = populatedTodo.comments[populatedTodo.comments.length - 1];

    // Emit socket event
    const io = req.app.get('io');
    if (todo.listId) {
      io.to(`list:${todo.listId}`).emit('comment:added', {
        todoId: id,
        comment: addedComment
      });
    }

    res.status(201).json({ comment: addedComment });
  } catch (error) {
    next(error);
  }
};

// @desc    Update comment
// @route   PATCH /api/todos/:id/comments/:commentId
// @access  Private
export const updateComment = async (req, res, next) => {
  try {
    const { id, commentId } = req.params;
    const { text } = req.body;

    const todo = await Todo.findById(id);
    
    if (!todo) {
      throw new AppError('Todo not found', 404);
    }

    const comment = todo.comments.id(commentId);
    
    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    // Only comment author can edit
    if (comment.user.toString() !== req.userId) {
      throw new AppError('Not authorized to edit this comment', 403);
    }

    comment.text = text;
    comment.updatedAt = new Date();

    await todo.save();

    // Populate and return updated comment
    const populatedTodo = await Todo.findById(id)
      .populate('comments.user', 'name email avatarUrl');
    
    const updatedComment = populatedTodo.comments.id(commentId);

    // Emit socket event
    const io = req.app.get('io');
    if (todo.listId) {
      io.to(`list:${todo.listId}`).emit('comment:updated', {
        todoId: id,
        comment: updatedComment
      });
    }

    res.json({ comment: updatedComment });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete comment
// @route   DELETE /api/todos/:id/comments/:commentId
// @access  Private
export const deleteComment = async (req, res, next) => {
  try {
    const { id, commentId } = req.params;

    const todo = await Todo.findById(id);
    
    if (!todo) {
      throw new AppError('Todo not found', 404);
    }

    const comment = todo.comments.id(commentId);
    
    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    // Only comment author or todo owner can delete
    if (comment.user.toString() !== req.userId && todo.owner.toString() !== req.userId) {
      throw new AppError('Not authorized to delete this comment', 403);
    }

    comment.deleteOne();
    await todo.save();

    // Emit socket event
    const io = req.app.get('io');
    if (todo.listId) {
      io.to(`list:${todo.listId}`).emit('comment:deleted', {
        todoId: id,
        commentId
      });
    }

    res.json({ message: 'Comment deleted', commentId });
  } catch (error) {
    next(error);
  }
};

// @desc    Add reaction to comment
// @route   POST /api/todos/:id/comments/:commentId/reactions
// @access  Private
export const addReaction = async (req, res, next) => {
  try {
    const { id, commentId } = req.params;
    const { type } = req.body;

    if (!['like', 'love', 'check', 'zap'].includes(type)) {
      throw new AppError('Invalid reaction type', 400);
    }

    const todo = await Todo.findById(id);
    
    if (!todo) {
      throw new AppError('Todo not found', 404);
    }

    const comment = todo.comments.id(commentId);
    
    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    // Check if user already reacted
    const existingReaction = comment.reactions.find(
      r => r.user.toString() === req.userId
    );

    if (existingReaction) {
      // Update reaction type
      existingReaction.type = type;
    } else {
      // Add new reaction
      comment.reactions.push({
        user: req.userId,
        type
      });
    }

    await todo.save();

    // Populate and return updated comment
    const populatedTodo = await Todo.findById(id)
      .populate('comments.user', 'name email avatarUrl')
      .populate('comments.reactions.user', 'name email avatarUrl');
    
    const updatedComment = populatedTodo.comments.id(commentId);

    // Emit socket event
    const io = req.app.get('io');
    if (todo.listId) {
      io.to(`list:${todo.listId}`).emit('comment:reaction', {
        todoId: id,
        commentId,
        reaction: { user: req.userId, type }
      });
    }

    res.json({ comment: updatedComment });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove reaction from comment
// @route   DELETE /api/todos/:id/comments/:commentId/reactions
// @access  Private
export const removeReaction = async (req, res, next) => {
  try {
    const { id, commentId } = req.params;

    const todo = await Todo.findById(id);
    
    if (!todo) {
      throw new AppError('Todo not found', 404);
    }

    const comment = todo.comments.id(commentId);
    
    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    // Remove user's reaction
    comment.reactions = comment.reactions.filter(
      r => r.user.toString() !== req.userId
    );

    await todo.save();

    // Emit socket event
    const io = req.app.get('io');
    if (todo.listId) {
      io.to(`list:${todo.listId}`).emit('comment:reaction:removed', {
        todoId: id,
        commentId,
        userId: req.userId
      });
    }

    res.json({ message: 'Reaction removed' });
  } catch (error) {
    next(error);
  }
};
