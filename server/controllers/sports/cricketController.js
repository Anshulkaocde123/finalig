const asyncHandler = require('express-async-handler');
const { CricketMatch } = require('../../models/Match');

/**
 * @desc    Create a new cricket match
 * @route   POST /api/matches/cricket/create
 * @access  Public (for now)
 */
const createMatch = asyncHandler(async (req, res) => {
    const { teamA, teamB, scheduledAt, venue, totalOvers } = req.body;

    if (!teamA || !teamB) {
        res.status(400);
        throw new Error('Both teamA and teamB are required');
    }

    if (teamA === teamB) {
        res.status(400);
        throw new Error('A team cannot play against itself');
    }

    const match = await CricketMatch.create({
        sport: 'CRICKET',
        teamA,
        teamB,
        scheduledAt,
        venue,
        totalOvers: totalOvers || 20,
        scoreA: { runs: 0, wickets: 0, overs: 0 },
        scoreB: { runs: 0, wickets: 0, overs: 0 }
    });

    // Populate teams for real-time update
    const populatedMatch = await CricketMatch.findById(match._id)
        .populate('teamA', 'name shortCode logo')
        .populate('teamB', 'name shortCode logo');

    // Emit real-time event for new match
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
 * @desc    Update cricket match score
 * @route   PUT /api/matches/cricket/update/:id
 * @access  Public (for now)
 */
const updateScore = asyncHandler(async (req, res) => {
    const { matchId, team, runs, wickets, overs, status, extraType, isWicket, isUndo } = req.body;

    const match = await CricketMatch.findById(matchId);

    if (!match) {
        res.status(404);
        throw new Error('Match not found');
    }

    if (match.status === 'COMPLETED') {
        res.status(400);
        throw new Error('Cannot update a completed match');
    }

    // UNDO LOGIC: Restore from last history entry
    if (isUndo) {
        if (!match.scoreHistory || match.scoreHistory.length === 0) {
            res.status(400);
            throw new Error('No actions to undo');
        }

        // Get last action
        const lastAction = match.scoreHistory[match.scoreHistory.length - 1];
        
        // Restore scores to before state
        if (lastAction.team === 'A') {
            match.scoreA = { ...lastAction.before };
        } else {
            match.scoreB = { ...lastAction.before };
        }

        // Remove from history
        match.scoreHistory.pop();

        const updatedMatch = await match.save();
        const populatedMatch = await CricketMatch.findById(updatedMatch._id)
            .populate('teamA', 'name shortCode logo')
            .populate('teamB', 'name shortCode logo');

        // Emit real-time update
        const io = req.app.get('io');
        if (io) {
            io.emit('matchUpdate', populatedMatch);
        }

        return res.json({
            success: true,
            message: 'Last action undone',
            data: populatedMatch
        });
    }

    // Save current state for history
    const previousStateA = JSON.parse(JSON.stringify(match.scoreA));
    const previousStateB = JSON.parse(JSON.stringify(match.scoreB));

    // Helper to update team score
    const updateTeamScore = (score) => {
        // 1. HANDLE DIRECT OVERRIDES (for initialization)
        if (runs !== undefined && extraType === undefined && !isWicket && !isUndo && runs > 6) {
            score.runs = runs;
            return;
        }
        if (wickets !== undefined && !isWicket && !isUndo) {
            score.wickets = wickets;
            return;
        }
        if (overs !== undefined && extraType === undefined && !isUndo) {
            score.overs = overs;
            return;
        }

        // 2. HANDLE INCREMENTAL RUN UPDATES (0, 1, 2, 3, 4, 6 runs in a ball)
        if (runs !== undefined && extraType === undefined && !isWicket && runs <= 6) {
            if (isUndo) {
                score.runs = Math.max(0, score.runs - runs);
                updateOvers(score, true);
            } else {
                score.runs += runs;
                updateOvers(score, false);
            }
            return;
        }

        // 3. HANDLE WICKET
        if (isWicket) {
            const wicketVal = isUndo ? -1 : 1;
            score.wickets = Math.max(0, Math.min(10, score.wickets + wicketVal));
            updateOvers(score, isUndo);
            return;
        }

        // 4. HANDLE EXTRAS (WIDE, NOBALL, BYE, LEGBYE)
        if (extraType) {
            const runVal = isUndo ? -1 : 1;
            if (extraType === 'WIDE' || extraType === 'NOBALL') {
                score.runs = Math.max(0, score.runs + runVal);
                // No ball counted for wide/no ball
            } else if (extraType === 'BYE' || extraType === 'LEGBYE') {
                score.runs = Math.max(0, score.runs + runVal);
                // Ball is counted for bye/legbye
                updateOvers(score, isUndo);
            }
            return;
        }
    };

    // Helper to handle over increments (e.g., 0.5 -> 1.0)
    const updateOvers = (score, undo = false) => {
        let totalBalls = Math.round(score.overs * 10);
        const fullOvers = Math.floor(totalBalls / 10);
        const ballsInOver = totalBalls % 10;

        let actualBalls = (fullOvers * 6) + ballsInOver;

        if (undo) {
            actualBalls = Math.max(0, actualBalls - 1);
        } else {
            actualBalls += 1;
        }

        const newFullOvers = Math.floor(actualBalls / 6);
        const newBallsInOver = actualBalls % 6;
        score.overs = newFullOvers + (newBallsInOver / 10);
    };

    if (team === 'A') {
        updateTeamScore(match.scoreA);
    } else if (team === 'B') {
        updateTeamScore(match.scoreB);
    } else if (status) {
        // Status only update allowed
    } else {
        res.status(400);
        throw new Error('Team must be either "A" or "B" for score updates');
    }

    // Update status if provided
    if (status) {
        match.status = status;
    }

    // Auto-set to LIVE if score is being updated and status is SCHEDULED
    if (match.status === 'SCHEDULED' && (runs !== undefined || extraType || isWicket)) {
        match.status = 'LIVE';
    }

    // Determine winner if match is completed
    if (match.status === 'COMPLETED') {
        if (match.scoreA.runs > match.scoreB.runs) {
            match.winner = match.teamA;
        } else if (match.scoreB.runs > match.scoreA.runs) {
            match.winner = match.teamB;
        }
    }

    // Record in history (track only actual score updates, not status-only updates)
    if (team === 'A' || team === 'B') {
        const action = runs !== undefined ? `+${runs} runs` : 
                      isWicket ? 'Wicket' :
                      extraType ? extraType :
                      'Score update';
        
        match.scoreHistory.push({
            timestamp: new Date(),
            team: team,
            action: action,
            before: team === 'A' ? previousStateA : previousStateB,
            after: team === 'A' ? JSON.parse(JSON.stringify(match.scoreA)) : JSON.parse(JSON.stringify(match.scoreB))
        });

        // Keep only last 50 actions for history
        if (match.scoreHistory.length > 50) {
            match.scoreHistory.shift();
        }
    }

    await match.save();

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
        const populatedMatch = await CricketMatch.findById(matchId)
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
 * @desc    Get cricket match by ID
 * @route   GET /api/matches/cricket/:id
 * @access  Public
 */
const getMatch = asyncHandler(async (req, res) => {
    const match = await CricketMatch.findById(req.params.id)
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
