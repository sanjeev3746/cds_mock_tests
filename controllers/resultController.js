const Result = require('../models/Result');
const Test = require('../models/Test');

// @desc    Get user's all results
exports.getUserResults = async (req, res) => {
  try {
    const results = await Result.find({ user: req.user._id })
      .populate('test', 'title type category totalMarks duration')
      .sort({ completedAt: -1 });

    res.json({
      status: 'success',
      count: results.length,
      data: { results }
    });
  } catch (error) {
    console.error('Get Results Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch results'
    });
  }
};

// @desc    Get result by ID
exports.getResultById = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('test', 'title type category sections totalMarks duration negativeMarking')
      .populate('user', 'name email');

    if (!result) {
      return res.status(404).json({
        status: 'error',
        message: 'Result not found'
      });
    }

    // Check ownership
    if (result.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized'
      });
    }

    res.json({
      status: 'success',
      data: { result }
    });
  } catch (error) {
    console.error('Get Result Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch result'
    });
  }
};

// @desc    Get results by test
exports.getResultsByTest = async (req, res) => {
  try {
    const results = await Result.find({ 
      user: req.user._id,
      test: req.params.testId 
    })
      .populate('test', 'title type category')
      .sort({ completedAt: -1 });

    res.json({
      status: 'success',
      count: results.length,
      data: { results }
    });
  } catch (error) {
    console.error('Get Results By Test Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch results'
    });
  }
};

// @desc    Get detailed analysis (Premium feature)
exports.getDetailedAnalysis = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate({
        path: 'test',
        select: 'title sections totalMarks duration'
      });

    if (!result) {
      return res.status(404).json({
        status: 'error',
        message: 'Result not found'
      });
    }

    // Check ownership
    if (result.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized'
      });
    }

    // Prepare detailed analysis with correct answers and explanations
    const detailedAnalysis = {
      result: {
        id: result._id,
        score: result.score,
        sectionWise: result.sectionWise,
        timeMetrics: result.timeMetrics,
        rank: result.rank,
        percentile: result.percentile,
        accuracy: result.accuracy
      },
      questionAnalysis: []
    };

    // Get full test with answers for premium users
    const fullTest = await Test.findById(result.test._id);

    fullTest.sections.forEach((section, sectionIndex) => {
      section.questions.forEach((question, questionIndex) => {
        const userAnswer = result.answers.find(
          a => a.sectionIndex === sectionIndex && a.questionIndex === questionIndex
        );

        detailedAnalysis.questionAnalysis.push({
          section: section.name,
          question: question.question,
          options: question.options,
          correctAnswer: question.correctAnswer,
          userAnswer: userAnswer ? userAnswer.selectedAnswer : -1,
          isCorrect: userAnswer ? userAnswer.isCorrect : false,
          explanation: question.explanation,
          marksAwarded: userAnswer ? userAnswer.marksAwarded : 0,
          timeTaken: userAnswer ? userAnswer.timeTaken : 0
        });
      });
    });

    // Performance insights
    const insights = {
      strengths: [],
      weaknesses: [],
      recommendations: []
    };

    // Analyze section performance
    result.sectionWise.forEach(section => {
      const accuracy = parseFloat(section.accuracy);
      
      if (accuracy >= 70) {
        insights.strengths.push(`Strong performance in ${section.sectionName} with ${accuracy}% accuracy`);
      } else if (accuracy < 50) {
        insights.weaknesses.push(`Need improvement in ${section.sectionName} (${accuracy}% accuracy)`);
        insights.recommendations.push(`Focus more on ${section.sectionName} practice`);
      }
    });

    // Time management analysis
    const avgTime = result.timeMetrics.averageTimePerQuestion;
    if (avgTime > 90) {
      insights.recommendations.push('Work on time management - try to solve questions faster');
    }

    // Accuracy analysis
    const overallAccuracy = parseFloat(result.accuracy);
    if (overallAccuracy < 60) {
      insights.recommendations.push('Focus on understanding concepts rather than speed');
    }

    detailedAnalysis.insights = insights;

    res.json({
      status: 'success',
      data: detailedAnalysis
    });
  } catch (error) {
    console.error('Get Analysis Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch analysis'
    });
  }
};
