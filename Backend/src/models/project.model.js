const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    minlength: [3, 'Project name must be at least 3 characters'],
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  deadline: {
    type: Date,
    required: [true, 'Deadline is required'],
    validate: {
      validator: function(v) {
        // Allow past dates for demo purposes (seeded data might have past dates)
        return v instanceof Date && !isNaN(v);
      },
      message: 'Please provide a valid deadline date'
    }
  },
  reliabilityScore: {
    type: Number,
    default: 100,
    min: [0, 'Reliability score cannot be less than 0'],
    max: [100, 'Reliability score cannot exceed 100']
  },
  healthMetrics: {
    blockerFrequency: {
      type: Number,
      default: 0,
      min: 0,
      max: 1
    },
    stagnationRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 1
    },
    overloadRatio: {
      type: Number,
      default: 0,
      min: 0,
      max: 1
    },
    velocityVariance: {
      type: Number,
      default: 0,
      min: 0,
      max: 1
    }
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

// Virtual field for days remaining
projectSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const diff = this.deadline - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Virtual field for overdue status
projectSchema.virtual('isOverdue').get(function() {
  return this.deadline < new Date();
});

// Ensure virtuals are included in JSON
projectSchema.set('toJSON', { virtuals: true });
projectSchema.set('toObject', { virtuals: true });

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
