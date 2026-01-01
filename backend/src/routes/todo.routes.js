import express from 'express';
import { body } from 'express-validator';
import { 
  getTodos, 
  createTodo, 
  updateTodo, 
  deleteTodo 
} from '../controllers/todo.controller.js';
import {
  addComment,
  updateComment,
  deleteComment,
  addReaction,
  removeReaction
} from '../controllers/comment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { apiRateLimiter, sanitizeInput } from '../middleware/security.middleware.js';

const router = express.Router();

// Apply rate limiting and sanitization
router.use(apiRateLimiter);
router.use(sanitizeInput);

// All routes require authentication
router.use(authenticate);

// Validation rules
const createTodoValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('note')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Note cannot exceed 1000 characters'),
  body('priority')
    .optional()
    .isInt({ min: 0, max: 3 })
    .withMessage('Priority must be between 0 and 3'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
];

const updateTodoValidation = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'done', 'archived', 'snoozed'])
    .withMessage('Invalid status')
];

// Routes
router.get('/', getTodos);
router.post('/', createTodoValidation, validate, createTodo);
router.patch('/:id', updateTodoValidation, validate, updateTodo);
router.delete('/:id', deleteTodo);

// Comment routes
const commentValidation = [
  body('text')
    .trim()
    .notEmpty()
    .withMessage('Comment text is required')
    .isLength({ max: 2000 })
    .withMessage('Comment cannot exceed 2000 characters')
];

router.post('/:id/comments', commentValidation, validate, addComment);
router.patch('/:id/comments/:commentId', commentValidation, validate, updateComment);
router.delete('/:id/comments/:commentId', deleteComment);

// Reaction routes
router.post('/:id/comments/:commentId/reactions', 
  body('type').isIn(['like', 'love', 'check', 'zap']).withMessage('Invalid reaction type'),
  validate,
  addReaction
);
router.delete('/:id/comments/:commentId/reactions', removeReaction);

export default router;
