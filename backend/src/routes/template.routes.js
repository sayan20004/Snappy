import express from 'express';
import { body } from 'express-validator';
import {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  useTemplate,
  getPopularTemplates
} from '../controllers/template.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Validation rules
const createTemplateValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Template name is required')
    .isLength({ max: 100 })
    .withMessage('Template name cannot exceed 100 characters'),
  body('template.title')
    .trim()
    .notEmpty()
    .withMessage('Template title is required')
];

// Routes
router.get('/popular', getPopularTemplates);
router.get('/', getTemplates);
router.get('/:id', getTemplate);
router.post('/', createTemplateValidation, validate, createTemplate);
router.patch('/:id', updateTemplate);
router.delete('/:id', deleteTemplate);
router.post('/:id/use', useTemplate);

export default router;
