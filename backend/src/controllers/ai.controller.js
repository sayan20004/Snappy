import * as aiService from '../services/ai.service.js';
import Todo from '../models/Todo.model.js';
import User from '../models/User.model.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

// Multer setup for file uploads
const storage = multer.memoryStorage();
export const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'audio/wav', 'audio/mpeg', 'audio/webm'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Extract tasks from text input (JSON-only mode)
export const analyzeText = async (req, res, next) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Force JSON response from AI
    const result = await aiService.extractTasksFromTextJSON(text);
    
    res.json({
      success: true,
      ...result // { title, priority, dueDate, tags, suggestedSubtasks }
    });
  } catch (error) {
    next(error);
  }
};

// Extract tasks from image/screenshot/PDF
export const analyzeImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const tasks = await aiService.extractTasksFromImage(req.file.buffer, req.file.mimetype);
    
    res.json({
      success: true,
      tasks,
      count: tasks.length
    });
  } catch (error) {
    next(error);
  }
};

// Get AI suggestions based on user context
export const getSuggestions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Fetch user's tasks
    const todos = await Todo.find({ 
      user: userId,
      completed: false 
    })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

    const userContext = {
      todos,
      currentTime: new Date().toISOString(),
      userEnergy: req.query.energy || 'medium',
      upcomingEvents: req.query.events ? JSON.parse(req.query.events) : [],
      workload: todos.length > 10 ? 'high' : todos.length > 5 ? 'medium' : 'low'
    };

    const suggestions = await aiService.generateSmartSuggestions(userContext);
    
    res.json({
      success: true,
      suggestions,
      context: {
        taskCount: todos.length,
        workload: userContext.workload
      }
    });
  } catch (error) {
    next(error);
  }
};

// INTENTION ENGINE - Generate intelligent daily schedule
export const generateSchedule = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { workHoursStart = '09:00', workHoursEnd = '17:00', userEnergy = 'medium' } = req.body;
    
    // Fetch user's pending todos
    const todos = await Todo.find({ 
      owner: userId, 
      status: { $in: ['todo', 'in-progress'] }
    })
    .sort({ priority: -1, dueAt: 1 })
    .limit(20)
    .lean();

    const userContext = {
      todos,
      currentTime: new Date().toISOString(),
      userEnergy,
      workHoursStart,
      workHoursEnd,
      breaks: true
    };

    const schedule = await aiService.generateIntentionSchedule(userContext);
    
    res.json({
      success: true,
      ...schedule
    });
  } catch (error) {
    next(error);
  }
};

// Breakdown a task into subtasks
export const breakdownTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;
    
    const task = await Todo.findOne({ _id: taskId, owner: userId });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const subtasks = await aiService.breakdownTask(task.title, task.note);
    
    res.json({
      success: true,
      subtasks,
      originalTask: {
        id: task._id,
        title: task.title
      }
    });
  } catch (error) {
    next(error);
  }
};

// Generate study plan
export const generateStudyPlan = async (req, res, next) => {
  try {
    const { content, deadline, currentKnowledge } = req.body;
    
    if (!content || !deadline) {
      return res.status(400).json({ error: 'Content and deadline are required' });
    }

    const plan = await aiService.generateStudyPlan(content, deadline, currentKnowledge);
    
    res.json({
      success: true,
      plan
    });
  } catch (error) {
    next(error);
  }
};

// Execute AI command (natural language)
export const executeCommand = async (req, res, next) => {
  try {
    const { command } = req.body;
    const userId = req.user.id;
    
    if (!command) {
      return res.status(400).json({ error: 'Command is required' });
    }

    // Get user context
    const todos = await Todo.find({ owner: userId }).lean();
    const user = await User.findById(userId).lean();
    
    const userContext = {
      todos,
      user: {
        name: user.name,
        email: user.email
      }
    };

    const result = await aiService.executeAICommand(command, userContext);
    
    res.json({
      success: true,
      result
    });
  } catch (error) {
    next(error);
  }
};

// Draft content for a task
export const draftTaskContent = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { contentType } = req.body;
    const userId = req.user.id;
    
    const task = await Todo.findOne({ _id: taskId, owner: userId });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const draft = await aiService.draftContent(
      task.title, 
      task.note, 
      contentType || 'general'
    );
    
    res.json({
      success: true,
      draft,
      task: {
        id: task._id,
        title: task.title
      }
    });
  } catch (error) {
    next(error);
  }
};

// Analyze task priority
export const analyzeTaskPriority = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;
    
    const task = await Todo.findOne({ _id: taskId, owner: userId }).lean();
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Get user context for better analysis
    const allTasks = await Todo.find({ owner: userId, completed: false }).lean();
    
    const userContext = {
      totalTasks: allTasks.length,
      urgentTasks: allTasks.filter(t => t.priority === 0).length,
      currentTime: new Date().toISOString()
    };

    const analysis = await aiService.analyzePriority(task, userContext);
    
    res.json({
      success: true,
      analysis,
      currentPriority: task.priority
    });
  } catch (error) {
    next(error);
  }
};

// Summarize meeting/lecture transcript
export const summarizeTranscript = async (req, res, next) => {
  try {
    const { transcript } = req.body;
    
    if (!transcript) {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    const summary = await aiService.summarizeTranscript(transcript);
    
    res.json({
      success: true,
      summary
    });
  } catch (error) {
    next(error);
  }
};

// Create tasks from AI analysis
export const createTasksFromAI = async (req, res, next) => {
  try {
    const { tasks, listId } = req.body;
    const userId = req.user.id;
    
    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ error: 'Tasks array is required' });
    }

    // Create todos from AI-generated tasks
    const createdTasks = await Promise.all(
      tasks.map(task => 
        Todo.create({
          ...task,
          owner: userId,  // Use 'owner' not 'user'
          list: listId || null,
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      )
    );
    
    res.status(201).json({
      success: true,
      tasks: createdTasks,
      count: createdTasks.length
    });
  } catch (error) {
    next(error);
  }
};

// Chat with AI assistant (general conversation)
export const chatWithAI = async (req, res, next) => {
  try {
    const { message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const model = aiService.getGeminiModel();
    const prompt = `You are a productivity AI assistant helping a user manage their tasks.

User message: ${message}
Context: ${context ? JSON.stringify(context) : 'No additional context'}

Provide a helpful, concise response. Be friendly and actionable.`;

    const response = await aiService.generateContent(model, prompt);
    
    res.json({
      success: true,
      response
    });
  } catch (error) {
    next(error);
  }
};
