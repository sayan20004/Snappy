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
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    createdAt: { type: Date, default: Date.now }
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
