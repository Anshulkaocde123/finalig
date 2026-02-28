const express = require('express');
const router = express.Router();
const { 
    createMatch, 
    getAllMatches, 
    getMatch, 
    updateMatch, 
    deleteMatch 
} = require('../controllers/matchController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getAllMatches);
router.get('/:id', getMatch);

// Protected routes (Admin only)
router.post('/', protect, createMatch);
router.put('/:id', protect, updateMatch);
router.delete('/:id', protect, deleteMatch);

module.exports = router;
