const express = require('express');
const router = express.Router();
const { login, seedAdmin, googleCallback, registerOAuth } = require('../controllers/authController');

// Local authentication
router.post('/login', login);
router.post('/seed', seedAdmin);

// Google OAuth
router.post('/google/callback', googleCallback);
router.post('/register-oauth', registerOAuth);

module.exports = router;
