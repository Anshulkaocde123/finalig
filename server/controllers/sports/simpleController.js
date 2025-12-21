const asyncHandler = require('express-async-handler');
const { SimpleMatch } = require('../../models/Match');

/**
 * @desc    Create a new chess match
 * @route   POST /api/matches/chess/create
 * @access  Public (for now)
 */
const createMatch = asyncHandler(async (req, res) => {
    const { teamA, teamB, scheduledAt, venue } = req.body;

    if (!teamA || !teamB) {
        res.status(400);
        throw new Error('Both teamA and teamB are required');
    }

    if (teamA === teamB) {
        res.status(400);
        throw new Error('A team cannot play against itself');
    }

    const match = await SimpleMatch.create({
        sport: 'CHESS',
        teamA,
        teamB,
        scheduledAt,
        venue,
        resultType: null
    });

    // Populate and emit for real-time
    const populatedMatch = await SimpleMatch.findById(match._id)
        .populate('teamA', 'name shortCode logo')
        .populate('teamB', 'name shortCode logo');

    const io = req.app.get('io');
    if (io) {
        io.emit('matchCreated', populatedMatch);
    }

    res.status(201).json({
        success: true,
        data: populatedMatch
    });
});

/**
 * @desc    Update chess match result
 * @route   PUT /api/matches/chess/update/:id
 * @access  Public (for now)
 */
const updateResult = asyncHandler(async (req, res) => {
    const { matchId, winnerId, resultType, status } = req.body;

    const match = await SimpleMatch.findById(matchId);

    if (!match) {
        res.status(404);
        throw new Error('Match not found');
    }

    if (match.status === 'COMPLETED') {
        res.status(400);
        throw new Error('Cannot update a completed match');
    }

    // Valid result types
    const validResultTypes = ['CHECKMATE', 'RESIGNATION', 'STALEMATE', 'TIME_OUT', 'DRAW'];

    if (resultType && !validResultTypes.includes(resultType)) {
        res.status(400);
        throw new Error(`Invalid result type. Must be one of: ${validResultTypes.join(', ')}`);
    }

    // Set result type
    if (resultType) {
        match.resultType = resultType;
    }

    // Set winner if provided (not for DRAW or STALEMATE)
    if (winnerId) {
        // Validate winner is one of the teams
        if (winnerId !== match.teamA.toString() && winnerId !== match.teamB.toString()) {
            res.status(400);
            throw new Error('Winner must be one of the participating teams');
        }
        match.winner = winnerId;
    }

    // Handle draw/stalemate - no winner
    if (resultType === 'DRAW' || resultType === 'STALEMATE') {
        match.winner = null;
    }

    // Update status
    if (status) {
        match.status = status;
    }

    // Auto-complete when result is set
    if (resultType) {
        match.status = 'COMPLETED';
    }

    await match.save();

    res.status(200).json({
        success: true,
        data: match
    });
});

/**
 * @desc    Get chess match by ID
 * @route   GET /api/matches/chess/:id
 * @access  Public
 */
const getMatch = asyncHandler(async (req, res) => {
    const match = await SimpleMatch.findById(req.params.id)
        .populate('teamA', 'name abbreviation')
        .populate('teamB', 'name abbreviation')
        .populate('winner', 'name abbreviation');

    if (!match) {
        res.status(404);
        throw new Error('Match not found');
    }

    res.status(200).json({
        success: true,
        data: match
    });
});

module.exports = {
    createMatch,
    updateResult,
    getMatch
};
