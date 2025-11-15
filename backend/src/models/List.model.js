import mongoose from 'mongoose';

const CollaboratorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['editor', 'viewer'],
    default: 'editor'
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const ListSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'List name is required'],
    trim: true,
    maxlength: [100, 'List name cannot exceed 100 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  collaborators: [CollaboratorSchema],
  isPrivate: {
    type: Boolean,
    default: true
  },
  color: {
    type: String,
    default: '#3B82F6', // Tailwind blue-500
    match: [/^#[0-9A-F]{6}$/i, 'Color must be a valid hex code']
  },
  icon: {
    type: String,
    default: '📝'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient owner queries
ListSchema.index({ owner: 1, createdAt: -1 });

// Method to check if user has access to list
ListSchema.methods.hasAccess = function(userId) {
  if (this.owner.toString() === userId.toString()) return true;
  return this.collaborators.some(collab => 
    collab.userId.toString() === userId.toString()
  );
};

// Method to check if user can edit
ListSchema.methods.canEdit = function(userId) {
  if (this.owner.toString() === userId.toString()) return true;
  const collaborator = this.collaborators.find(collab => 
    collab.userId.toString() === userId.toString()
  );
  return collaborator && collaborator.role === 'editor';
};

// Virtual for todo count (requires population)
ListSchema.virtual('todoCount', {
  ref: 'Todo',
  localField: '_id',
  foreignField: 'listId',
  count: true
});

ListSchema.set('toJSON', { virtuals: true });
ListSchema.set('toObject', { virtuals: true });

export default mongoose.model('List', ListSchema);
