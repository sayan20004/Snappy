import List from '../models/List.model.js';
import User from '../models/User.model.js';
import { AppError } from '../middleware/error.middleware.js';

// @desc    Get all lists for user
// @route   GET /api/lists
// @access  Private
export const getLists = async (req, res, next) => {
  try {
    // Get lists where user is owner or collaborator
    const lists = await List.find({
      $or: [
        { owner: req.userId },
        { 'collaborators.userId': req.userId }
      ]
    })
    .populate('owner', 'name email avatarUrl')
    .populate('collaborators.userId', 'name email avatarUrl')
    .sort({ createdAt: -1 })
    .lean();

    res.json({ lists });
  } catch (error) {
    next(error);
  }
};

// @desc    Create list
// @route   POST /api/lists
// @access  Private
export const createList = async (req, res, next) => {
  try {
    const { name, color, icon, isPrivate } = req.body;

    const list = await List.create({
      name,
      owner: req.userId,
      color: color || '#3B82F6',
      icon: icon || '📝',
      isPrivate: isPrivate !== false
    });

    await list.populate('owner', 'name email avatarUrl');

    res.status(201).json({ list });
  } catch (error) {
    next(error);
  }
};

// @desc    Update list
// @route   PATCH /api/lists/:id
// @access  Private
export const updateList = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const list = await List.findById(id);
    
    if (!list) {
      throw new AppError('List not found', 404);
    }

    // Check edit permission
    if (!list.canEdit(req.userId)) {
      throw new AppError('Permission denied', 403);
    }

    // Apply updates
    const allowedUpdates = ['name', 'color', 'icon', 'isPrivate'];
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        list[field] = updates[field];
      }
    });

    await list.save();
    await list.populate('owner', 'name email avatarUrl');
    await list.populate('collaborators.userId', 'name email avatarUrl');

    res.json({ list });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete list
// @route   DELETE /api/lists/:id
// @access  Private
export const deleteList = async (req, res, next) => {
  try {
    const { id } = req.params;

    const list = await List.findOne({ _id: id, owner: req.userId });
    
    if (!list) {
      throw new AppError('List not found or not owner', 404);
    }

    await list.deleteOne();

    res.json({ message: 'List deleted', id });
  } catch (error) {
    next(error);
  }
};

// @desc    Invite collaborator to list
// @route   POST /api/lists/:id/invite
// @access  Private
export const inviteCollaborator = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email, role } = req.body;

    const list = await List.findOne({ _id: id, owner: req.userId });
    
    if (!list) {
      throw new AppError('List not found or not owner', 404);
    }

    // Find user by email
    const userToInvite = await User.findOne({ email });
    
    if (!userToInvite) {
      throw new AppError('User not found', 404);
    }

    // Check if already a collaborator
    const existingCollab = list.collaborators.find(
      c => c.userId.toString() === userToInvite._id.toString()
    );

    if (existingCollab) {
      throw new AppError('User is already a collaborator', 409);
    }

    // Add collaborator
    list.collaborators.push({
      userId: userToInvite._id,
      role: role || 'editor'
    });

    await list.save();
    await list.populate('collaborators.userId', 'name email avatarUrl');

    res.json({ list });
  } catch (error) {
    next(error);
  }
};
