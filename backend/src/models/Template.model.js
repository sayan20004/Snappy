import mongoose from 'mongoose';

const TemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Template name is required'],
    trim: true,
    maxlength: [100, 'Template name cannot exceed 100 characters']
  },
  description: {
    type: String,
    default: '',
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  icon: {
    type: String,
    default: '📝'
  },
  template: {
    title: {
      type: String,
      required: true,
      trim: true
    },
    note: String,
    subSteps: [{
      title: String,
      completed: Boolean
    }],
    tags: [String],
    priority: {
      type: Number,
      default: 2,
      min: 0,
      max: 3
    },
    effortMinutes: Number,
    energyLevel: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    location: {
      type: String,
      enum: ['anywhere', 'home', 'office', 'commute']
    },
    mood: {
      type: String,
      enum: ['creative', 'analytical', 'administrative', 'social']
    },
    bestTimeToComplete: String
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    enum: ['work', 'personal', 'study', 'health', 'creative', 'other'],
    default: 'other'
  },
  usageCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
TemplateSchema.index({ owner: 1, createdAt: -1 });
TemplateSchema.index({ isPublic: 1, usageCount: -1 });
TemplateSchema.index({ category: 1 });

export default mongoose.model('Template', TemplateSchema);
