import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import { securityLogger } from './security.middleware.js';

export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      securityLogger('AUTH_NO_TOKEN', { ip: req.ip, path: req.path });
      return res.status(401).json({ 
        success: false,
        error: { message: 'No token provided', code: 'NO_TOKEN' }
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await User.findById(decoded.userId).select('-passwordHash');
    
    if (!user) {
      securityLogger('AUTH_USER_NOT_FOUND', { userId: decoded.userId, ip: req.ip });
      return res.status(401).json({ 
        success: false,
        error: { message: 'User not found', code: 'USER_NOT_FOUND' }
      });
    }

    // Attach user to request
    req.user = user;
    req.userId = user._id;
    req.token = token;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      securityLogger('AUTH_INVALID_TOKEN', { error: error.message, ip: req.ip });
      return res.status(401).json({ 
        success: false,
        error: { message: 'Invalid token', code: 'INVALID_TOKEN' }
      });
    }
    if (error.name === 'TokenExpiredError') {
      securityLogger('AUTH_TOKEN_EXPIRED', { ip: req.ip });
      return res.status(401).json({ 
        success: false,
        error: { message: 'Token expired', code: 'TOKEN_EXPIRED' }
      });
    }
    securityLogger('AUTH_ERROR', { error: error.message, ip: req.ip });
    return res.status(500).json({ 
      success: false,
      error: { message: 'Authentication failed', code: 'AUTH_FAILED' }
    });
  }
};

// Optional auth middleware (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-passwordHash');
      
      if (user) {
        req.user = user;
        req.userId = user._id;
      }
    }
    
    next();
  } catch (error) {
    // Silently fail for optional auth
    next();
  }
};
