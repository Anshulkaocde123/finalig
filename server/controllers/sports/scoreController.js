const asyncHandler = require('express-async-handler');
const { GoalMatch } = require('../../models/Match');

/**
 * @desc    Create a new goal/point-based match (Football, Basketball, KhoKho, Kabaddi)
 * @route   POST /api/matches/:sport/create
 * @access  Public (for now)
 */
const createMatch = asyncHandler(async (req, res) => {
    const { sport } = req.params;
    const { teamA, teamB, scheduledAt, venue, maxPeriods } = req.body;

    // Validate sport
    const validSports = ['FOOTBALL', 'BASKETBALL', 'KHOKHO', 'KABADDI'];
    const sportUpper = sport.toUpperCase();

    if (!validSports.includes(sportUpper)) {
        res.status(400);
        throw new Error(`Invalid sport for goal-based match: ${sport}`);
    }

    if (!teamA || !teamB) {
        res.status(400);
        throw new Error('Both teamA and teamB are required');
    }

    if (teamA === teamB) {
        res.status(400);
        throw new Error('A team cannot play against itself');
    }

    // Set default periods based on sport
    let defaultPeriods = 2; // 2 halves for most sports
    if (sportUpper === 'BASKETBALL') {
        defaultPeriods = 4; // 4 quarters
    }

    const match = await GoalMatch.create({
        sport: sportUpper,
        teamA,
        teamB,
        scheduledAt,
        venue,
        scoreA: 0,
        scoreB: 0,
        period: 1,
        maxPeriods: maxPeriods || defaultPeriods
    });

    // Populate and emit for real-time
    const populatedMatch = await GoalMatch.findById(match._id)
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
 * @desc    Update goal/point-based match score
 * @route   PUT /api/matches/:sport/update/:id
 * @access  Public (for now)
 */
const updateScore = asyncHandler(async (req, res) => {
    const { matchId, pointsA, pointsB, period, status } = req.body;

    const match = await GoalMatch.findById(matchId);

    if (!match) {
        res.status(404);
        throw new Error('Match not found');
    }

    if (match.status === 'COMPLETED') {
        res.status(400);
        throw new Error('Cannot update a completed match');
    }

    // Update scores
    if (pointsA !== undefined) match.scoreA = pointsA;
    if (pointsB !== undefined) match.scoreB = pointsB;

    // Update period
    if (period !== undefined) {
        if (period > match.maxPeriods) {
            res.status(400);
            throw new Error(`Period cannot exceed ${match.maxPeriods}`);
        }
        match.period = period;
    }

    // Auto-set to LIVE if updating scores
    if (match.status === 'SCHEDULED' && (pointsA !== undefined || pointsB !== undefined)) {
        match.status = 'LIVE';
    }

    // Update status if provided (takes priority)
    if (status) {
        match.status = status;
    }

    // Determine winner if match is completed
    if (match.status === 'COMPLETED') {
        if (match.scoreA > match.scoreB) {
            match.winner = match.teamA;
        } else if (match.scoreB > match.scoreA) {
            match.winner = match.teamB;
        }
        // If equal, winner remains null (draw)
    }

    await match.save();

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
        const populatedMatch = await GoalMatch.findById(matchId)
            .populate('teamA', 'name shortCode logo')
            .populate('teamB', 'name shortCode logo');
        io.emit('matchUpdate', populatedMatch);
    }

    res.status(200).json({
        success: true,
        data: match
    });
});

/**
 * @desc    Get goal-based match by ID
 * @route   GET /api/matches/:sport/:id
 * @access  Public
 */
const getMatch = asyncHandler(async (req, res) => {
    const match = await GoalMatch.findById(req.params.id)
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
    updateScore,
    getMatch
};
