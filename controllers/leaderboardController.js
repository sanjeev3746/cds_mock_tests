const Result = require('../models/Result');
const User = require('../models/User');

// @desc    Get leaderboard for a test
exports.getLeaderboard = async (req, res) => {
  try {
    const { testId } = req.params;
    const { limit = 50, page = 1 } = req.query;

    const skip = (page - 1) * limit;

    const results = await Result.find({ test: testId })
      .populate('user', 'name')
      .select('user score timeMetrics rank percentile')
      .sort({ rank: 1 })
      .limit(parseInt(limit))
      .skip(skip);

    // Find current user's rank
    const userResult = await Result.findOne({ 
      test: testId, 
      user: req.user._id 
    }).select('rank percentile score');

    // Get total participants
    const totalParticipants = await Result.countDocuments({ test: testId });

    res.json({
      status: 'success',
      data: {
        leaderboard: results.map((r, index) => ({
          rank: r.rank,
          name: r.user.name,
          score: r.score.obtainedMarks,
          totalMarks: r.score.totalMarks,
          percentage: r.score.percentage,
          accuracy: ((r.score.correctAnswers / (r.score.correctAnswers + r.score.wrongAnswers)) * 100).toFixed(2),
          timeSpent: r.timeMetrics.totalTime,
          percentile: r.percentile
        })),
        userRank: userResult ? {
          rank: userResult.rank,
          percentile: userResult.percentile,
          score: userResult.score.obtainedMarks
        } : null,
        totalParticipants,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalParticipants / limit)
      }
    });
  } catch (error) {
    console.error('Get Leaderboard Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch leaderboard'
    });
  }
};

// @desc    Get global leaderboard
exports.getGlobalLeaderboard = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    // Get top performers based on average score
    const topPerformers = await User.find()
      .select('name stats')
      .sort({ 'stats.bestScore': -1, 'stats.averageScore': -1 })
      .limit(parseInt(limit));

    // Get current user's global standing
    const allUsers = await User.countDocuments();
    const betterUsers = await User.countDocuments({ 
      'stats.averageScore': { $gt: req.user.stats.averageScore } 
    });
    
    const userGlobalRank = betterUsers + 1;

    res.json({
      status: 'success',
      data: {
        topPerformers: topPerformers.map((user, index) => ({
          rank: index + 1,
          name: user.name,
          bestScore: user.stats.bestScore,
          averageScore: user.stats.averageScore.toFixed(2),
          totalTests: user.stats.totalTests
        })),
        userGlobalRank: {
          rank: userGlobalRank,
          totalUsers: allUsers,
          percentile: (((allUsers - userGlobalRank + 1) / allUsers) * 100).toFixed(2)
        }
      }
    });
  } catch (error) {
    console.error('Get Global Leaderboard Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch global leaderboard'
    });
  }
};
