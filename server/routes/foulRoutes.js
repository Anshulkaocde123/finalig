const express = require('express');
const router = express.Router();
const {
    addFoul,
    getMatchFouls,
    getCardSummary,
    removeFoul,
    getFoulsBySport
} = require('../controllers/foulController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

// Public routes
router.get('/match/:matchId', getMatchFouls);
router.get('/match/:matchId/cards', getCardSummary);
router.get('/sport/:sport', getFoulsBySport);

// Protected routes
router.post('/', protect, addFoul);
router.delete('/:id', protect, removeFoul);

module.exports = router;
