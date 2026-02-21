const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  startedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned'],
    default: 'in-progress'
  },
  currentAnswers: {
    type: Map,
    of: {
      selectedAnswer: Number,
      timeTaken: Number,
      flagged: Boolean
    },
    default: {}
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for quick lookups
attemptSchema.index({ user: 1, test: 1, status: 1 });
attemptSchema.index({ expiresAt: 1 });

// Auto-delete expired attempts (TTL index)
attemptSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Attempt', attemptSchema);
