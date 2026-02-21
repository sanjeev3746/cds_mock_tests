const multer = require('multer');
const Test = require('../models/Test');
const User = require('../models/User');
const Attempt = require('../models/Attempt');
const Result = require('../models/Result');
const { extractQuestionsFromPDF, categorizeQuestions } = require('../utils/pdfParser');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 150 * 1024 * 1024 // 150MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// @desc    Upload and parse PDF
// @route   POST /api/admin/upload-pdf
// @access  Private (Admin only)
exports.uploadPDF = [
  upload.single('pdf'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          status: 'error',
          message: 'No PDF file uploaded'
        });
      }

      console.log(`Processing PDF: ${req.file.originalname}`);
      console.log(`File size: ${(req.file.size / (1024 * 1024)).toFixed(2)} MB`);

      // Warn if file is very large
      if (req.file.size > 50 * 1024 * 1024) {
        console.log('⚠️  Large file detected - processing may take longer');
      }

      // Set a timeout for parsing
      const parseTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('PDF parsing timeout - file may be too large or image-based')), 45000)
      );

      // Parse PDF and extract questions with timeout
      const result = await Promise.race([
        extractQuestionsFromPDF(req.file.buffer),
        parseTimeout
      ]);

      if (!result.success) {
        return res.status(400).json({
          status: 'error',
          message: 'Failed to parse PDF',
          error: result.error
        });
      }

      // Check if PDF is likely image-based
      if (result.rawText.length < 100) {
        console.log('⚠️  Very little text extracted - PDF may be image-based (scanned)');
        return res.json({
          status: 'warning',
          message: 'PDF appears to be image-based (scanned). Only text-based PDFs are supported. Please convert with OCR first.',
          data: {
            questions: result.questions,
            totalQuestions: 0,
            rawPreview: 'No extractable text found - this is likely a scanned/image-based PDF',
            isImageBased: true
          }
        });
      }

      res.json({
        status: 'success',
        message: `Extracted ${result.totalQuestions} questions from PDF`,
        data: {
          questions: result.questions,
          totalQuestions: result.totalQuestions,
          rawPreview: result.rawText,
          isImageBased: false
        }
      });
    } catch (error) {
      console.error('PDF Upload Error:', error);
      
      // Handle specific error types
      if (error.message.includes('timeout')) {
        return res.status(408).json({
          status: 'error',
          message: 'PDF processing timeout. File may be too large or image-based. Try a smaller file or convert with OCR.',
          error: error.message
        });
      }

      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          status: 'error',
          message: 'File too large. Maximum size is 150MB.',
          error: error.message
        });
      }

      res.status(500).json({
        status: 'error',
        message: 'Failed to process PDF. Make sure it\'s a valid text-based PDF.',
        error: error.message
      });
    }
  }
];

// @desc    Create test from extracted questions
// @route   POST /api/admin/create-test-from-pdf
// @access  Private (Admin only)
exports.createTestFromPDF = async (req, res) => {
  try {
    const { title, description, duration, questions, sections } = req.body;

    // Validate
    if (!title || !questions || questions.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Title and questions are required'
      });
    }

    // Structure questions by section
    let testSections;
    
    if (sections && sections.length > 0) {
      // Use provided sections
      testSections = sections;
    } else {
      // Auto-categorize
      const categorized = categorizeQuestions(questions);
      testSections = [
        {
          name: 'English',
          questions: categorized.english.map(q => ({
            questionText: q.questionText,
            options: q.options.map(opt => opt.text),
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || ''
          }))
        },
        {
          name: 'General Knowledge',
          questions: categorized.generalKnowledge.map(q => ({
            questionText: q.questionText,
            options: q.options.map(opt => opt.text),
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || ''
          }))
        },
        {
          name: 'Mathematics',
          questions: categorized.mathematics.map(q => ({
            questionText: q.questionText,
            options: q.options.map(opt => opt.text),
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || ''
          }))
        }
      ].filter(section => section.questions.length > 0);
    }

    // Create test
    const test = await Test.create({
      title,
      description: description || `Auto-generated test with ${questions.length} questions`,
      duration: duration || 120, // Default 2 hours
      totalMarks: questions.length,
      passingMarks: Math.ceil(questions.length * 0.33), // 33% passing
      negativeMarking: true,
      negativeMarks: 0.33,
      sections: testSections,
      isPremium: false,
      isActive: true
    });

    res.status(201).json({
      status: 'success',
      message: 'Test created successfully from PDF',
      data: { test }
    });
  } catch (error) {
    console.error('Create Test Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create test',
      error: error.message
    });
  }
};

// @desc    Get all tests (admin view)
// @route   GET /api/admin/tests
// @access  Private (Admin only)
exports.getAllTests = async (req, res) => {
  try {
    const tests = await Test.find()
      .sort({ createdAt: -1 })
      .select('title description duration totalMarks isActive isPremium attemptsCount createdAt');

    res.json({
      status: 'success',
      data: { 
        tests,
        count: tests.length
      }
    });
  } catch (error) {
    console.error('Get All Tests Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch tests'
    });
  }
};

// @desc    Delete test
// @route   DELETE /api/admin/tests/:id
// @access  Private (Admin only)
exports.deleteTest = async (req, res) => {
  try {
    const test = await Test.findByIdAndDelete(req.params.id);

    if (!test) {
      return res.status(404).json({
        status: 'error',
        message: 'Test not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Test deleted successfully'
    });
  } catch (error) {
    console.error('Delete Test Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete test'
    });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
exports.getDashboardStats = async (req, res) => {
  try {
    // Get counts
    const totalUsers = await User.countDocuments();
    const totalTests = await Test.countDocuments();
    const totalAttempts = await Attempt.countDocuments();
    const totalResults = await Result.countDocuments();

    // Get recent tests
    const recentTests = await Test.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title duration totalMarks attemptsCount createdAt isActive');

    // Get recent attempts with user details
    const recentAttempts = await Attempt.find()
      .populate('user', 'name email')
      .populate('test', 'title')
      .sort({ startedAt: -1 })
      .limit(10);

    // Get top performers (from results)
    const topPerformers = await Result.find()
      .populate('user', 'name email')
      .populate('test', 'title')
      .sort({ 'score.percentage': -1 })
      .limit(10)
      .select('user test score timeMetrics.submittedAt');

    // Calculate stats
    const activeTests = await Test.countDocuments({ isActive: true });
    const premiumUsers = await User.countDocuments({ isPremium: true });
    const completedAttempts = await Attempt.countDocuments({ status: 'completed' });

    res.json({
      status: 'success',
      data: {
        stats: {
          totalUsers,
          totalTests,
          totalAttempts,
          totalResults,
          activeTests,
          premiumUsers,
          completedAttempts
        },
        recentTests,
        recentAttempts,
        topPerformers
      }
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dashboard statistics'
    });
  }
};
