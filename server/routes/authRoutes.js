const express = require('express');
const router = express.Router();
const { login, seedAdmin, googleCallback, registerOAuth, getMe, updateMe, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public authentication routes
router.post('/login', login);
router.post('/seed', seedAdmin);

// Google OAuth
router.post('/google/callback', googleCallback);
router.post('/register-oauth', registerOAuth);

// Protected routes (require authentication)
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.put('/change-password', protect, changePassword);

module.exports = router;
