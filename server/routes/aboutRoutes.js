const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getAbout,
    updateAbout
} = require('../controllers/aboutController');

// Public route
router.get('/', getAbout);

// Protected admin route
router.put('/', protect, updateAbout);

module.exports = router;
