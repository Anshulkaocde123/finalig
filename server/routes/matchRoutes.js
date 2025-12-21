const express = require('express');
const router = express.Router();

// Import controllers
const cricketController = require('../controllers/sports/cricketController');
const setController = require('../controllers/sports/setController');
const scoreController = require('../controllers/sports/scoreController');
const simpleController = require('../controllers/sports/simpleController');

// Import Match model for generic queries
const matchController = require('../controllers/matchController');
const { Match } = require('../models/Match');
const asyncHandler = require('express-async-handler');

// Sport to Controller mapping
const SPORT_CONTROLLER_MAP = {
    'cricket': { controller: cricketController, type: 'cricket' },
    'badminton': { controller: setController, type: 'set' },
    'table_tennis': { controller: setController, type: 'set' },
    'volleyball': { controller: setController, type: 'set' },
    'football': { controller: scoreController, type: 'goal' },
    'basketball': { controller: scoreController, type: 'goal' },
    'khokho': { controller: scoreController, type: 'goal' },
    'kabaddi': { controller: scoreController, type: 'goal' },
    'chess': { controller: simpleController, type: 'simple' }
};

// Middleware to validate sport and attach controller
const validateSport = (req, res, next) => {
    const sport = req.params.sport.toLowerCase();
    const sportConfig = SPORT_CONTROLLER_MAP[sport];

    if (!sportConfig) {
        res.status(400);
        throw new Error(`Invalid sport: ${sport}. Valid sports are: ${Object.keys(SPORT_CONTROLLER_MAP).join(', ')}`);
    }

    req.sportConfig = sportConfig;
    next();
};

// Import auth middleware
const { protect } = require('../middleware/authMiddleware');

// ============================================
// DYNAMIC ROUTES
// ============================================

/**
 * @route   POST /api/matches/:sport/create
 * @desc    Create a new match for the specified sport
 */
router.post('/:sport/create', protect, validateSport, (req, res, next) => {
    req.sportConfig.controller.createMatch(req, res, next);
});

/**
 * @route   PUT /api/matches/:sport/update
 * @desc    Update match score/result for the specified sport
 */
router.put('/:sport/update', protect, validateSport, (req, res, next) => {
    const { controller, type } = req.sportConfig;

    // Use appropriate update method based on sport type
    if (type === 'simple') {
        controller.updateResult(req, res, next);
    } else {
        controller.updateScore(req, res, next);
    }
});

/**
 * @route   GET /api/matches/:sport/:id
 * @desc    Get match details for the specified sport
 */
router.get('/:sport/:id', validateSport, (req, res, next) => {
    req.sportConfig.controller.getMatch(req, res, next);
});

// ============================================
// GENERIC ROUTES
// ============================================

/**
 * @route   GET /api/matches
 * @desc    Get all matches with optional filters
 */
router.get('/', matchController.getAllMatches);

/**
 * @route   GET /api/matches/live
 * @desc    Get all live matches
 */
router.get('/status/live', asyncHandler(async (req, res) => {
    const matches = await Match.find({ status: 'LIVE' })
        .populate('teamA', 'name shortCode')
        .populate('teamB', 'name shortCode')
        .sort({ updatedAt: -1 });

    res.status(200).json({
        success: true,
        count: matches.length,
        data: matches
    });
}));

/**
 * @route   DELETE /api/matches/:id
 * @desc    Delete a match
 */
router.delete('/:id', protect, matchController.deleteMatch);

module.exports = router;
