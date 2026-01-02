import mongoose from 'mongoose';

const SubStepSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  completed: { type: Boolean, default: false },
  order: { type: Number, default: 0 }
}, { _id: true });

const LinkPreviewSchema = new mongoose.Schema({
  url: { type: String, required: true },
  title: { type: String },
  description: { type: String },
  image: { type: String },
  favicon: { type: String }
}, { _id: false });

// Block-based content (like Notion)
const ContentBlockSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['text', 'heading', 'bullet', 'number', 'checkbox', 'code', 'quote'], 
    default: 'text' 
  },
  content: { type: String, default: '' },
  metadata: mongoose.Schema.Types.Mixed, // For extra data (language for code blocks, etc.)
  order: { type: Number, default: 0 }
}, { _id: false });

const TodoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  note: {
    type: String,
    default: '',
    maxlength: [5000, 'Note cannot exceed 5000 characters']
  },
  // NEW: Block-based content for rich editing
  blocks: {
    type: [ContentBlockSchema],
    default: []
  },
  
  // Context Layers
  subSteps: [SubStepSchema],
  links: [LinkPreviewSchema],
  voiceNote: {
    url: String,
    transcript: String,
    duration: Number
  },
  aiSummary: String,
  
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  listId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'List',
    default: null,
    index: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  // NEW: AI Confidence for auto-classification
  aiClassification: {
    confidence: { type: Number, min: 0, max: 1, default: 0 }, // 0-1 confidence score
    suggestedTags: [String],
    suggestedEnergy: { type: String, enum: ['low', 'medium', 'high'] },
    suggestedDuration: Number,
    classifiedAt: Date,
    manual: { type: Boolean, default: false } // User manually set vs AI suggested
  },
  priority: {
    type: Number,
    default: 2,
    min: 0,
    max: 3,
    // 0: low, 1: medium, 2: normal, 3: high
  },
  
  // Temporal Intelligence
  dueAt: {
    type: Date,
    default: null
  },
  bestTimeToComplete: String, // 'morning', 'afternoon', 'evening', 'night'
  estimatedDuration: Number, // in minutes
  snoozeUntil: Date,
  autoSnoozed: { type: Boolean, default: false },
  
  // Smart Filters
  energyLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  effortMinutes: {
    type: Number,
    default: 15,
    min: 1,
    max: 480
  },
  location: {
    type: String,
    enum: ['anywhere', 'home', 'office', 'commute'],
    default: 'anywhere'
  },
  mood: {
    type: String,
    enum: ['creative', 'analytical', 'administrative', 'social'],
    default: 'administrative'
  },
  
  status: {
    type: String,
    enum: ['todo', 'done', 'archived', 'snoozed', 'in-progress'],
    default: 'todo',
    index: true
  },
  completedAt: {
    type: Date,
    default: null
  },
  
  // Focus & Time Tracking
  focusSessions: [{
    startedAt: Date,
    endedAt: Date,
    duration: Number,
    interrupted: Boolean
  }],
  totalFocusTime: { type: Number, default: 0 },
  
  // Version History
  version: { type: Number, default: 1 },
  previousVersions: [{
    version: Number,
    title: String,
    note: String,
    modifiedAt: Date,
    modifiedBy: mongoose.Schema.Types.ObjectId
  }],
  
  // Collaboration
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, maxlength: 2000 },
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    reactions: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      type: { type: String, enum: ['like', 'love', 'check', 'zap'] }
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }],
  reactions: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    emoji: String
  }],
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Smart Inbox Source
  source: {
    type: String,
    enum: ['manual', 'email', 'whatsapp', 'screenshot', 'voice', 'extension'],
    default: 'manual'
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
TodoSchema.index({ owner: 1, status: 1, createdAt: -1 });
TodoSchema.index({ owner: 1, listId: 1 });
TodoSchema.index({ tags: 1 });

// AUTO-CLASSIFY on create (Elon's Loop Optimization)
TodoSchema.pre('save', async function(next) {
  // Only auto-classify on new tasks or when title changes
  if ((this.isNew || this.isModified('title')) && !this.aiClassification?.manual) {
    try {
      // Dynamic import to avoid circular dependencies
      const { autoClassifyTask } = await import('../services/ai.service.js');
      const classification = await autoClassifyTask(this.title);
      
      this.energyLevel = classification.energy;
      this.effortMinutes = classification.duration;
      this.tags = [...new Set([...this.tags, ...classification.tags])]; // Merge tags
      
      this.aiClassification = {
        confidence: classification.confidence || 0.8,
        suggestedTags: classification.tags,
        suggestedEnergy: classification.energy,
        suggestedDuration: classification.duration,
        classifiedAt: new Date(),
        manual: false
      };
    } catch (error) {
      console.error('AI classification failed:', error);
      // Continue without classification - don't block task creation
    }
  }
  
  next();
});

// Automatically set completedAt when status changes to 'done'
TodoSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'done' && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status !== 'done') {
      this.completedAt = null;
    }
  }
  
  // Version history tracking
  if (this.isModified('title') || this.isModified('note')) {
    if (!this.isNew && this.version) {
      this.previousVersions.push({
        version: this.version,
        title: this.title,
        note: this.note,
        modifiedAt: new Date(),
        modifiedBy: this.owner
      });
      this.version += 1;
    }
  }
  
  next();
});

// Virtual for checking if task is overdue
TodoSchema.virtual('isOverdue').get(function() {
  if (!this.dueAt || this.status === 'done') return false;
  return new Date() > this.dueAt;
});

// Ensure virtuals are included in JSON
TodoSchema.set('toJSON', { virtuals: true });
TodoSchema.set('toObject', { virtuals: true });

export default mongoose.model('Todo', TodoSchema);
