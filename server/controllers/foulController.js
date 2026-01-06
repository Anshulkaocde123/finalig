const asyncHandler = require('express-async-handler');
const Foul = require('../models/Foul');
const { Match } = require('../models/Match');

/**
 * @desc    Add a foul/card to a match
 * @route   POST /api/fouls
 * @access  Private
 */
const addFoul = asyncHandler(async (req, res) => {
    const { 
        matchId, 
        team, 
        playerName, 
        foulType, 
        gameTime, 
        period, 
        description,
        jerseyNumber,
        reason,
        consequence,
        pitchLocation
    } = req.body;
    
    console.log('🔵 Adding foul:', { matchId, team, playerName, foulType, gameTime });
    
    // Validation
    if (!matchId) {
        res.status(400);
        throw new Error('matchId is required');
    }
    
    if (!team || !['A', 'B'].includes(team)) {
        res.status(400);
        throw new Error('team must be either A or B');
    }
    
    if (!playerName || !playerName.trim()) {
        res.status(400);
        throw new Error('playerName is required');
    }
    
    if (!foulType) {
        res.status(400);
        throw new Error('foulType is required');
    }
    
    // Get match to validate and get sport
    const match = await Match.findById(matchId)
        .populate('teamA', 'name shortCode')
        .populate('teamB', 'name shortCode');
    
    if (!match) {
        res.status(404);
        throw new Error('Match not found');
    }
    
    // Map team identifier to department
    const teamDept = team === 'A' ? match.teamA : match.teamB;
    
    if (!teamDept) {
        res.status(400);
        throw new Error(`Team ${team} not found in match`);
    }
    
    console.log('✅ Match found:', { matchId, sport: match.sport, teamDept: teamDept.shortCode });
    
    // Create foul record
    const foul = await Foul.create({
        match: matchId,
        team: teamDept._id,
        playerName: playerName.trim(),
        foulType,
        sport: match.sport,
        gameTime: gameTime || '',
        period: period || match.period || match.half || 1,
        description: description || reason || '',
        jerseyNumber: jerseyNumber || null,
        consequence: consequence || '',
        pitchLocation: pitchLocation || ''
    });
    
    console.log('✅ Foul created in DB:', foul._id);
    
    // Also add to match's embedded fouls array
    match.fouls.push({
        team,
        playerName: playerName.trim(),
        foulType,
        gameTime: gameTime || '',
        period: period || match.period || match.half || 1,
        description: description || reason || ''
    });
    
    // Update card counts for quick access
    if (foulType === 'YELLOW_CARD') {
        if (team === 'A') {
            match.cardsA = match.cardsA || { yellow: 0, red: 0 };
            match.cardsA.yellow = (match.cardsA.yellow || 0) + 1;
        } else {
            match.cardsB = match.cardsB || { yellow: 0, red: 0 };
            match.cardsB.yellow = (match.cardsB.yellow || 0) + 1;
        }
    } else if (foulType === 'RED_CARD') {
        if (team === 'A') {
            match.cardsA = match.cardsA || { yellow: 0, red: 0 };
            match.cardsA.red = (match.cardsA.red || 0) + 1;
        } else {
            match.cardsB = match.cardsB || { yellow: 0, red: 0 };
            match.cardsB.red = (match.cardsB.red || 0) + 1;
        }
    }
    
    await match.save();
    console.log('✅ Match updated with foul');
    
    // Emit real-time update with complete foul data
    const io = req.app.get('io');
    if (io) {
        const populatedMatch = await Match.findById(matchId)
            .populate('teamA', 'name shortCode logo')
            .populate('teamB', 'name shortCode logo');
        
        // Populate the foul with team info for frontend
        const populatedFoul = await Foul.findById(foul._id)
            .populate('team', 'name shortCode')
            .lean();
        
        io.emit('matchUpdate', populatedMatch);
        io.emit('foulAdded', populatedFoul);
        
        console.log('✅ Socket events emitted: matchUpdate, foulAdded');
    }
    
    res.status(201).json({
        success: true,
        data: foul
    });
});

