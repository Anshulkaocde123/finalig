const express = require('express');
const router = express.Router();
const {
    createPlayer,
    getPlayers,
    getPlayersByDepartment,
    getPlayerById,
    updatePlayer,
    updatePlayerStats,
    getPlayerLeaderboard,
    bulkCreatePlayers,
    deletePlayer
} = require('../controllers/playerController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getPlayers);
router.get('/department/:departmentId', getPlayersByDepartment);
router.get('/leaderboard/:sport', getPlayerLeaderboard);
router.get('/:id', getPlayerById);

// Protected routes
router.post('/', protect, createPlayer);
router.post('/bulk', protect, bulkCreatePlayers);
router.put('/:id', protect, updatePlayer);
router.put('/:id/stats', protect, updatePlayerStats);
router.delete('/:id', protect, deletePlayer);

module.exports = router;
