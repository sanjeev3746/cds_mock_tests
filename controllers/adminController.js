const multer = require('multer');
const Test = require('../models/Test');
const { extractQuestionsFromPDF, categorizeQuestions } = require('../utils/pdfParser');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
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

      // Parse PDF and extract questions
      const result = await extractQuestionsFromPDF(req.file.buffer);

      if (!result.success) {
        return res.status(400).json({
          status: 'error',
          message: 'Failed to parse PDF',
          error: result.error
        });
      }

      res.json({
        status: 'success',
        message: `Extracted ${result.totalQuestions} questions from PDF`,
        data: {
          questions: result.questions,
          totalQuestions: result.totalQuestions,
          rawPreview: result.rawText
        }
      });
    } catch (error) {
      console.error('PDF Upload Error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to process PDF',
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

module.exports = exports;
