import mongoose from 'mongoose';

const ActivitySchema = new mongoose.Schema({
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'create_todo',
      'update_todo',
      'complete_todo',
      'delete_todo',
      'create_list',
      'update_list',
      'delete_list',
      'invite_user'
    ]
  },
  targetType: {
    type: String,
    required: true,
    enum: ['todo', 'list', 'user']
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  payload: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
    expires: 2592000 // Auto-delete after 30 days (TTL index)
  }
}, {
  timestamps: false // We only need createdAt
});

// Compound index for efficient queries
ActivitySchema.index({ targetId: 1, createdAt: -1 });
ActivitySchema.index({ actor: 1, createdAt: -1 });

export default mongoose.model('Activity', ActivitySchema);
