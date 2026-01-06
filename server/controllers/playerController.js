const asyncHandler = require('express-async-handler');
const Player = require('../models/Player');
const Department = require('../models/Department');

/**
 * @desc    Create a new player
 * @route   POST /api/players
 * @access  Private
 */
const createPlayer = asyncHandler(async (req, res) => {
    const { 
        studentId, 
        name, 
        email, 
        department, 
        position, 
        jerseyNumber, 
        photo 
    } = req.body;
    
    // Check if player already exists in this department
    const existingPlayer = await Player.findOne({ studentId, department });
    if (existingPlayer) {
        res.status(400);
        throw new Error('Player already exists in this department');
    }
    
    const player = await Player.create({
        studentId,
        name,
        email,
        department,
        position: position || 'GENERAL',
        jerseyNumber,
        photo
    });
    
    const populatedPlayer = await Player.findById(player._id)
        .populate('department', 'name shortCode logo');
    
    res.status(201).json({
        success: true,
        data: populatedPlayer
    });
});

/**
 * @desc    Get all players with filters
 * @route   GET /api/players
 * @access  Public
 */
const getPlayers = asyncHandler(async (req, res) => {
    const { department, position, search, isActive } = req.query;
    
    let query = {};
    
    if (department) query.department = department;
    if (position) query.position = position.toUpperCase();
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { studentId: { $regex: search, $options: 'i' } }
        ];
    }
    
    const players = await Player.find(query)
        .populate('department', 'name shortCode logo')
        .sort({ name: 1 });
    
    res.json({
        success: true,
        count: players.length,
        data: players
    });
});

/**
 * @desc    Get players by department
 * @route   GET /api/players/department/:departmentId
 * @access  Public
 */
const getPlayersByDepartment = asyncHandler(async (req, res) => {
    const players = await Player.find({ 
        department: req.params.departmentId,
        isActive: true 
    })
    .sort({ jerseyNumber: 1, name: 1 });
    
    res.json({
        success: true,
        count: players.length,
        data: players
    });
});

/**
 * @desc    Get player by ID
 * @route   GET /api/players/:id
 * @access  Public
 */
const getPlayerById = asyncHandler(async (req, res) => {
    const player = await Player.findById(req.params.id)
        .populate('department', 'name shortCode logo')
        .populate('seasonStats.season', 'name year');
    
    if (!player) {
        res.status(404);
        throw new Error('Player not found');
    }
    
    res.json({
        success: true,
        data: player
    });
});

/**
 * @desc    Update player
 * @route   PUT /api/players/:id
 * @access  Private
 */
const updatePlayer = asyncHandler(async (req, res) => {
    const { 
        name, 
        position, 
        jerseyNumber, 
        photo,
        isActive 
    } = req.body;
    
    const player = await Player.findById(req.params.id);
    
    if (!player) {
        res.status(404);
        throw new Error('Player not found');
    }
    
    if (name) player.name = name;
    if (position) player.position = position;
    if (jerseyNumber !== undefined) player.jerseyNumber = jerseyNumber;
    if (photo) player.photo = photo;
    if (isActive !== undefined) player.isActive = isActive;
    
    await player.save();
    
    const updatedPlayer = await Player.findById(player._id)
        .populate('department', 'name shortCode logo');
    
    res.json({
        success: true,
        data: updatedPlayer
    });
});

/**
 * @desc    Update player stats for a match
 * @route   PUT /api/players/:id/stats
 * @access  Private
 */
const updatePlayerStats = asyncHandler(async (req, res) => {
    const { seasonId, sport, stats } = req.body;
    
    const player = await Player.findById(req.params.id);
    
    if (!player) {
        res.status(404);
        throw new Error('Player not found');
    }
    
    // Find or create season stats
    let seasonStats = player.seasonStats.find(
        s => s.season?.toString() === seasonId && s.sport === sport
    );
    
    if (!seasonStats) {
        player.seasonStats.push({
            season: seasonId,
            sport,
            matchesPlayed: 0
        });
        seasonStats = player.seasonStats[player.seasonStats.length - 1];
    }
    
    // Update stats
    if (stats.matchesPlayed !== undefined) seasonStats.matchesPlayed += stats.matchesPlayed;
    if (stats.runsScored !== undefined) seasonStats.runsScored += stats.runsScored;
    if (stats.ballsFaced !== undefined) seasonStats.ballsFaced += stats.ballsFaced;
    if (stats.wicketsTaken !== undefined) seasonStats.wicketsTaken += stats.wicketsTaken;
    if (stats.oversBowled !== undefined) seasonStats.oversBowled += stats.oversBowled;
    if (stats.runsConceded !== undefined) seasonStats.runsConceded += stats.runsConceded;
    if (stats.goals !== undefined) seasonStats.goals += stats.goals;
    if (stats.assists !== undefined) seasonStats.assists += stats.assists;
    if (stats.yellowCards !== undefined) seasonStats.yellowCards += stats.yellowCards;
    if (stats.redCards !== undefined) seasonStats.redCards += stats.redCards;
    
    await player.save();
    
    res.json({
        success: true,
        data: player
    });
});

/**
 * @desc    Get player leaderboard (top performers)
 * @route   GET /api/players/leaderboard/:sport
 * @access  Public
 */
const getPlayerLeaderboard = asyncHandler(async (req, res) => {
    const { sport } = req.params;
    const { stat = 'runsScored', limit = 10, seasonId } = req.query;
    
    let matchQuery = { 'seasonStats.sport': sport.toUpperCase() };
    if (seasonId) matchQuery['seasonStats.season'] = seasonId;
    
    const players = await Player.find(matchQuery)
        .populate('department', 'name shortCode logo')
        .lean();
    
    // Sort by the requested stat
    const sortedPlayers = players
        .map(p => {
            const seasonStat = p.seasonStats.find(s => s.sport === sport.toUpperCase());
            return {
                ...p,
                statValue: seasonStat?.[stat] || 0
            };
        })
        .sort((a, b) => b.statValue - a.statValue)
        .slice(0, parseInt(limit));
    
    res.json({
        success: true,
        sport,
        stat,
        data: sortedPlayers
    });
});

/**
 * @desc    Bulk create players for a department
 * @route   POST /api/players/bulk
 * @access  Private
 */
const bulkCreatePlayers = asyncHandler(async (req, res) => {
    const { departmentId, players } = req.body;
    
    if (!departmentId || !players || !Array.isArray(players)) {
        res.status(400);
        throw new Error('Department ID and players array required');
    }
    
    const createdPlayers = [];
    const errors = [];
    
    for (const playerData of players) {
        try {
            const player = await Player.create({
                ...playerData,
                department: departmentId
            });
            createdPlayers.push(player);
        } catch (err) {
            errors.push({
                studentId: playerData.studentId,
                error: err.message
            });
        }
    }
    
    res.status(201).json({
        success: true,
        created: createdPlayers.length,
        errors: errors.length,
        data: createdPlayers,
        errorDetails: errors
    });
});

/**
 * @desc    Delete player
 * @route   DELETE /api/players/:id
 * @access  Private
 */
const deletePlayer = asyncHandler(async (req, res) => {
    const player = await Player.findById(req.params.id);
    
    if (!player) {
        res.status(404);
        throw new Error('Player not found');
    }
    
    await player.deleteOne();
    
    res.json({
        success: true,
        message: 'Player deleted'
    });
});

module.exports = {
    createPlayer,
    getPlayers,
    getPlayersByDepartment,
    getPlayerById,
    updatePlayer,
    updatePlayerStats,
    getPlayerLeaderboard,
    bulkCreatePlayers,
    deletePlayer
};
