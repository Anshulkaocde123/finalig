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
    const { matchId, pointsA, pointsB, period, status, toss, timerAction, timerData, penaltyShootout } = req.body;

    if (!matchId) {
        res.status(400);
        throw new Error('matchId is required');
    }

    const match = await GoalMatch.findById(matchId);

    if (!match) {
        res.status(404);
        throw new Error('Match not found');
    }
    
    // Handle penalty shootout update
    if (penaltyShootout !== undefined) {
        match.penaltyShootout = penaltyShootout;
        
        // If shootout is completed, update match status and winner
        if (penaltyShootout.status === 'COMPLETED' && penaltyShootout.winner) {
            match.status = 'COMPLETED';
            match.winner = penaltyShootout.winner === 'A' ? match.teamA : match.teamB;
        }
        
        await match.save();
        
        const populatedMatch = await GoalMatch.findById(matchId)
            .populate('teamA', 'name shortCode logo')
            .populate('teamB', 'name shortCode logo')
            .populate('winner', 'name shortCode logo');

        const io = req.app.get('io');
        if (io) {
            console.log('📡 Emitting matchUpdate (Penalty Shootout):', {
                matchId: populatedMatch._id,
                sport: populatedMatch.sport,
                shootoutStatus: penaltyShootout.status,
                winner: penaltyShootout.winner
            });
            io.emit('matchUpdate', populatedMatch);
        }

        return res.json({
            success: true,
            message: 'Penalty shootout updated',
            data: populatedMatch
        });
    }

    // Handle toss update first
    if (toss !== undefined) {
        if (toss === null) {
            match.toss = { winner: null, decision: null, conductedAt: null };
        } else {
            match.toss = {
                winner: toss.winner,
                decision: toss.decision,
                conductedAt: new Date()
            };
        }
        
        await match.save();
        
        const populatedMatch = await GoalMatch.findById(matchId)
            .populate('teamA', 'name shortCode logo')
            .populate('teamB', 'name shortCode logo');

        const io = req.app.get('io');
        if (io) {            console.log('📡 Emitting matchUpdate (Toss):', {
                matchId: populatedMatch._id,
                sport: populatedMatch.sport,
                tossWinner: match.toss.winner
            });            io.emit('matchUpdate', populatedMatch);
        }

        return res.json({
            success: true,
            message: 'Toss recorded',
            data: populatedMatch
        });
    }

    // Handle timer actions
    if (timerAction && timerData) {
        if (!match.timer) {
            match.timer = { isRunning: false, isPaused: false, elapsedSeconds: 0, addedTime: 0 };
        }
        
        switch (timerAction) {
            case 'start':
                match.timer.isRunning = true;
                match.timer.isPaused = false;
                match.timer.startTime = new Date();
                // Set starting time if provided (for football half management)
                if (timerData.elapsedSeconds !== undefined) {
                    match.timer.elapsedSeconds = timerData.elapsedSeconds;
                }
                if (match.status === 'SCHEDULED') {
                    match.status = 'LIVE';
                }
                break;
            case 'startSecondHalf':
                match.timer.isRunning = true;
                match.timer.isPaused = false;
                match.timer.startTime = new Date();
                match.timer.elapsedSeconds = 45 * 60; // Start from 45:00
                match.timer.addedTime = 0; // Reset added time for 2nd half
                match.period = 2;
                match.status = 'LIVE';
                break;
            case 'pause':
                match.timer.isPaused = true;
                match.timer.elapsedSeconds = timerData.elapsedSeconds || timerData.elapsed || match.timer.elapsedSeconds;
                break;
            case 'resume':
                match.timer.isPaused = false;
                match.timer.startTime = new Date();
                break;
            case 'reset':
                match.timer = { isRunning: false, isPaused: false, elapsedSeconds: 0, addedTime: 0, startTime: null };
                break;
            case 'addTime':
                match.timer.addedTime = (match.timer.addedTime || 0) + (timerData.additionalSeconds || timerData.seconds || 0);
                break;
            case 'setTime':
                match.timer.elapsedSeconds = timerData.elapsedSeconds || 0;
                match.timer.isRunning = false;
                match.timer.isPaused = false;
                break;
            case 'halfTime':
                match.timer.isPaused = true;
                match.timer.isRunning = false;
                match.timer.elapsedSeconds = timerData.elapsedSeconds || match.timer.elapsedSeconds;
                match.timer.addedTime = 0; // Clear 1st half added time
                match.period = 2; // Move to 2nd half
                match.status = 'HALF_TIME';
                break;
            case 'fullTime':
                match.timer.isPaused = true;
                match.timer.isRunning = false;
                match.timer.elapsedSeconds = timerData.elapsedSeconds || match.timer.elapsedSeconds;
                match.status = 'FULL_TIME';
                break;
            case 'nextPeriod':
                // Move to next period and reset timer
                if (match.period < match.maxPeriods) {
                    match.period = match.period + 1;
                    match.timer.elapsedSeconds = 0;
                    match.timer.addedTime = 0;
                    match.timer.isRunning = false;
                    match.timer.isPaused = false;
                    match.status = 'LIVE';
                }
                break;
        }
        
        await match.save();
        
        const populatedMatch = await GoalMatch.findById(matchId)
            .populate('teamA', 'name shortCode logo')
            .populate('teamB', 'name shortCode logo');

        const io = req.app.get('io');
        if (io) {
            console.log('📡 Emitting matchUpdate (Timer):', {
                matchId: populatedMatch._id,
                sport: populatedMatch.sport,
                timerAction,
                isRunning: match.timer.isRunning,
                isPaused: match.timer.isPaused,
                elapsed: match.timer.elapsedSeconds
            });
            io.emit('matchUpdate', populatedMatch);
        }

        return res.json({
            success: true,
            message: `Timer ${timerAction}`,
            data: populatedMatch
        });
    }

    if (match.status === 'COMPLETED') {
        res.status(400);
        throw new Error('Cannot update a completed match');
    }

    // Update scores
    if (pointsA !== undefined) {
        if (typeof pointsA !== 'number' || pointsA < 0) {
            res.status(400);
            throw new Error('pointsA must be a non-negative number');
        }
        match.scoreA = pointsA;
    }
    if (pointsB !== undefined) {
        if (typeof pointsB !== 'number' || pointsB < 0) {
            res.status(400);
            throw new Error('pointsB must be a non-negative number');
        }
        match.scoreB = pointsB;
    }

    // Update period
    if (period !== undefined) {
        if (typeof period !== 'number' || period < 1) {
            res.status(400);
            throw new Error('Period must be a positive number');
        }
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

    try {
        await match.save();
    } catch (saveError) {
        console.error('❌ Error saving match:', saveError);
        res.status(500);
        throw new Error(`Failed to save match: ${saveError.message}`);
    }

    // Emit real-time update with populated match
    const populatedMatch = await GoalMatch.findById(matchId)
        .populate('teamA', 'name shortCode logo')
        .populate('teamB', 'name shortCode logo')
        .populate('winner', 'name shortCode logo');
        
    const io = req.app.get('io');
    if (io) {
        console.log('📡 Emitting matchUpdate (Score):', {
            matchId: populatedMatch._id,
            sport: populatedMatch.sport,
            scoreA: populatedMatch.scoreA,
            scoreB: populatedMatch.scoreB,
            period: populatedMatch.period,
            status: populatedMatch.status
        });
        io.emit('matchUpdate', populatedMatch);
    } else {
        console.warn('⚠️ Socket.io not available - match update not broadcasted');
    }

    res.status(200).json({
        success: true,
        data: populatedMatch
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
