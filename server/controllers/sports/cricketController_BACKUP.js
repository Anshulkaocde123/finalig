const asyncHandler = require('express-async-handler');
const { CricketMatch } = require('../../models/Match');

/**
 * @desc    Create a new cricket match
 * @route   POST /api/matches/cricket/create
 * @access  Public (for now)
 */
const createMatch = asyncHandler(async (req, res) => {
    const { teamA, teamB, scheduledAt, venue, totalOvers, squadA, squadB } = req.body;

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
        scoreA: { runs: 0, wickets: 0, overs: 0, balls: 0, extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0 } },
        scoreB: { runs: 0, wickets: 0, overs: 0, balls: 0, extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0 } },
        squadA: squadA || [],
        squadB: squadB || [],
        currentInnings: 1,
        battingTeam: 'A',
        currentOverBalls: []
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
    const { 
        matchId, team, runs, wickets, overs, status, extraType, isWicket, isUndo, toss,
        // New fields for advanced cricket management
        squadA, squadB,
        switchStrike, endOver, swapInnings,
        selectBatsman, selectBowler,
        outType, outBy, dismissedBatsman,
        innings: inningsUpdate
    } = req.body;

    const match = await CricketMatch.findById(matchId);

    if (!match) {
        res.status(404);
        throw new Error('Match not found');
    }

    // ========== SQUAD UPDATE ==========
    if (squadA !== undefined) {
        match.squadA = squadA;
    }
    if (squadB !== undefined) {
        match.squadB = squadB;
    }
    if (squadA !== undefined || squadB !== undefined) {
        await match.save();
        const populatedMatch = await CricketMatch.findById(matchId)
            .populate('teamA', 'name shortCode logo')
            .populate('teamB', 'name shortCode logo');

        const io = req.app.get('io');
        if (io) io.emit('matchUpdate', populatedMatch);

        return res.json({
            success: true,
            message: 'Squads updated',
            data: populatedMatch
        });
    }

    // ========== SWITCH STRIKE ==========
    if (switchStrike) {
        if (match.currentBatsmen?.striker && match.currentBatsmen?.nonStriker) {
            const temp = match.currentBatsmen.striker;
            match.currentBatsmen.striker = match.currentBatsmen.nonStriker;
            match.currentBatsmen.nonStriker = temp;
            
            // Update isOnStrike flags in squad
            const battingSquad = match.battingTeam === 'A' ? match.squadA : match.squadB;
            battingSquad.forEach(p => {
                if (p.playerName === match.currentBatsmen.striker?.playerName) {
                    p.isOnStrike = true;
                } else {
                    p.isOnStrike = false;
                }
            });
        }
        await match.save();
        const populatedMatch = await CricketMatch.findById(matchId)
            .populate('teamA', 'name shortCode logo')
            .populate('teamB', 'name shortCode logo');
        const io = req.app.get('io');
        if (io) io.emit('matchUpdate', populatedMatch);
        return res.json({ success: true, message: 'Strike switched', data: populatedMatch });
    }

    // ========== END OVER ==========
    if (endOver) {
        match.currentOverBalls = [];
        // Auto switch strike at end of over
        if (match.currentBatsmen?.striker && match.currentBatsmen?.nonStriker) {
            const temp = match.currentBatsmen.striker;
            match.currentBatsmen.striker = match.currentBatsmen.nonStriker;
            match.currentBatsmen.nonStriker = temp;
        }
        await match.save();
        const populatedMatch = await CricketMatch.findById(matchId)
            .populate('teamA', 'name shortCode logo')
            .populate('teamB', 'name shortCode logo');
        const io = req.app.get('io');
        if (io) io.emit('matchUpdate', populatedMatch);
        return res.json({ success: true, message: 'Over ended', data: populatedMatch });
    }

    // ========== SWAP INNINGS ==========
    if (swapInnings) {
        // Set target for 2nd innings
        const firstInningsScore = match.battingTeam === 'A' ? match.scoreA : match.scoreB;
        match.target = firstInningsScore.runs + 1;
        
        // Swap batting team
        match.battingTeam = match.battingTeam === 'A' ? 'B' : 'A';
        match.currentInnings = 2;
        
        // Clear current batsmen and bowler
        match.currentBatsmen = { striker: null, nonStriker: null };
        match.currentBowler = null;
        match.currentOverBalls = [];
        
        await match.save();
        const populatedMatch = await CricketMatch.findById(matchId)
            .populate('teamA', 'name shortCode logo')
            .populate('teamB', 'name shortCode logo');
        const io = req.app.get('io');
        if (io) io.emit('matchUpdate', populatedMatch);
        return res.json({ success: true, message: 'Innings swapped', data: populatedMatch });
    }

    // ========== SELECT BATSMAN ==========
    if (selectBatsman) {
        const { playerId, playerName, position } = selectBatsman;
        const battingSquad = match.battingTeam === 'A' ? match.squadA : match.squadB;
        
        // Find player in squad
        let player = battingSquad.find(p => p.playerName === playerName || p._id?.toString() === playerId);
        
        if (!player && playerName) {
            // Add new player if not in squad
            player = {
                playerName,
                runsScored: 0,
                ballsFaced: 0,
                fours: 0,
                sixes: 0,
                isOut: false,
                isCurrentBatsman: true,
                isOnStrike: position === 'striker'
            };
            battingSquad.push(player);
        }
        
        if (player) {
            player.isCurrentBatsman = true;
            player.isOnStrike = position === 'striker';
            
            if (position === 'striker') {
                match.currentBatsmen.striker = {
                    playerName: player.playerName,
                    runsScored: player.runsScored || 0,
                    ballsFaced: player.ballsFaced || 0,
                    fours: player.fours || 0,
                    sixes: player.sixes || 0,
                    isOnStrike: true
                };
            } else {
                match.currentBatsmen.nonStriker = {
                    playerName: player.playerName,
                    runsScored: player.runsScored || 0,
                    ballsFaced: player.ballsFaced || 0,
                    fours: player.fours || 0,
                    sixes: player.sixes || 0,
                    isOnStrike: false
                };
            }
        }
        
        await match.save();
        const populatedMatch = await CricketMatch.findById(matchId)
            .populate('teamA', 'name shortCode logo')
            .populate('teamB', 'name shortCode logo');
        const io = req.app.get('io');
        if (io) io.emit('matchUpdate', populatedMatch);
        return res.json({ success: true, message: 'Batsman selected', data: populatedMatch });
    }

    // ========== SELECT BOWLER ==========
    if (selectBowler) {
        const { bowlerId, bowlerName } = selectBowler;
        const bowlingSquad = match.battingTeam === 'A' ? match.squadB : match.squadA;
        
        // Clear previous bowler flag
        bowlingSquad.forEach(p => p.isCurrentBowler = false);
        
        let bowler = bowlingSquad.find(p => p.playerName === bowlerName || p._id?.toString() === bowlerId);
        
        if (!bowler && bowlerName) {
            bowler = {
                playerName: bowlerName,
                oversBowled: 0,
                ballsBowled: 0,
                runsConceded: 0,
                wicketsTaken: 0,
                maidens: 0,
                wides: 0,
                noBalls: 0,
                isCurrentBowler: true
            };
            bowlingSquad.push(bowler);
        }
        
        if (bowler) {
            bowler.isCurrentBowler = true;
            match.currentBowler = {
                playerName: bowler.playerName,
                oversBowled: bowler.oversBowled || 0,
                ballsBowled: bowler.ballsBowled || 0,
                runsConceded: bowler.runsConceded || 0,
                wicketsTaken: bowler.wicketsTaken || 0,
                maidens: bowler.maidens || 0
            };
        }
        
        await match.save();
        const populatedMatch = await CricketMatch.findById(matchId)
            .populate('teamA', 'name shortCode logo')
            .populate('teamB', 'name shortCode logo');
        const io = req.app.get('io');
        if (io) io.emit('matchUpdate', populatedMatch);
        return res.json({ success: true, message: 'Bowler selected', data: populatedMatch });
    }

    // Handle toss update first (doesn't affect score)
    if (toss !== undefined) {
        if (toss === null) {
            // Reset toss
            match.toss = { winner: null, decision: null, conductedAt: null };
        } else {
            match.toss = {
                winner: toss.winner,
                decision: toss.decision,
                conductedAt: new Date()
            };
            // Set batting team based on toss
            if (toss.decision === 'BAT') {
                match.battingTeam = toss.winner === match.teamA.toString() ? 'A' : 'B';
            } else if (toss.decision === 'BOWL') {
                match.battingTeam = toss.winner === match.teamA.toString() ? 'B' : 'A';
            }
        }
        
        await match.save();
        
        const populatedMatch = await CricketMatch.findById(matchId)
            .populate('teamA', 'name shortCode logo')
            .populate('teamB', 'name shortCode logo')
            .populate('toss.winner', 'name shortCode logo');

        const io = req.app.get('io');
        if (io) {
            io.emit('matchUpdate', populatedMatch);
        }

        return res.json({
            success: true,
            message: 'Toss recorded',
            data: populatedMatch
        });
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

    // Get batting and bowling squads
    const battingSquad = match.battingTeam === 'A' ? match.squadA : match.squadB;
    const bowlingSquad = match.battingTeam === 'A' ? match.squadB : match.squadA;

    // Helper to update player stats
    const updateBatsmanStats = (runsToAdd, isBall = true, isFour = false, isSix = false) => {
        if (match.currentBatsmen?.striker) {
            const strikerName = match.currentBatsmen.striker.playerName;
            const batsmanInSquad = battingSquad.find(p => p.playerName === strikerName);
            
            if (batsmanInSquad) {
                batsmanInSquad.runsScored = (batsmanInSquad.runsScored || 0) + runsToAdd;
                if (isBall) batsmanInSquad.ballsFaced = (batsmanInSquad.ballsFaced || 0) + 1;
                if (isFour) batsmanInSquad.fours = (batsmanInSquad.fours || 0) + 1;
                if (isSix) batsmanInSquad.sixes = (batsmanInSquad.sixes || 0) + 1;
            }
            
            // Update currentBatsmen object too
            match.currentBatsmen.striker.runsScored = (match.currentBatsmen.striker.runsScored || 0) + runsToAdd;
            if (isBall) match.currentBatsmen.striker.ballsFaced = (match.currentBatsmen.striker.ballsFaced || 0) + 1;
            if (isFour) match.currentBatsmen.striker.fours = (match.currentBatsmen.striker.fours || 0) + 1;
            if (isSix) match.currentBatsmen.striker.sixes = (match.currentBatsmen.striker.sixes || 0) + 1;
        }
    };

    const updateBowlerStats = (runsToAdd, isWicketTaken = false, isWide = false, isNoBall = false, isBall = true) => {
        if (match.currentBowler) {
            const bowlerName = match.currentBowler.playerName;
            const bowlerInSquad = bowlingSquad.find(p => p.playerName === bowlerName);
            
            if (bowlerInSquad) {
                bowlerInSquad.runsConceded = (bowlerInSquad.runsConceded || 0) + runsToAdd;
                if (isWicketTaken) bowlerInSquad.wicketsTaken = (bowlerInSquad.wicketsTaken || 0) + 1;
                if (isWide) bowlerInSquad.wides = (bowlerInSquad.wides || 0) + 1;
                if (isNoBall) bowlerInSquad.noBalls = (bowlerInSquad.noBalls || 0) + 1;
                if (isBall) {
                    bowlerInSquad.ballsBowled = (bowlerInSquad.ballsBowled || 0) + 1;
                    if (bowlerInSquad.ballsBowled >= 6) {
                        bowlerInSquad.oversBowled = (bowlerInSquad.oversBowled || 0) + 1;
                        bowlerInSquad.ballsBowled = 0;
                    }
                }
            }
            
            // Update currentBowler object too
            match.currentBowler.runsConceded = (match.currentBowler.runsConceded || 0) + runsToAdd;
            if (isWicketTaken) match.currentBowler.wicketsTaken = (match.currentBowler.wicketsTaken || 0) + 1;
        }
    };

    // Helper to add ball to current over display
    const addBallToOver = (ballResult) => {
        if (!match.currentOverBalls) match.currentOverBalls = [];
        match.currentOverBalls.push(ballResult);
        
        // Auto-switch strike on odd runs
        if (['1', '3'].includes(ballResult)) {
            if (match.currentBatsmen?.striker && match.currentBatsmen?.nonStriker) {
                const temp = match.currentBatsmen.striker;
                match.currentBatsmen.striker = match.currentBatsmen.nonStriker;
                match.currentBatsmen.nonStriker = temp;
            }
        }
    };

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
                
                // Update player stats
                updateBatsmanStats(runs, true, runs === 4, runs === 6);
                updateBowlerStats(runs, false, false, false, true);
                
                // Add ball to over display
                addBallToOver(runs.toString());
            }
            return;
        }

        // 3. HANDLE WICKET
        if (isWicket) {
            const wicketVal = isUndo ? -1 : 1;
            score.wickets = Math.max(0, Math.min(10, score.wickets + wicketVal));
            updateOvers(score, isUndo);
            
            if (!isUndo) {
                // Mark batsman as out
                if (match.currentBatsmen?.striker) {
                    const strikerName = match.currentBatsmen.striker.playerName;
                    const batsmanInSquad = battingSquad.find(p => p.playerName === strikerName);
                    if (batsmanInSquad) {
                        batsmanInSquad.isOut = true;
                        batsmanInSquad.outType = outType || 'BOWLED';
                        batsmanInSquad.outBy = outBy || match.currentBowler?.playerName || '';
                        batsmanInSquad.isCurrentBatsman = false;
                        batsmanInSquad.ballsFaced = (batsmanInSquad.ballsFaced || 0) + 1;
                    }
                    // Clear striker
                    match.currentBatsmen.striker = null;
                }
                
                // Update bowler stats
                updateBowlerStats(0, true, false, false, true);
                
                // Add wicket to over display
                addBallToOver('W');
                
                // Add to fall of wickets (could be tracked in innings)
            }
            return;
        }

        // 4. HANDLE EXTRAS (WIDE, NOBALL, BYE, LEGBYE)
        if (extraType) {
            const runVal = isUndo ? -1 : 1;
            
            // Initialize extras if not present
            if (!score.extras) {
                score.extras = { wides: 0, noBalls: 0, byes: 0, legByes: 0 };
            }
            
            if (extraType === 'WIDE') {
                score.runs = Math.max(0, score.runs + runVal);
                score.extras.wides = Math.max(0, (score.extras.wides || 0) + runVal);
                if (!isUndo) {
                    updateBowlerStats(1, false, true, false, false);
                    addBallToOver('Wd');
                }
            } else if (extraType === 'NOBALL') {
                score.runs = Math.max(0, score.runs + runVal);
                score.extras.noBalls = Math.max(0, (score.extras.noBalls || 0) + runVal);
                if (!isUndo) {
                    updateBowlerStats(1, false, false, true, false);
                    addBallToOver('Nb');
                }
            } else if (extraType === 'BYE') {
                score.runs = Math.max(0, score.runs + runVal);
                score.extras.byes = Math.max(0, (score.extras.byes || 0) + runVal);
                updateOvers(score, isUndo);
                if (!isUndo) {
                    updateBowlerStats(0, false, false, false, true);
                    addBallToOver('B');
                }
            } else if (extraType === 'LEGBYE') {
                score.runs = Math.max(0, score.runs + runVal);
                score.extras.legByes = Math.max(0, (score.extras.legByes || 0) + runVal);
                updateOvers(score, isUndo);
                if (!isUndo) {
                    updateBowlerStats(0, false, false, false, true);
                    addBallToOver('Lb');
                }
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
