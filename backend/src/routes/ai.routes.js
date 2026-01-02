import express from 'express';
import * as aiController from '../controllers/ai.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Text analysis
router.post('/analyze/text', aiController.analyzeText);

// Image/document analysis
router.post('/analyze/image', aiController.upload.single('image'), aiController.analyzeImage);

// Get AI suggestions
router.get('/suggestions', aiController.getSuggestions);

// INTENTION ENGINE - Generate daily schedule
router.post('/schedule/generate', aiController.generateSchedule);

// Task breakdown
router.post('/task/:taskId/breakdown', aiController.breakdownTask);

// Study plan generation
router.post('/learning/plan', aiController.generateStudyPlan);

// AI command execution
router.post('/command', aiController.executeCommand);

// Draft content for task
router.post('/task/:taskId/draft', aiController.draftTaskContent);

// Analyze task priority
router.post('/task/:taskId/analyze-priority', aiController.analyzeTaskPriority);

// Meeting/lecture summarization
router.post('/meeting/summarize', aiController.summarizeTranscript);

// Create tasks from AI analysis
router.post('/tasks/create', aiController.createTasksFromAI);

// Chat with AI assistant
router.post('/chat', aiController.chatWithAI);

export default router;
