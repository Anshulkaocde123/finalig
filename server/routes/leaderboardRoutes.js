const express = require('express');
const router = express.Router();
const { 
    awardPoints, 
    getStandings, 
    resetLeaderboard, 
    undoLastAward, 
    clearDepartmentPoints 
} = require('../controllers/leaderboardController');
const { protect } = require('../middleware/authMiddleware');

router.post('/award', protect, awardPoints);
router.get('/', getStandings);
router.post('/reset', protect, resetLeaderboard);
router.post('/undo-last', protect, undoLastAward);
router.delete('/department/:deptId', protect, clearDepartmentPoints);

module.exports = router;
