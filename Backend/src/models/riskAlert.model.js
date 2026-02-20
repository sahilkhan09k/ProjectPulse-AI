const mongoose = require('mongoose');

const riskAlertSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project ID is required'],
    index: true
  },
  type: {
    type: String,
    required: [true, 'Alert type is required'],
    enum: {
      values: ['warning', 'critical'],
      message: 'Type must be either warning or critical'
    }
  },
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  confidence: {
    type: Number,
    required: [true, 'Confidence level is required'],
    min: [0, 'Confidence cannot be less than 0'],
    max: [100, 'Confidence cannot exceed 100']
  },
  recommendedAction: {
    type: String,
    required: [true, 'Recommended action is required'],
    maxlength: [500, 'Recommended action cannot exceed 500 characters']
  },
  resolved: {
    type: Boolean,
    default: false,
    index: true
  },
  resolvedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
riskAlertSchema.index({ projectId: 1, resolved: 1 });

const RiskAlert = mongoose.model('RiskAlert', riskAlertSchema);

module.exports = RiskAlert;
