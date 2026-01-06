const asyncHandler = require('express-async-handler');
const { SetMatch } = require('../../models/Match');

/**
 * @desc    Create a new set-based match (Badminton, TT, Volleyball)
 * @route   POST /api/matches/:sport/create
 * @access  Public (for now)
 */
const createMatch = asyncHandler(async (req, res) => {
    const { sport } = req.params;
    const { teamA, teamB, scheduledAt, venue, maxSets } = req.body;

    // Validate sport
    const validSports = ['BADMINTON', 'TABLE_TENNIS', 'VOLLEYBALL'];
    const sportUpper = sport.toUpperCase();

    if (!validSports.includes(sportUpper)) {
        res.status(400);
        throw new Error(`Invalid sport for set-based match: ${sport}`);
    }

    if (!teamA || !teamB) {
        res.status(400);
        throw new Error('Both teamA and teamB are required');
    }

    if (teamA === teamB) {
        res.status(400);
        throw new Error('A team cannot play against itself');
    }

    const match = await SetMatch.create({
        sport: sportUpper,
        teamA,
        teamB,
        scheduledAt,
        venue,
        maxSets: maxSets || 3, // Default best of 3
        scoreA: 0,
        scoreB: 0,
        setDetails: [],
        currentSet: { pointsA: 0, pointsB: 0 }
    });

    // Populate and emit for real-time
    const populatedMatch = await SetMatch.findById(match._id)
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
 * @desc    Update set-based match score
 * @route   PUT /api/matches/:sport/update/:id
 * @access  Public (for now)
 */
const updateScore = asyncHandler(async (req, res) => {
    const { matchId, setsA, setsB, currentSetScore, setResult, status } = req.body;

    console.log('🏸 Set-based score update:', { matchId, setsA, setsB, currentSetScore, setResult, status });

    if (!matchId) {
        res.status(400);
        throw new Error('matchId is required');
    }

    const match = await SetMatch.findById(matchId);

    if (!match) {
        res.status(404);
        throw new Error('Match not found');
    }

    console.log('🏸 Current match state:', {
        scoreA: match.scoreA,
        scoreB: match.scoreB,
        currentSet: match.currentSet,
        status: match.status
    });

    if (match.status === 'COMPLETED') {
        res.status(400);
        throw new Error('Cannot update a completed match');
    }

    // Initialize currentSet if not exists
    if (!match.currentSet) {
        console.log('⚠️ currentSet was undefined, initializing...');
        match.currentSet = { setNumber: 1, pointsA: 0, pointsB: 0 };
    }

    // Update sets won
    if (setsA !== undefined) match.scoreA = setsA;
    if (setsB !== undefined) match.scoreB = setsB;

    // Update current set score
    if (currentSetScore) {
        if (currentSetScore.pointsA !== undefined) {
            if (typeof currentSetScore.pointsA !== 'number' || currentSetScore.pointsA < 0) {
                res.status(400);
                throw new Error('currentSetScore.pointsA must be a non-negative number');
            }
            match.currentSet.pointsA = currentSetScore.pointsA;
        }
        if (currentSetScore.pointsB !== undefined) {
            if (typeof currentSetScore.pointsB !== 'number' || currentSetScore.pointsB < 0) {
                res.status(400);
                throw new Error('currentSetScore.pointsB must be a non-negative number');
            }
            match.currentSet.pointsB = currentSetScore.pointsB;
        }
    }

    // Add completed set result
    if (setResult) {
        // Parse the set result (e.g., "21-15" or from currentSet)
        const setNumber = match.setDetails.length + 1;
        const pointsA = match.currentSet.pointsA;
        const pointsB = match.currentSet.pointsB;
        const winner = pointsA > pointsB ? 'A' : 'B';
        
        match.setDetails.push({
            setNumber,
            pointsA,
            pointsB,
            winner
        });
        
        console.log(`🏸 Set ${setNumber} completed: ${pointsA}-${pointsB}, winner: Team ${winner}`);
        
        // Reset current set scores and increment set number
        match.currentSet = { 
            setNumber: setNumber + 1, 
            pointsA: 0, 
            pointsB: 0 
        };
    }

    // Update status if provided (takes priority over auto-LIVE)
    if (status) {
        match.status = status;
    } else if (match.status === 'SCHEDULED' && (setsA !== undefined || setsB !== undefined || currentSetScore)) {
        // Auto-set to LIVE if updating scores
        match.status = 'LIVE';
    }

    // Auto-complete match logic
    const setsToWin = Math.ceil(match.maxSets / 2);

    if (match.scoreA >= setsToWin || match.scoreB >= setsToWin) {
        match.status = 'COMPLETED';
        match.winner = match.scoreA > match.scoreB ? match.teamA : match.teamB;
    }

    console.log('🏸 Saving match with:', {
        scoreA: match.scoreA,
        scoreB: match.scoreB,
        currentSet: match.currentSet,
        status: match.status
    });

    try {
        await match.save();
        console.log('✅ Set-based match saved successfully');
    } catch (saveError) {
        console.error('❌ Error saving set-based match:', saveError);
        res.status(500);
        throw new Error(`Failed to save match: ${saveError.message}`);
    }

    // Emit real-time update with populated match
    const populatedMatch = await SetMatch.findById(matchId)
        .populate('teamA', 'name shortCode logo')
        .populate('teamB', 'name shortCode logo')
        .populate('winner', 'name shortCode logo');
        
    const io = req.app.get('io');
    if (io) {
        io.emit('matchUpdate', populatedMatch);
    }

    res.status(200).json({
        success: true,
        data: populatedMatch
    });
});

/**
 * @desc    Get set-based match by ID
 * @route   GET /api/matches/:sport/:id
 * @access  Public
 */
const getMatch = asyncHandler(async (req, res) => {
    const match = await SetMatch.findById(req.params.id)
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
