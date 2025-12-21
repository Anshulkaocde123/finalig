const express = require('express');
const router = express.Router();
const seasonController = require('../controllers/seasonController');
const { protect } = require('../middleware/authMiddleware');

// Public routes - specific routes BEFORE parameterized routes
router.get('/active', seasonController.getActiveSeason);

// Public routes - parameterized
router.get('/:id/stats', seasonController.getSeasonStats);
router.get('/:id', seasonController.getSeason);
router.get('/', seasonController.getSeasons);

// Private routes
router.post('/', protect, seasonController.createSeason);
router.put('/:id', protect, seasonController.updateSeason);
router.post('/:id/archive', protect, seasonController.archiveSeason);

module.exports = router;
