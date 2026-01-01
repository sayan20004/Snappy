import express from 'express';
import { body } from 'express-validator';
import {
  getLists,
  createList,
  updateList,
  deleteList,
  inviteCollaborator,
  removeCollaborator,
  updateCollaboratorRole
} from '../controllers/list.controller.js';
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
const createListValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('List name is required')
    .isLength({ max: 100 })
    .withMessage('List name cannot exceed 100 characters')
];

const inviteValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email is required'),
  body('role')
    .optional()
    .isIn(['editor', 'viewer'])
    .withMessage('Role must be editor or viewer')
];

// Routes
router.get('/', getLists);
router.post('/', createListValidation, validate, createList);
router.patch('/:id', updateList);
router.delete('/:id', deleteList);
router.post('/:id/invite', inviteValidation, validate, inviteCollaborator);
router.delete('/:id/collaborators/:userId', removeCollaborator);
router.patch('/:id/collaborators/:userId', updateCollaboratorRole);

export default router;
