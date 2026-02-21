const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized. Please login to access this resource.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found. Please login again.'
      });
    }

    next();
  } catch (error) {
    console.error('Auth Error:', error);
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token. Please login again.'
    });
  }
};

// Middleware to check if user is premium
exports.premiumOnly = (req, res, next) => {
  if (!req.user.isPremium) {
    return res.status(403).json({
      status: 'error',
      message: 'This feature is available for premium members only.'
    });
  }

  // Check if premium has expired
  if (req.user.premiumExpiresAt && req.user.premiumExpiresAt < new Date()) {
    req.user.isPremium = false;
    req.user.save();
    
    return res.status(403).json({
      status: 'error',
      message: 'Your premium membership has expired. Please renew to continue.'
    });
  }

  next();
};

// Middleware to check if user is admin
exports.adminOnly = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};
