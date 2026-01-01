import express from 'express';
import { getUsers, getUserById, getCurrentUser, updateProfile, uploadAvatar } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { upload } from '../config/upload.js';
import { apiRateLimiter, uploadRateLimiter, sanitizeInput } from '../middleware/security.middleware.js';

const router = express.Router();

// Apply rate limiting and sanitization
router.use(apiRateLimiter);
router.use(sanitizeInput);

// All routes are protected
router.use(authenticate);

// Routes
router.get('/', getUsers);
router.get('/me', getCurrentUser);
router.patch('/me', updateProfile);
router.post('/me/avatar', uploadRateLimiter, upload.single('avatar'), uploadAvatar);
router.get('/:id', getUserById);

export default router;
