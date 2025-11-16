import express from 'express';
import {
  uploadVoiceNote,
  uploadImage,
  uploadGeneralFile,
  uploadMultipleFiles,
  deleteFile
} from '../controllers/upload.controller.js';
import {
  uploadVoice,
  uploadImage as uploadImageMiddleware,
  uploadFile,
  uploadMultiple
} from '../config/upload.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Upload routes
router.post('/voice', uploadVoice, uploadVoiceNote);
router.post('/image', uploadImageMiddleware, uploadImage);
router.post('/file', uploadFile, uploadGeneralFile);
router.post('/multiple', uploadMultiple, uploadMultipleFiles);

// Delete route
router.delete('/:type/:filename', deleteFile);

export default router;
