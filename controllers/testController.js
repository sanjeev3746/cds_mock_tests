const Test = require('../models/Test');
const Attempt = require('../models/Attempt');
const Result = require('../models/Result');
const User = require('../models/User');
const { calculateScore } = require('../utils/helpers');

// @desc    Get all tests
exports.getAllTests = async (req, res) => {
  try {
    const { type, category } = req.query;
    
    const query = { isActive: true };
    if (type) query.type = type;
    if (category) query.category = category;

    // Free users can only see non-premium tests
    if (!req.user.isPremium) {
      query.isPremium = false;
    }

    const tests = await Test.find(query)
      .select('-sections.questions.correctAnswer -sections.questions.explanation')
      .sort({ createdAt: -1 });

    res.json({
      status: 'success',
      count: tests.length,
      data: { tests }
    });
  } catch (error) {
    console.error('Get Tests Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch tests'
    });
  }
};

// @desc    Get test by ID
exports.getTestById = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id)
      .select('-sections.questions.correctAnswer -sections.questions.explanation');

    if (!test) {
      return res.status(404).json({
        status: 'error',
        message: 'Test not found'
      });
    }

    // Check if test is premium and user is not premium
    if (test.isPremium && !req.user.isPremium) {
      return res.status(403).json({
        status: 'error',
        message: 'This is a premium test. Please upgrade to access.'
      });
    }

    res.json({
      status: 'success',
      data: { test }
    });
  } catch (error) {
    console.error('Get Test Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch test'
    });
  }
};

// @desc    Start test
exports.startTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({
        status: 'error',
        message: 'Test not found'
      });
    }

    // Check if test is premium
    if (test.isPremium && !req.user.isPremium) {
      return res.status(403).json({
        status: 'error',
        message: 'This is a premium test'
      });
    }

    // Check if free user can take test (1 per week)
    if (!req.user.isPremium && !req.user.canTakeTest()) {
      return res.status(403).json({
        status: 'error',
        message: 'Free users can take only 1 test per week. Upgrade to premium for unlimited tests.'
      });
    }

    // Check for existing in-progress attempt
    const existingAttempt = await Attempt.findOne({
      user: req.user._id,
      test: test._id,
      status: 'in-progress'
    });

    if (existingAttempt) {
      return res.json({
        status: 'success',
        message: 'Resuming existing attempt',
        data: { attempt: existingAttempt }
      });
    }

    // Create new attempt
    const expiresAt = new Date(Date.now() + test.duration * 60 * 1000);
    
    const attempt = await Attempt.create({
      user: req.user._id,
      test: test._id,
      startedAt: new Date(),
      expiresAt,
      status: 'in-progress'
    });

    // Increment test attempts
    test.attemptsCount += 1;
    await test.save();

    res.json({
      status: 'success',
      message: 'Test started successfully',
      data: { 
        attempt,
        test: {
          id: test._id,
          title: test.title,
          duration: test.duration,
          expiresAt
        }
      }
    });
  } catch (error) {
    console.error('Start Test Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to start test'
    });
  }
};

// @desc    Get attempt
exports.getAttempt = async (req, res) => {
  try {
    const attempt = await Attempt.findById(req.params.attemptId)
      .populate('test', '-sections.questions.correctAnswer -sections.questions.explanation');

    if (!attempt) {
      return res.status(404).json({
        status: 'error',
        message: 'Attempt not found'
      });
    }

    // Check ownership
    if (attempt.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized'
      });
    }

    // Check if expired
    if (new Date() > attempt.expiresAt && attempt.status === 'in-progress') {
      attempt.status = 'abandoned';
      await attempt.save();
      
      return res.status(400).json({
        status: 'error',
        message: 'Test has expired'
      });
    }

    res.json({
      status: 'success',
      data: { attempt }
    });
  } catch (error) {
    console.error('Get Attempt Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch attempt'
    });
  }
};

