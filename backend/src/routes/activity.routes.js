import express from 'express';
import {
  getActivities,
  getListActivities,
  getActivityStats,
  cleanupActivities
} from '../controllers/activity.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Routes
router.get('/', getActivities);
router.get('/stats', getActivityStats);
router.get('/list/:listId', getListActivities);
router.delete('/cleanup', cleanupActivities);

export default router;
