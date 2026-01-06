const express = require('express');
const router = express.Router();
const scoringPresetController = require('../controllers/scoringPresetController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/', scoringPresetController.getScoringPresets);
router.get('/:id', scoringPresetController.getScoringPreset);
router.get('/sport/:sport/default', scoringPresetController.getDefaultPreset);

// Calculate points (public - just calculation, no DB changes)
router.post('/calculate', scoringPresetController.calculateMatchPoints);

// Private routes
router.post('/', protect, scoringPresetController.createScoringPreset);
router.put('/:id', protect, scoringPresetController.updateScoringPreset);
router.delete('/:id', protect, scoringPresetController.deleteScoringPreset);
router.post('/:id/duplicate', protect, scoringPresetController.duplicateScoringPreset);

// Seed defaults (admin only)
router.post('/seed-defaults', protect, authorize('super_admin', 'admin'), scoringPresetController.seedDefaultPresets);

module.exports = router;
