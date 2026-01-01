import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import { AppError } from '../middleware/error.middleware.js';
import { 
  trackLoginAttempts, 
  resetLoginAttempts,
  securityLogger 
} from '../middleware/security.middleware.js';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    // Create user
    const user = await User.create({
      name,
      email,
      passwordHash: password // Will be hashed by pre-save hook
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        settings: user.settings,
        createdAt: user.createdAt
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user with password field
    const user = await User.findOne({ email }).select('+passwordHash');
    
    if (!user) {
      trackLoginAttempts(email);
      securityLogger('LOGIN_FAILED', { email, reason: 'User not found', ip: req.ip });
      throw new AppError('Invalid email or password', 401);
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      trackLoginAttempts(email);
      securityLogger('LOGIN_FAILED', { email, reason: 'Invalid password', ip: req.ip });
      throw new AppError('Invalid email or password', 401);
    }

    // Reset login attempts on successful login
    resetLoginAttempts(email);
    securityLogger('LOGIN_SUCCESS', { userId: user._id, email, ip: req.ip });

    // Generate token
    const token = generateToken(user._id);

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        settings: user.settings,
        createdAt: user.createdAt
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    // User is already attached by auth middleware
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        avatarUrl: req.user.avatarUrl,
        settings: req.user.settings,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};
