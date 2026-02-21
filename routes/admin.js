const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes require authentication and admin role

// @route   GET /api/admin/dashboard
// @desc    Get dashboard statistics
router.get('/dashboard', protect, adminOnly, adminController.getDashboardStats);

// @route   POST /api/admin/upload-pdf
// @desc    Upload PDF and extract questions
router.post('/upload-pdf', protect, adminOnly, adminController.uploadPDF);

// @route   POST /api/admin/create-test-from-pdf
// @desc    Create test from extracted questions
router.post('/create-test-from-pdf', protect, adminOnly, adminController.createTestFromPDF);

// @route   POST /api/admin/create-test-manual
// @desc    Create test manually without PDF
router.post('/create-test-manual', protect, adminOnly, adminController.createTestManual);

// @route   GET /api/admin/tests
// @desc    Get all tests (admin view)
router.get('/tests', protect, adminOnly, adminController.getAllTests);

// @route   DELETE /api/admin/tests/:id
// @desc    Delete a test
router.delete('/tests/:id', protect, adminOnly, adminController.deleteTest);

module.exports = router;