/**
 * @desc    Get fouls for a match
 * @route   GET /api/fouls/match/:matchId
 * @access  Public
 */
const getMatchFouls = asyncHandler(async (req, res) => {
    const fouls = await Foul.find({ match: req.params.matchId })
        .populate('team', 'name shortCode')
        .populate('player', 'name jerseyNumber')
        .populate('recordedBy', 'name')
        .sort({ createdAt: -1 });
    
    res.json({
        success: true,
        count: fouls.length,
        data: fouls
    });
});

/**
 * @desc    Get card summary for a match
 * @route   GET /api/fouls/match/:matchId/cards
 * @access  Public
 */
const getCardSummary = asyncHandler(async (req, res) => {
    const match = await Match.findById(req.params.matchId)
        .populate('teamA', 'name shortCode')
        .populate('teamB', 'name shortCode');
    
    if (!match) {
        res.status(404);
        throw new Error('Match not found');
    }
    
    // Aggregate cards by team
    const cards = await Foul.aggregate([
        { $match: { match: match._id, foulType: { $in: ['YELLOW_CARD', 'RED_CARD'] } } },
        { 
            $group: { 
                _id: { team: '$team', type: '$foulType' },
                count: { $sum: 1 },
                players: { $push: '$playerName' }
            }
        }
    ]);
    
    res.json({
        success: true,
        data: {
            teamA: {
                name: match.teamA.shortCode,
                yellowCards: match.cardsA?.yellow || 0,
                redCards: match.cardsA?.red || 0
            },
            teamB: {
                name: match.teamB.shortCode,
                yellowCards: match.cardsB?.yellow || 0,
                redCards: match.cardsB?.red || 0
            },
            details: cards
        }
    });
});

/**
 * @desc    Remove a foul (undo)
 * @route   DELETE /api/fouls/:id
 * @access  Private
 */
const removeFoul = asyncHandler(async (req, res) => {
    const foul = await Foul.findById(req.params.id);
    
    if (!foul) {
        res.status(404);
        throw new Error('Foul not found');
    }
    
    // Update match card counts
    const match = await Match.findById(foul.match);
    if (match) {
        const teamKey = foul.team.toString() === match.teamA.toString() ? 'A' : 'B';
        
        if (foul.foulType === 'YELLOW_CARD') {
            if (teamKey === 'A') {
                match.cardsA.yellow = Math.max(0, (match.cardsA?.yellow || 0) - 1);
            } else {
                match.cardsB.yellow = Math.max(0, (match.cardsB?.yellow || 0) - 1);
            }
        } else if (foul.foulType === 'RED_CARD') {
            if (teamKey === 'A') {
                match.cardsA.red = Math.max(0, (match.cardsA?.red || 0) - 1);
            } else {
                match.cardsB.red = Math.max(0, (match.cardsB?.red || 0) - 1);
            }
        }
        
        // Remove from embedded fouls array
        match.fouls = match.fouls.filter(f => 
            !(f.playerName === foul.playerName && 
              f.foulType === foul.foulType && 
              f.gameTime === foul.gameTime)
        );
        
        await match.save();
    }
    
    await foul.deleteOne();
    
    // Emit update
    const io = req.app.get('io');
    if (io && match) {
        const populatedMatch = await Match.findById(match._id)
            .populate('teamA', 'name shortCode logo')
            .populate('teamB', 'name shortCode logo');
        io.emit('matchUpdate', populatedMatch);
    }
    
    res.json({
        success: true,
        message: 'Foul removed'
    });
});

/**
 * @desc    Get fouls by sport type
 * @route   GET /api/fouls/sport/:sport
 * @access  Public
 */
const getFoulsBySport = asyncHandler(async (req, res) => {
    const fouls = await Foul.find({ sport: req.params.sport.toUpperCase() })
        .populate('match', 'teamA teamB status scheduledAt')
        .populate('team', 'name shortCode')
        .sort({ createdAt: -1 })
        .limit(50);
    
    res.json({
        success: true,
        count: fouls.length,
        data: fouls
    });
});

module.exports = {
    addFoul,
    getMatchFouls,
    getCardSummary,
    removeFoul,
    getFoulsBySport
};
