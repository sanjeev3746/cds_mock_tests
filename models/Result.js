const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  sectionIndex: Number,
  questionIndex: Number,
  selectedAnswer: Number,
  isCorrect: Boolean,
  timeTaken: Number, // in seconds
  marksAwarded: Number
});

const resultSchema = new mongoose.Schema({
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
  answers: [answerSchema],
  score: {
    totalMarks: { type: Number, required: true },
    obtainedMarks: { type: Number, required: true },
    percentage: { type: Number, required: true },
    correctAnswers: { type: Number, default: 0 },
    wrongAnswers: { type: Number, default: 0 },
    skippedQuestions: { type: Number, default: 0 }
  },
  sectionWise: [{
    sectionName: String,
    totalQuestions: Number,
    attempted: Number,
    correct: Number,
    wrong: Number,
    skipped: Number,
    marks: Number,
    accuracy: Number
  }],
  timeMetrics: {
    totalTime: { type: Number, required: true }, // in seconds
    averageTimePerQuestion: Number,
    startedAt: { type: Date, required: true },
    submittedAt: { type: Date, required: true }
  },
  rank: {
    type: Number,
    default: null
  },
  percentile: {
    type: Number,
    default: null
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for leaderboard queries
resultSchema.index({ test: 1, 'score.obtainedMarks': -1, completedAt: 1 });
resultSchema.index({ user: 1, completedAt: -1 });

// Method to calculate overall accuracy
resultSchema.virtual('accuracy').get(function() {
  const attempted = this.score.correctAnswers + this.score.wrongAnswers;
  if (attempted === 0) return 0;
  return ((this.score.correctAnswers / attempted) * 100).toFixed(2);
});

// Method to calculate rank (to be called after saving)
resultSchema.statics.updateRanks = async function(testId) {
  const results = await this.find({ test: testId })
    .sort({ 'score.obtainedMarks': -1, 'timeMetrics.totalTime': 1 })
    .exec();
  
  for (let i = 0; i < results.length; i++) {
    results[i].rank = i + 1;
    
    // Calculate percentile
    const percentile = ((results.length - i) / results.length * 100).toFixed(2);
    results[i].percentile = parseFloat(percentile);
    
    await results[i].save();
  }
};

module.exports = mongoose.model('Result', resultSchema);
