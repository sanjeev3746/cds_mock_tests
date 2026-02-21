const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');
const { protect } = require('../middleware/auth');

// @route   GET /api/leaderboard/:testId
// @desc    Get leaderboard for a specific test
// @access  Private
router.get('/:testId', protect, leaderboardController.getLeaderboard);

// @route   GET /api/leaderboard/global/top
// @desc    Get global top performers
// @access  Private
router.get('/global/top', protect, leaderboardController.getGlobalLeaderboard);

module.exports = router;
