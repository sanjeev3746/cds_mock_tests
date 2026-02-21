const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  },
  explanation: {
    type: String,
    trim: true
  },
  marks: {
    type: Number,
    default: 1
  }
});

const testSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['full-length', 'sectional', 'topic-wise'],
    default: 'full-length'
  },
  category: {
    type: String,
    enum: ['IMA/INA/AFA', 'OTA'],
    default: 'IMA/INA/AFA'
  },
  sections: [{
    name: {
      type: String,
      required: true,
      enum: ['English', 'GK', 'Maths']
    },
    questions: [questionSchema],
    totalMarks: {
      type: Number,
      required: true
    },
    duration: {
      type: Number, // in minutes
      required: true
    }
  }],
  totalMarks: {
    type: Number,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true,
    default: 120
  },
  negativeMarking: {
    enabled: {
      type: Boolean,
      default: true
    },
    deduction: {
      type: Number,
      default: 0.33 // 1/3 for each wrong answer
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  attemptsCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Method to get total questions
testSchema.virtual('totalQuestions').get(function() {
  return this.sections.reduce((total, section) => total + section.questions.length, 0);
});

module.exports = mongoose.model('Test', testSchema);
