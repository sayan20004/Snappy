import express from 'express';
import {
  exportToJSON,
  exportToCSV,
  importFromJSON,
  importFromCSV
} from '../controllers/export.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Export routes
router.get('/json', exportToJSON);
router.get('/csv', exportToCSV);

// Import routes
router.post('/json', importFromJSON);
router.post('/csv', importFromCSV);

export default router;
