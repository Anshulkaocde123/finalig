const express = require('express');
const router = express.Router();
const {
    getHighlights,
    getTodayHighlights,
    getHighlight,
    createHighlight,
    updateHighlight,
    deleteHighlight
} = require('../controllers/highlightController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', getHighlights);
router.get('/today', getTodayHighlights);
router.get('/:id', getHighlight);

// Protected routes (Admin only)
router.post('/', protect, upload.single('image'), createHighlight);
router.put('/:id', protect, upload.single('image'), updateHighlight);
router.delete('/:id', protect, deleteHighlight);

module.exports = router;
