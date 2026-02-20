const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project ID is required']
  },
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    minlength: [3, 'Task title must be at least 3 characters'],
    maxlength: [200, 'Task title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  status: {
    type: String,
    required: [true, 'Task status is required'],
    enum: {
      values: ['todo', 'inprogress', 'blocked', 'done'],
      message: 'Status must be one of: todo, inprogress, blocked, done'
    },
    default: 'todo'
  },
  assigneeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Assignee is required']
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  estimatedHours: {
    type: Number,
    min: [0, 'Estimated hours cannot be negative'],
    max: [1000, 'Estimated hours cannot exceed 1000']
  },
  actualHours: {
    type: Number,
    min: [0, 'Actual hours cannot be negative'],
    max: [1000, 'Actual hours cannot exceed 1000'],
    default: 0
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
taskSchema.index({ projectId: 1, status: 1 });
taskSchema.index({ assigneeId: 1 });
taskSchema.index({ status: 1 });

// Middleware to trigger reliability score recalculation
taskSchema.post('save', async function() {
  try {
    const reliabilityService = require('../services/reliability.service');
    await reliabilityService.recalculateOnTaskChange(this._id);
  } catch (error) {
    console.error(`Error recalculating reliability for task ${this._id}:`, error.message);
  }
});

taskSchema.post('findOneAndUpdate', async function(doc) {
  if (doc) {
    try {
      const reliabilityService = require('../services/reliability.service');
      await reliabilityService.recalculateOnTaskChange(doc._id);
    } catch (error) {
      console.error(`Error recalculating reliability for task ${doc._id}:`, error.message);
    }
  }
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
