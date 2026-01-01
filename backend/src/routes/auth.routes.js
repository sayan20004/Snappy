import express from 'express';
import { body } from 'express-validator';
import { register, login, getMe } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { 
  authRateLimiter, 
  checkAccountLockout, 
  passwordStrengthValidator,
  sanitizeInput,
  getCsrfToken
} from '../middleware/security.middleware.js';

const router = express.Router();

// Validation rules with enhanced security
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens and apostrophes'),
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
    .isLength({ max: 100 })
    .withMessage('Email too long'),
  passwordStrengthValidator
];

const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Routes with security middleware
router.post(
  '/register', 
  authRateLimiter, 
  sanitizeInput,
  registerValidation, 
  validate, 
  register
);

router.post(
  '/login', 
  authRateLimiter,
  checkAccountLockout,
  sanitizeInput,
  loginValidation, 
  validate, 
  login
);

// CSRF token endpoint
router.get('/csrf-token', getCsrfToken);

router.get('/me', authenticate, getMe);

export default router;
