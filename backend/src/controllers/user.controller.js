import User from '../models/User.model.js';
import { AppError } from '../middleware/error.middleware.js';

// @desc    Get all users (for mentions/collaboration)
// @route   GET /api/users
// @access  Private
export const getUsers = async (req, res, next) => {
  try {
    const { search } = req.query;
    
    let query = {};
    
    // Search by name or email
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const users = await User.find(query)
      .select('name email avatarUrl')
      .limit(20)
      .lean();

    res.json({ users });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name email avatarUrl createdAt')
      .lean();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId)
      .select('name email avatarUrl createdAt')
      .lean();

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PATCH /api/users/me
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, avatarUrl, settings } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Update fields
    if (name) user.name = name;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    if (settings) {
      if (!user.settings) user.settings = {};
      if (settings.aiEnabled !== undefined) user.settings.aiEnabled = settings.aiEnabled;
      if (settings.multimediaEnabled !== undefined) user.settings.multimediaEnabled = settings.multimediaEnabled;
    }

    await user.save();

    res.json({ 
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        settings: user.settings,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload avatar image
// @route   POST /api/users/me/avatar
// @access  Private
export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    const avatarUrl = `/uploads/images/${req.file.filename}`;

    const user = await User.findById(req.userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.avatarUrl = avatarUrl;
    await user.save();

    res.json({ 
      avatarUrl,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        settings: user.settings
      }
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    next(error);
  }
};
