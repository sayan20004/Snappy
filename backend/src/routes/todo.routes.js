import express from 'express';
import { body } from 'express-validator';
import { 
  getTodos, 
  createTodo, 
  updateTodo, 
  deleteTodo 
} from '../controllers/todo.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = express.Router();

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
    .isIn(['todo', 'done', 'archived', 'snoozed'])
    .withMessage('Invalid status')
];

// Routes
router.get('/', getTodos);
router.post('/', createTodoValidation, validate, createTodo);
router.patch('/:id', updateTodoValidation, validate, updateTodo);
router.delete('/:id', deleteTodo);

export default router;
