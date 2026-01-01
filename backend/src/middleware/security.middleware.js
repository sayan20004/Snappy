/**
 * Security Middleware Collection
 * Production-grade security layers for Express.js
 */

import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import { body, param, query } from 'express-validator';
import crypto from 'crypto';

// ============================================
// INPUT SANITIZATION
// Prevents NoSQL injection and XSS
// ============================================
export const sanitizeInput = (req, res, next) => {
  // Sanitize body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        // Remove any potential script tags
        req.body[key] = req.body[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .trim();
      }
    });
  }

  // Sanitize query params
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .trim();
      }
    });
  }

  next();
};

// ============================================
// NOSQL INJECTION PREVENTION
// ============================================
export const preventNoSQLInjection = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`NoSQL injection attempt detected: ${key} in ${req.method} ${req.path}`);
  }
});

// ============================================
// RATE LIMITING BY ENDPOINT
// ============================================
export const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100,
    message = 'Too many requests, please try again later',
    skipSuccessfulRequests = false,
    skipFailedRequests = false
  } = options;

  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
    skipFailedRequests,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: {
          message,
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: Math.ceil(windowMs / 1000)
        }
      });
    }
  });
};

// Strict rate limiter for auth endpoints
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many authentication attempts, please try again later',
  skipSuccessfulRequests: true
});

// Moderate rate limiter for API endpoints
export const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100
});

// Strict rate limiter for file uploads
export const uploadRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: 'Upload limit exceeded, please try again later'
});

// ============================================
// CSRF PROTECTION (Token-based)
// ============================================
const csrfTokens = new Map();

export const generateCSRFToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const setCSRFToken = (req, res, next) => {
  const token = generateCSRFToken();
  const sessionId = req.sessionID || req.user?.id || req.ip;
  
  csrfTokens.set(sessionId, token);
  res.locals.csrfToken = token;
  
  // Clean up old tokens (older than 1 hour)
  setTimeout(() => {
    csrfTokens.delete(sessionId);
  }, 60 * 60 * 1000);
  
  next();
};

export const verifyCSRFToken = (req, res, next) => {
  const token = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionId = req.sessionID || req.user?.id || req.ip;
  
  const storedToken = csrfTokens.get(sessionId);
  
  if (!token || token !== storedToken) {
    return res.status(403).json({
      success: false,
      error: {
        message: 'Invalid CSRF token',
        code: 'CSRF_VALIDATION_FAILED'
      }
    });
  }
  
  next();
};

// CSRF token route handler
export const getCsrfToken = (req, res) => {
  const token = generateCSRFToken();
  const sessionId = req.sessionID || req.ip;
  
  csrfTokens.set(sessionId, token);
  
  // Clean up old tokens (older than 1 hour)
  setTimeout(() => {
    csrfTokens.delete(sessionId);
  }, 60 * 60 * 1000);
  
  res.json({
    success: true,
    csrfToken: token
  });
};

// ============================================
// SQL/NoSQL INJECTION VALIDATION
// ============================================
export const validateObjectId = (paramName = 'id') => {
  return param(paramName)
    .matches(/^[0-9a-fA-F]{24}$/)
    .withMessage('Invalid ID format');
};

// ============================================
// XSS PROTECTION HEADERS
// ============================================
export const securityHeaders = (req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // XSS Protection (legacy but still useful)
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};

// ============================================
// PASSWORD STRENGTH VALIDATION
// ============================================
export const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const errors = [];
  
  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }
  if (!hasUpperCase) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!hasLowerCase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!hasNumbers) {
    errors.push('Password must contain at least one number');
  }
  if (!hasSpecialChar) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const passwordStrengthValidator = body('password')
  .custom((value) => {
    const { isValid, errors } = validatePasswordStrength(value);
    if (!isValid) {
      throw new Error(errors.join('. '));
    }
    return true;
  });

