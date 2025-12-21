const express = require('express');
const router = express.Router();
const scoringPresetController = require('../controllers/scoringPresetController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', scoringPresetController.getScoringPresets);
router.get('/:id', scoringPresetController.getScoringPreset);
router.get('/sport/:sport/default', scoringPresetController.getDefaultPreset);

// Private routes
router.post('/', protect, scoringPresetController.createScoringPreset);
router.put('/:id', protect, scoringPresetController.updateScoringPreset);
router.delete('/:id', protect, scoringPresetController.deleteScoringPreset);
router.post('/:id/duplicate', protect, scoringPresetController.duplicateScoringPreset);

module.exports = router;