// @desc    Save answer
exports.saveAnswer = async (req, res) => {
  try {
    const { sectionIndex, questionIndex, selectedAnswer, timeTaken, flagged } = req.body;

    const attempt = await Attempt.findById(req.params.attemptId);

    if (!attempt) {
      return res.status(404).json({
        status: 'error',
        message: 'Attempt not found'
      });
    }

    // Check ownership
    if (attempt.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized'
      });
    }

    // Check if expired
    if (new Date() > attempt.expiresAt) {
      return res.status(400).json({
        status: 'error',
        message: 'Test has expired'
      });
    }

    // Save answer
    const answerKey = `${sectionIndex}-${questionIndex}`;
    attempt.currentAnswers.set(answerKey, {
      selectedAnswer,
      timeTaken: timeTaken || 0,
      flagged: flagged || false
    });

    attempt.lastActivity = new Date();
    await attempt.save();

    res.json({
      status: 'success',
      message: 'Answer saved'
    });
  } catch (error) {
    console.error('Save Answer Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to save answer'
    });
  }
};

// @desc    Submit test
exports.submitTest = async (req, res) => {
  try {
    const attempt = await Attempt.findById(req.params.attemptId).populate('test');

    if (!attempt) {
      return res.status(404).json({
        status: 'error',
        message: 'Attempt not found'
      });
    }

    // Check ownership
    if (attempt.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized'
      });
    }

    if (attempt.status === 'completed') {
      return res.status(400).json({
        status: 'error',
        message: 'Test already submitted'
      });
    }

    const test = attempt.test;
    const submittedAt = new Date();
    const totalTime = Math.floor((submittedAt - attempt.startedAt) / 1000); // in seconds

    // Convert Map to plain object for scoring
    const answersObj = {};
    attempt.currentAnswers.forEach((value, key) => {
      answersObj[key] = value.selectedAnswer;
    });

    // Calculate score
    const { score, sectionWise } = calculateScore(test, answersObj);

    // Prepare detailed answers
    const detailedAnswers = [];
    test.sections.forEach((section, sectionIndex) => {
      section.questions.forEach((question, questionIndex) => {
        const answerKey = `${sectionIndex}-${questionIndex}`;
        const userAnswer = attempt.currentAnswers.get(answerKey);
        
        const selectedAnswer = userAnswer ? userAnswer.selectedAnswer : null;
        const isCorrect = selectedAnswer === question.correctAnswer;
        
        let marksAwarded = 0;
        if (selectedAnswer !== null && selectedAnswer !== undefined) {
          if (isCorrect) {
            marksAwarded = question.marks;
          } else if (test.negativeMarking.enabled) {
            marksAwarded = -(question.marks * test.negativeMarking.deduction);
          }
        }

        detailedAnswers.push({
          sectionIndex,
          questionIndex,
          selectedAnswer: selectedAnswer !== null ? selectedAnswer : -1,
          isCorrect,
          timeTaken: userAnswer ? userAnswer.timeTaken : 0,
          marksAwarded
        });
      });
    });

    // Create result
    const result = await Result.create({
      user: req.user._id,
      test: test._id,
      answers: detailedAnswers,
      score,
      sectionWise,
      timeMetrics: {
        totalTime,
        averageTimePerQuestion: Math.floor(totalTime / (score.correctAnswers + score.wrongAnswers) || 0),
        startedAt: attempt.startedAt,
        submittedAt
      }
    });

    // Update ranks
    await Result.updateRanks(test._id);

    // Update user stats
    const user = await User.findById(req.user._id);
    user.testsAttempted += 1;
    user.lastTestDate = new Date();
    user.stats.totalTests += 1;
    user.stats.totalTimeSpent += totalTime;
    
    // Update average score
    user.stats.averageScore = ((user.stats.averageScore * (user.stats.totalTests - 1)) + score.obtainedMarks) / user.stats.totalTests;
    
    // Update best score
    if (score.obtainedMarks > user.stats.bestScore) {
      user.stats.bestScore = score.obtainedMarks;
    }
    
    await user.save();

    // Mark attempt as completed
    attempt.status = 'completed';
    await attempt.save();

    res.json({
      status: 'success',
      message: 'Test submitted successfully',
      data: { 
        result: {
          id: result._id,
          score: result.score,
          rank: result.rank,
          percentile: result.percentile
        }
      }
    });
  } catch (error) {
    console.error('Submit Test Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to submit test'
    });
  }
};

// @desc    Create test (for demo/admin)
exports.createTest = async (req, res) => {
  try {
    const test = await Test.create(req.body);

    res.status(201).json({
      status: 'success',
      message: 'Test created successfully',
      data: { test }
    });
  } catch (error) {
    console.error('Create Test Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create test'
    });
  }
};
