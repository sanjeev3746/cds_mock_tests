const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');
const { protect, premiumOnly } = require('../middleware/auth');

// @route   GET /api/tests
// @desc    Get all available tests
// @access  Private
router.get('/', protect, testController.getAllTests);

// @route   GET /api/tests/:id
// @desc    Get test by ID (without answers)
// @access  Private
router.get('/:id', protect, testController.getTestById);

// @route   POST /api/tests/:id/start
// @desc    Start a test attempt
// @access  Private
router.post('/:id/start', protect, testController.startTest);

// @route   GET /api/tests/attempt/:attemptId
// @desc    Get current attempt status
// @access  Private
router.get('/attempt/:attemptId', protect, testController.getAttempt);

// @route   PUT /api/tests/attempt/:attemptId/answer
// @desc    Save answer for a question
// @access  Private
router.put('/attempt/:attemptId/answer', protect, testController.saveAnswer);

// @route   POST /api/tests/attempt/:attemptId/submit
// @desc    Submit test
// @access  Private
router.post('/attempt/:attemptId/submit', protect, testController.submitTest);

// @route   POST /api/tests/create
// @desc    Create a new test (Admin only - for now open)
// @access  Private
router.post('/create', protect, testController.createTest);

module.exports = router;
