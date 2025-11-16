import express from 'express';
import {
  startFocusSession,
  stopFocusSession,
  getActiveFocusSession,
  getFocusStats,
  getAllFocusSessions
} from '../controllers/focus.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Focus session routes
router.post('/:id/start', startFocusSession);
router.post('/:id/stop', stopFocusSession);
router.get('/:id/active', getActiveFocusSession);

// Statistics routes
router.get('/stats', getFocusStats);
router.get('/sessions', getAllFocusSessions);

export default router;
