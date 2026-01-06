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
        currentBatsmen: { striker: null, nonStriker: null },
        currentBowler: null,
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

    if (!matchId) {
        res.status(400);
        throw new Error('matchId is required');
    }

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
        
        console.log(`🏏 Selecting batsman:`, JSON.stringify({ playerId, playerName, position }, null, 2));
        console.log(`🏏 SELECT BATSMAN - playerName: "${playerName}" as ${position}`);
        
        // Initialize currentBatsmen if not exists
        if (!match.currentBatsmen) {
            match.currentBatsmen = { striker: null, nonStriker: null };
        }
        
        // Find the player we want to set
        console.log(`🔍 Searching in squad for player with name: "${playerName}" or ID: "${playerId}"`);
        console.log(`🔍 Squad players:`, battingSquad.map(p => ({ name: p.playerName || p.name, id: p._id?.toString() })));
        
        let selectedPlayer = battingSquad.find(p => {
            const pName = p.playerName || p.name;
            const matches = pName === playerName || (playerId && p._id?.toString() === playerId);
            if (matches) {
                console.log(`🔍 FOUND player: ${pName} (looking for: ${playerName})`);
            }
            return matches;
        });
        
        console.log(`🔍 selectedPlayer after find:`, selectedPlayer ? {
            name: selectedPlayer.playerName || selectedPlayer.name,
            id: selectedPlayer._id?.toString()
        } : 'NOT FOUND');
        
        if (!selectedPlayer && playerName) {
            // Add new player if not in squad
            selectedPlayer = {
                playerName,
                runsScored: 0,
                ballsFaced: 0,
                fours: 0,
                sixes: 0,
                isOut: false,
                isCurrentBatsman: true,
                isOnStrike: position === 'striker'
            };
            battingSquad.push(selectedPlayer);
            console.log(`➕ Added new player to squad: ${playerName}`);
        }
        
        if (!selectedPlayer) {
            res.status(400);
            throw new Error(`Player ${playerName} not found in squad`);
        }
        
        // SIMPLIFIED LOGIC: Clear all flags first, then set only what's needed
        if (position === 'striker') {
            // Clear all striker flags from everyone
            battingSquad.forEach(p => {
                p.isOnStrike = false;
                // Only clear isCurrentBatsman if they're not the non-striker
                if (p.playerName !== playerName && match.currentBatsmen?.nonStriker?.playerName !== p.playerName) {
                    p.isCurrentBatsman = false;
                }
            });
            
            // Set the selected player as striker
            selectedPlayer.isCurrentBatsman = true;
            selectedPlayer.isOnStrike = true;
            
            // Update match.currentBatsmen.striker
            match.currentBatsmen.striker = {
                playerName: selectedPlayer.playerName,
                runsScored: selectedPlayer.runsScored || 0,
                ballsFaced: selectedPlayer.ballsFaced || 0,
                fours: selectedPlayer.fours || 0,
                sixes: selectedPlayer.sixes || 0,
                isOnStrike: true
            };
            console.log(`✅ Striker set to: "${selectedPlayer.playerName}"`);
            
        } else if (position === 'nonStriker') {
            console.log(`🔍 Debug - playerName parameter: "${playerName}"`);
            console.log(`🔍 Debug - selectedPlayer.playerName: "${selectedPlayer.playerName}"`);
            console.log(`🔍 Debug - current striker: "${match.currentBatsmen?.striker?.playerName}"`);
            
            // Clear all non-striker flags from everyone (except striker)
            battingSquad.forEach(p => {
                // Only clear isCurrentBatsman if they're not the striker and not our selection
                if (p.playerName !== playerName && match.currentBatsmen?.striker?.playerName !== p.playerName) {
                    p.isCurrentBatsman = false;
                }
                // Ensure only striker has isOnStrike
                if (match.currentBatsmen?.striker?.playerName !== p.playerName) {
                    p.isOnStrike = false;
                }
            });
            
            // Set the selected player as non-striker
            selectedPlayer.isCurrentBatsman = true;
            selectedPlayer.isOnStrike = false;
            
            console.log(`🔍 Debug - Before setting nonStriker, selectedPlayer is: "${selectedPlayer.playerName}"`);
            
            // Update match.currentBatsmen.nonStriker
            match.currentBatsmen.nonStriker = {
                playerName: selectedPlayer.playerName,
                runsScored: selectedPlayer.runsScored || 0,
                ballsFaced: selectedPlayer.ballsFaced || 0,
                fours: selectedPlayer.fours || 0,
                sixes: selectedPlayer.sixes || 0,
                isOnStrike: false
            };
            console.log(`✅ Non-Striker set to: "${selectedPlayer.playerName}"`);
            console.log(`🔍 Debug - match.currentBatsmen.nonStriker.playerName: "${match.currentBatsmen.nonStriker.playerName}"`);
        }
        
        console.log('📊 Current batsmen after update:', {
            striker: match.currentBatsmen.striker?.playerName,
            nonStriker: match.currentBatsmen.nonStriker?.playerName
        });
        console.log('📋 Squad flags:', battingSquad.map(p => ({
            name: p.playerName,
            isOnStrike: p.isOnStrike,
            isCurrentBatsman: p.isCurrentBatsman
        })));
        
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
            // Set batting team based on toss (convert both IDs to strings for comparison)
            const tossWinnerId = toss.winner?.toString() || toss.winner;
            const teamAId = match.teamA?._id?.toString() || match.teamA?.toString();
            const teamBId = match.teamB?._id?.toString() || match.teamB?.toString();
            
            console.log('🪙 Toss Debug:', { tossWinnerId, teamAId, teamBId, decision: toss.decision });
            
            if (toss.decision === 'BAT') {
                match.battingTeam = tossWinnerId === teamAId ? 'A' : 'B';
            } else if (toss.decision === 'BOWL') {
                match.battingTeam = tossWinnerId === teamAId ? 'B' : 'A';
            }
            
            console.log('✅ Batting team set to:', match.battingTeam);
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
        if (!match.currentBatsmen?.striker?.playerName) {
            console.warn('⚠️ No striker found for stats update');
            return;
        }
        
        const strikerName = match.currentBatsmen.striker.playerName;
        const batsmanInSquad = battingSquad.find(p => p.playerName === strikerName);
        
        if (!batsmanInSquad) {
            console.warn(`⚠️ Batsman ${strikerName} not found in squad`);
            return;
        }
        
        // Validate and update runs
        const validRuns = Math.max(0, Math.min(runsToAdd, 7));
        batsmanInSquad.runsScored = (batsmanInSquad.runsScored || 0) + validRuns;
        
        // Update balls faced only for legal deliveries
        if (isBall) batsmanInSquad.ballsFaced = (batsmanInSquad.ballsFaced || 0) + 1;
        
        // Track boundaries
        if (isFour) batsmanInSquad.fours = (batsmanInSquad.fours || 0) + 1;
        if (isSix) batsmanInSquad.sixes = (batsmanInSquad.sixes || 0) + 1;
        
        // Sync with currentBatsmen display object
        match.currentBatsmen.striker.runsScored = batsmanInSquad.runsScored;
        match.currentBatsmen.striker.ballsFaced = batsmanInSquad.ballsFaced;
        match.currentBatsmen.striker.fours = batsmanInSquad.fours;
        match.currentBatsmen.striker.sixes = batsmanInSquad.sixes;
    };

    const updateBowlerStats = (runsToAdd, isWicketTaken = false, isWide = false, isNoBall = false, isBall = true) => {
        if (!match.currentBowler?.playerName) {
            console.warn('⚠️ No bowler found for stats update');
            return;
        }
        
        const bowlerName = match.currentBowler.playerName;
        const bowlerInSquad = bowlingSquad.find(p => p.playerName === bowlerName);
        
        if (!bowlerInSquad) {
            console.warn(`⚠️ Bowler ${bowlerName} not found in squad`);
            return;
        }
        
        // Update runs conceded (validate bounds)
        const validRuns = Math.max(0, Math.min(runsToAdd, 7));
        bowlerInSquad.runsConceded = (bowlerInSquad.runsConceded || 0) + validRuns;
        
        // Track wickets
        if (isWicketTaken) bowlerInSquad.wicketsTaken = (bowlerInSquad.wicketsTaken || 0) + 1;
        
        // Track extras
        if (isWide) bowlerInSquad.wides = (bowlerInSquad.wides || 0) + 1;
        if (isNoBall) bowlerInSquad.noBalls = (bowlerInSquad.noBalls || 0) + 1;
        
        // Only count legal deliveries (not wides/noballs)
        if (isBall && !isWide && !isNoBall) {
            bowlerInSquad.ballsBowled = (bowlerInSquad.ballsBowled || 0) + 1;
            
            // Calculate overs properly (6 legal balls = 1 over)
            const totalBalls = bowlerInSquad.ballsBowled;
            const overs = Math.floor(totalBalls / 6);
            const balls = totalBalls % 6;
            bowlerInSquad.oversBowled = parseFloat((overs + (balls / 10)).toFixed(1));
            
            // Check for maiden over (completed over with 0 runs from legal deliveries)
            if (balls === 0 && totalBalls > 0 && totalBalls % 6 === 0) {
                const currentOverBalls = match.currentOverBalls || [];
                const last6Balls = currentOverBalls.slice(-6);
                const runsInOver = last6Balls
                    .filter(ball => !['Wd', 'Nb'].includes(ball))
                    .reduce((sum, ball) => sum + (parseInt(ball) || 0), 0);
                
                if (runsInOver === 0 && last6Balls.length >= 6) {
                    bowlerInSquad.maidens = (bowlerInSquad.maidens || 0) + 1;
                }
            }
        }
        
        // Sync with currentBowler display object
        match.currentBowler.runsConceded = bowlerInSquad.runsConceded;
        match.currentBowler.wicketsTaken = bowlerInSquad.wicketsTaken;
        match.currentBowler.ballsBowled = bowlerInSquad.ballsBowled;
        match.currentBowler.oversBowled = bowlerInSquad.oversBowled;
        match.currentBowler.maidens = bowlerInSquad.maidens;
    };

    // Helper to add ball to current over display with proper strike rotation
    const addBallToOver = (ballResult) => {
        if (!match.currentOverBalls) match.currentOverBalls = [];
        
        // Limit over history to prevent memory issues
        if (match.currentOverBalls.length >= 60) { // 10 overs worth
            match.currentOverBalls = match.currentOverBalls.slice(-50);
        }
        
        match.currentOverBalls.push(ballResult);
        
        // Auto-switch strike on odd runs (1 or 3) for legal deliveries
        if (['1', '3', '5'].includes(ballResult)) {
            if (match.currentBatsmen?.striker && match.currentBatsmen?.nonStriker) {
                // Swap striker and non-striker
                const temp = { ...match.currentBatsmen.striker };
                match.currentBatsmen.striker = { ...match.currentBatsmen.nonStriker, isOnStrike: true };
                match.currentBatsmen.nonStriker = { ...temp, isOnStrike: false };
                
                // Update squad flags
                const newStriker = battingSquad.find(p => p.playerName === match.currentBatsmen.striker.playerName);
                const newNonStriker = battingSquad.find(p => p.playerName === match.currentBatsmen.nonStriker.playerName);
                
                if (newStriker) newStriker.isOnStrike = true;
                if (newNonStriker) newNonStriker.isOnStrike = false;
            }
        }
        
        // Switch strike at end of over (after 6 legal deliveries)
        const legalBalls = match.currentOverBalls.filter(ball => !['Wd', 'Nb'].includes(ball)).length;
        if (legalBalls % 6 === 0 && legalBalls > 0) {
            if (match.currentBatsmen?.striker && match.currentBatsmen?.nonStriker) {
                // Swap for next over
                const temp = { ...match.currentBatsmen.striker };
                match.currentBatsmen.striker = { ...match.currentBatsmen.nonStriker, isOnStrike: true };
                match.currentBatsmen.nonStriker = { ...temp, isOnStrike: false };
                
                // Update squad flags
                const newStriker = battingSquad.find(p => p.playerName === match.currentBatsmen.striker.playerName);
                const newNonStriker = battingSquad.find(p => p.playerName === match.currentBatsmen.nonStriker.playerName);
                
                if (newStriker) newStriker.isOnStrike = true;
                if (newNonStriker) newNonStriker.isOnStrike = false;
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
            
            // Only update overs for non-undo wickets (wickets consume a ball)
            if (!isUndo) {
                updateOvers(score, false);
            } else {
                updateOvers(score, true);
            }
            
            if (!isUndo) {
                // Mark batsman as out and record details
                if (match.currentBatsmen?.striker) {
                    const strikerName = match.currentBatsmen.striker.playerName;
                    const batsmanInSquad = battingSquad.find(p => p.playerName === strikerName);
                    
                    if (batsmanInSquad) {
                        batsmanInSquad.isOut = true;
                        batsmanInSquad.outType = outType || 'BOWLED';
                        batsmanInSquad.outBy = outBy || match.currentBowler?.playerName || '';
                        batsmanInSquad.isCurrentBatsman = false;
                        batsmanInSquad.isOnStrike = false;
                        
                        // Ball faced for wicket
                        batsmanInSquad.ballsFaced = (batsmanInSquad.ballsFaced || 0) + 1;
                        
                        // Record fall of wicket
                        if (!match.fallOfWickets) match.fallOfWickets = [];
                        match.fallOfWickets.push({
                            wicketNumber: score.wickets,
                            playerName: strikerName,
                            runs: batsmanInSquad.runsScored || 0,
                            balls: batsmanInSquad.ballsFaced || 0,
                            teamScore: score.runs,
                            teamOvers: score.overs,
                            outType: outType || 'BOWLED',
                            outBy: outBy || match.currentBowler?.playerName || '',
                            timestamp: new Date()
                        });
                    }
                    
                    // Clear striker - admin needs to select new batsman
                    match.currentBatsmen.striker = null;
                }
                
                // Update bowler stats
                updateBowlerStats(0, true, false, false, true);
                
                // Add wicket to over display
                addBallToOver('W');
                
                // Check if all out (10 wickets)
                if (score.wickets >= 10) {
                    console.log(`🏁 Team ${team} all out!`);
                    // Auto-end innings could be triggered here
                }
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
