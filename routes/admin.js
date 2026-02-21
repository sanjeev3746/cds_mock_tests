const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/auth');

// All admin routes require authentication
// In production, add additional admin role check

// @route   POST /api/admin/upload-pdf
// @desc    Upload PDF and extract questions
router.post('/upload-pdf', protect, adminController.uploadPDF);

// @route   POST /api/admin/create-test-from-pdf
// @desc    Create test from extracted questions
router.post('/create-test-from-pdf', protect, adminController.createTestFromPDF);

// @route   GET /api/admin/tests
// @desc    Get all tests (admin view)
router.get('/tests', protect, adminController.getAllTests);

// @route   DELETE /api/admin/tests/:id
// @desc    Delete a test
router.delete('/tests/:id', protect, adminController.deleteTest);

module.exports = router;
