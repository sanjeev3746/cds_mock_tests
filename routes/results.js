const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');
const { protect, premiumOnly } = require('../middleware/auth');

// @route   GET /api/results
// @desc    Get user's all results
// @access  Private
router.get('/', protect, resultController.getUserResults);

// @route   GET /api/results/:id
// @desc    Get result by ID
// @access  Private
router.get('/:id', protect, resultController.getResultById);

// @route   GET /api/results/test/:testId
// @desc    Get all results for a specific test
// @access  Private
router.get('/test/:testId', protect, resultController.getResultsByTest);

// @route   GET /api/results/:id/analysis
// @desc    Get detailed analysis (premium feature)
// @access  Private + Premium
router.get('/:id/analysis', protect, premiumOnly, resultController.getDetailedAnalysis);

module.exports = router;
