const multer = require('multer');
const pdfParse = require('pdf-parse');
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

      // Check if file is too large for free tier memory (practical limit)
      if (req.file.size > 30 * 1024 * 1024) {
        return res.status(413).json({
          status: 'error',
          message: 'File too large for processing. Please use a file under 30MB. For larger files, split the PDF into smaller parts or compress it first.',
          fileSizeMB: (req.file.size / (1024 * 1024)).toFixed(2)
        });
      }

      // Quick check: Try to parse just first page to see if it's text-based
      let quickCheck;
      try {
        quickCheck = await pdfParse(req.file.buffer, { max: 1 }); // Just first page
        console.log(`Quick check - First page text length: ${quickCheck.text.length}`);
        
        if (quickCheck.text.length < 50) {
          console.log('⚠️  Very little text on first page - PDF is likely image-based');
          return res.json({
            status: 'warning',
            message: 'This PDF appears to be image-based (scanned). Only text-based PDFs are supported. Please:\n1. Convert with OCR at ilovepdf.com/ocr-pdf\n2. Or use a text-based PDF where you can select/highlight text',
            data: {
              questions: [],
              totalQuestions: 0,
              rawPreview: 'Image-based PDF detected - no selectable text found',
              isImageBased: true
            }
          });
        }
      } catch (quickError) {
        console.log('Quick check failed:', quickError.message);
      }

      // Parse PDF and extract questions with timeout
      console.log('Starting full PDF parse...');
      const parseTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('PDF parsing timeout')), 30000) // 30 seconds
      );

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
          message: 'PDF processing timeout. Try a smaller file or convert with OCR first.',
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

// @desc    Create test manually
// @route   POST /api/admin/create-test-manual
// @access  Private (Admin only)
exports.createTestManual = async (req, res) => {
  try {
    const { title, description, duration, negativeMarking, isPremium, sections } = req.body;

    console.log('📝 Manual Test Creation Request:', {
      title,
      duration,
      sectionsCount: sections?.length,
      negativeMarking
    });

    // Validate
    if (!title || !sections || sections.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Title and at least one section with questions are required'
      });
    }

    // Count total questions and validate sections
    let totalQuestions = 0;
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      console.log(`Section ${i + 1}: ${section.name} - ${section.questions?.length || 0} questions`);
      
      if (!section.questions || section.questions.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: `Section "${section.name}" has no questions`
        });
      }

      // Validate each question
      for (let j = 0; j < section.questions.length; j++) {
        const q = section.questions[j];
        if (!q.question || !q.options || q.options.length < 2) {
          return res.status(400).json({
            status: 'error',
            message: `Question ${j + 1} in section "${section.name}" is invalid`
          });
        }
        if (q.correctAnswer < 0 || q.correctAnswer > 3) {
          return res.status(400).json({
            status: 'error',
            message: `Question ${j + 1} in section "${section.name}" has invalid correct answer: ${q.correctAnswer}`
          });
        }
      }

      totalQuestions += section.questions.length;
    }

    if (totalQuestions === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'At least one question is required'
      });
    }

    // Create test
    const testData = {
      title,
      description: description || `Manual test with ${totalQuestions} questions`,
      duration: duration || 120,
      totalMarks: totalQuestions,
      negativeMarking: negativeMarking || { enabled: true, deduction: 0.33 },
      sections,
      isPremium: isPremium || false,
      isActive: true
    };

    console.log('Creating test with data:', JSON.stringify(testData, null, 2));

    const test = await Test.create(testData);

    console.log(`✅ Manual test created: ${test.title} with ${totalQuestions} questions`);

    res.status(201).json({
      status: 'success',
      message: 'Test created successfully',
      data: { test }
    });
  } catch (error) {
    console.error('Create Manual Test Error:', error);
    console.error('Error details:', error.message);
    if (error.errors) {
      console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
    }
    res.status(500).json({
      status: 'error',
      message: 'Failed to create test',
      error: error.message,
      details: error.errors ? Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      })) : []
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
