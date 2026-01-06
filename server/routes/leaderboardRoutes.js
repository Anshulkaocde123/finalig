const express = require('express');
const router = express.Router();
const { 
    awardPoints, 
    getStandings,
    getDetailedStandings,
    awardPointsFromMatch,
    resetLeaderboard, 
    undoLastAward, 
    clearDepartmentPoints,
    getDepartmentHistory
} = require('../controllers/leaderboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getStandings);
router.get('/detailed', getDetailedStandings);
router.get('/department/:deptId/history', getDepartmentHistory);

// Protected routes
router.post('/award', protect, awardPoints);
router.post('/award-from-match', protect, awardPointsFromMatch);
router.post('/undo-last', protect, undoLastAward);
router.delete('/department/:deptId', protect, authorize('super_admin', 'admin'), clearDepartmentPoints);

// Super admin only
router.post('/reset', protect, authorize('super_admin'), resetLeaderboard);

module.exports = router;