// ============================================
// FILE UPLOAD SECURITY
// ============================================
export const validateFileUpload = (req, res, next) => {
  if (!req.file && !req.files) {
    return next();
  }

  const file = req.file || (req.files && req.files[0]);
  
  if (file) {
    // Check file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'File size exceeds 10MB limit',
          code: 'FILE_TOO_LARGE'
        }
      });
    }

    // Validate file extension
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx', '.txt'];
    const ext = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));
    
    if (!allowedExtensions.includes(ext)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'File type not allowed',
          code: 'INVALID_FILE_TYPE'
        }
      });
    }

    // Validate MIME type matches extension
    const mimeTypeMap = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
      '.txt': 'text/plain'
    };

    const expectedMime = mimeTypeMap[ext];
    if (expectedMime && !file.mimetype.includes(expectedMime.split('/')[0])) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'File type does not match extension',
          code: 'MIME_TYPE_MISMATCH'
        }
      });
    }
  }

  next();
};

// ============================================
// ACCOUNT LOCKOUT AFTER FAILED ATTEMPTS
// ============================================
const loginAttempts = new Map();

export const trackLoginAttempts = (identifier) => {
  const now = Date.now();
  const attempts = loginAttempts.get(identifier) || { count: 0, firstAttempt: now };
  
  // Reset after 15 minutes
  if (now - attempts.firstAttempt > 15 * 60 * 1000) {
    attempts.count = 0;
    attempts.firstAttempt = now;
  }
  
  attempts.count++;
  loginAttempts.set(identifier, attempts);
  
  return attempts;
};

export const checkAccountLockout = (req, res, next) => {
  const identifier = req.body.email || req.ip;
  const attempts = loginAttempts.get(identifier);
  
  if (attempts && attempts.count >= 5) {
    const timeLeft = Math.ceil((15 * 60 * 1000 - (Date.now() - attempts.firstAttempt)) / 1000 / 60);
    
    return res.status(429).json({
      success: false,
      error: {
        message: `Account temporarily locked. Try again in ${timeLeft} minutes`,
        code: 'ACCOUNT_LOCKED',
        retryAfter: timeLeft * 60
      }
    });
  }
  
  next();
};

export const resetLoginAttempts = (identifier) => {
  loginAttempts.delete(identifier);
};

// ============================================
// JWT TOKEN BLACKLIST (for logout)
// ============================================
const tokenBlacklist = new Set();

export const blacklistToken = (token) => {
  tokenBlacklist.add(token);
  
  // Remove after expiry (7 days default)
  setTimeout(() => {
    tokenBlacklist.delete(token);
  }, 7 * 24 * 60 * 60 * 1000);
};

export const checkBlacklistedToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    if (tokenBlacklist.has(token)) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Token has been revoked',
          code: 'TOKEN_REVOKED'
        }
      });
    }
  }
  
  next();
};

// ============================================
// SECURITY AUDIT LOGGING
// ============================================
export const securityLogger = (event, details = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    ...details
  };
  
  console.warn('[SECURITY]', JSON.stringify(logEntry));
  
  // In production, send to external logging service
  // e.g., Sentry, LogRocket, CloudWatch, etc.
};

// ============================================
// IP WHITELIST/BLACKLIST
// ============================================
const ipBlacklist = new Set();
const ipWhitelist = new Set();

export const addToBlacklist = (ip) => {
  ipBlacklist.add(ip);
  securityLogger('IP_BLACKLISTED', { ip });
};

export const addToWhitelist = (ip) => {
  ipWhitelist.add(ip);
};

export const checkIPRestrictions = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  
  // If whitelist exists and IP not in it, block
  if (ipWhitelist.size > 0 && !ipWhitelist.has(ip)) {
    securityLogger('IP_NOT_WHITELISTED', { ip, path: req.path });
    return res.status(403).json({
      success: false,
      error: {
        message: 'Access denied',
        code: 'IP_NOT_ALLOWED'
      }
    });
  }
  
  // If IP is blacklisted, block
  if (ipBlacklist.has(ip)) {
    securityLogger('BLACKLISTED_IP_ATTEMPT', { ip, path: req.path });
    return res.status(403).json({
      success: false,
      error: {
        message: 'Access denied',
        code: 'IP_BLOCKED'
      }
    });
  }
  
  next();
};
