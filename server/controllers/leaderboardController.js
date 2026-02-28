const PointLog = require('../models/PointLog');
const Department = require('../models/Department');

// @desc    Award points to a department
// @route   POST /api/leaderboard/award
// @access  Private (Admin)
const awardPoints = async (req, res) => {
    try {
        const { department, eventName, category, position, points, description } = req.body;

        if (!department || !eventName || !category || points === undefined) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const log = await PointLog.create({
            department,
            eventName,
            category,
            position,
            points,
            description
        });

        res.status(201).json(log);
    } catch (error) {
        console.error('Error awarding points:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get current standings with history
// @route   GET /api/leaderboard
// @access  Public
const getStandings = async (req, res) => {
    try {
        console.log('📍 getStandings: Starting request');
        const startTime = Date.now();
        
        const standings = await PointLog.aggregate([
            {
                $group: {
                    _id: '$department',
                    points: { $sum: '$points' },
                    history: { $push: '$$ROOT' }
                }
            },
            {
                $lookup: {
                    from: 'departments',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'deptDetails'
                }
            },
            {
                $unwind: {
                    path: '$deptDetails',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $sort: { points: -1 }
            },
            {
                $project: {
                    _id: 1,
                    name: '$deptDetails.name',
                    shortCode: '$deptDetails.shortCode',
                    logo: '$deptDetails.logo',
                    points: 1,
                    history: 1
                }
            }
        ], { maxTimeMS: 10000 });

        const elapsed = Date.now() - startTime;
        console.log(`✅ getStandings: Fetched standings in ${elapsed}ms`);

        // Include departments with 0 points
        const allDepartments = await Department.find({});
        const standingsMap = new Map(standings.map(s => [s._id.toString(), s]));

        const finalStandings = [];
        for (const dept of allDepartments) {
            if (standingsMap.has(dept._id.toString())) {
                finalStandings.push(standingsMap.get(dept._id.toString()));
            } else {
                finalStandings.push({
                    _id: dept._id,
                    name: dept.name,
                    shortCode: dept.shortCode,
                    logo: dept.logo,
                    points: 0,
                    history: []
                });
            }
        }

        finalStandings.sort((a, b) => b.points - a.points);

        res.json({ 
            success: true, 
            count: finalStandings.length,
            data: finalStandings,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ getStandings Error:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
};

// @desc    Get standings with match statistics
// @route   GET /api/leaderboard/detailed
// @access  Public
const getDetailedStandings = async (req, res) => {
    try {
        const { Match } = require('../models/Match');
        
        // Get all departments
        const departments = await Department.find({});
        
        const standings = await Promise.all(departments.map(async (dept) => {
            // Get points from PointLog
            const pointLogs = await PointLog.find({ department: dept._id });
            const totalPoints = pointLogs.reduce((sum, log) => sum + log.points, 0);
            
            // Get match statistics
            const matchesAsTeamA = await Match.countDocuments({ teamA: dept._id, status: 'COMPLETED' });
            const matchesAsTeamB = await Match.countDocuments({ teamB: dept._id, status: 'COMPLETED' });
            const wins = await Match.countDocuments({ winner: dept._id, status: 'COMPLETED' });
            
            const totalMatches = matchesAsTeamA + matchesAsTeamB;
            const losses = totalMatches - wins;
            
            // Get wins by sport
            const sportWins = await Match.aggregate([
                { $match: { winner: dept._id, status: 'COMPLETED' } },
                { $group: { _id: '$sport', count: { $sum: 1 } } }
            ]);
            
            return {
                _id: dept._id,
                name: dept.name,
                shortCode: dept.shortCode,
                logo: dept.logo,
                points: totalPoints,
                matchesPlayed: totalMatches,
                wins,
                losses,
                winPercentage: totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0,
                sportWins: sportWins.reduce((acc, s) => { acc[s._id] = s.count; return acc; }, {}),
                history: pointLogs.slice(-10).reverse()
            };
        }));
        
        // Sort by points, then by wins
        standings.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.wins !== a.wins) return b.wins - a.wins;
            return b.winPercentage - a.winPercentage;
        });
        
        res.json({
            success: true,
            count: standings.length,
            data: standings,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ getDetailedStandings Error:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: error.message 
        });
    }
};

// @desc    Award points from match result (automated)
// @route   POST /api/leaderboard/award-from-match
// @access  Private
const awardPointsFromMatch = async (req, res) => {
    try {
        const { matchId } = req.body;
        const { Match } = require('../models/Match');
        const ScoringPreset = require('../models/ScoringPreset');
        
        const match = await Match.findById(matchId)
            .populate('teamA', 'name shortCode')
            .populate('teamB', 'name shortCode')
            .populate('winner', 'name shortCode');
        
        if (!match) {
            return res.status(404).json({ message: 'Match not found' });
        }
        
        if (match.status !== 'COMPLETED') {
            return res.status(400).json({ message: 'Match is not completed' });
        }
        
        // Get scoring preset
        const preset = await ScoringPreset.findOne({
            sport: match.sport,
            isDefault: true,
            isActive: true
        });
        
        if (!preset) {
            return res.status(400).json({ 
                message: 'No scoring preset found for this sport',
                sport: match.sport 
            });
        }
        
        // Calculate points
        const matchCategoryKey = (match.matchCategory || 'REGULAR').toLowerCase();
        const multiplier = preset.matchTypeMultipliers?.[matchCategoryKey] || 1;
        const isDraw = !match.winner;
        
        const logs = [];
        
        if (isDraw) {
            // Award draw points to both
            const drawPoints = Math.round(preset.drawPoints * multiplier);
            
            logs.push(await PointLog.create({
                department: match.teamA._id,
                eventName: `${match.sport} - ${match.matchCategory || 'Match'}`,
                category: 'Sports',
                position: 'Draw',
                points: drawPoints,
                description: `Draw vs ${match.teamB.shortCode}`
            }));
            
            logs.push(await PointLog.create({
                department: match.teamB._id,
                eventName: `${match.sport} - ${match.matchCategory || 'Match'}`,
                category: 'Sports',
                position: 'Draw',
                points: drawPoints,
                description: `Draw vs ${match.teamA.shortCode}`
            }));
        } else {
            // Calculate score difference for bonus (scores are now strings like "156/4" or "3-1")
            let scoreDiff = 0;
            if (match.scoreA && match.scoreB) {
                // Try to extract numeric scores for comparison
                const numA = parseInt(match.scoreA) || 0;
                const numB = parseInt(match.scoreB) || 0;
                scoreDiff = Math.abs(numA - numB);
            }
            
            let winPoints = Math.round(preset.winPoints * multiplier);
            let lossPoints = Math.round(preset.lossPoints * multiplier);
            
            // Add bonus for dominant victory
            if (preset.bonusPoints && preset.dominantVictoryMargin) {
                if (scoreDiff >= preset.dominantVictoryMargin) {
                    winPoints += preset.bonusPoints;
                }
            }
            
            const loser = match.winner._id.toString() === match.teamA._id.toString() 
                ? match.teamB : match.teamA;
            
            // Award winner points
            logs.push(await PointLog.create({
                department: match.winner._id,
                eventName: `${match.sport} - ${match.matchCategory || 'Match'}`,
                category: 'Sports',
                position: 'Winner',
                points: winPoints,
                description: `Won vs ${loser.shortCode}`
            }));
            
            // Award loser points (if any)
            if (lossPoints !== 0) {
                logs.push(await PointLog.create({
                    department: loser._id,
                    eventName: `${match.sport} - ${match.matchCategory || 'Match'}`,
                    category: 'Sports',
                    position: 'Loser',
                    points: lossPoints,
                    description: `Lost to ${match.winner.shortCode}`
                }));
            }
        }
        
        // Emit real-time update
        const io = req.app.get('io');
        if (io) {
            io.emit('pointsAwarded', { matchId, logs });
        }
        
        res.json({
            success: true,
            message: 'Points awarded from match',
            data: logs
        });
    } catch (error) {
        console.error('Error awarding points from match:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset entire leaderboard
// @route   POST /api/leaderboard/reset
// @access  Private (Admin)
const resetLeaderboard = async (req, res) => {
    try {
        // Check if user is super_admin
        if (req.admin?.role !== 'super_admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Only super admin can reset the leaderboard' 
            });
        }
        
        await PointLog.deleteMany({});
        const io = req.app.get('io');
        if (io) {
            io.emit('leaderboardReset');
        }
        res.json({ success: true, message: 'Leaderboard reset successfully' });
    } catch (error) {
        console.error('Error resetting leaderboard:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Undo last point award
// @route   POST /api/leaderboard/undo-last
// @access  Private (Admin)
const undoLastAward = async (req, res) => {
    try {
        const lastLog = await PointLog.findOne().sort({ createdAt: -1 });
        
        if (!lastLog) {
            return res.status(400).json({ success: false, message: 'No awards to undo' });
        }

        await PointLog.findByIdAndDelete(lastLog._id);
        
        const io = req.app.get('io');
        if (io) {
            io.emit('pointsAwarded');
        }

        res.json({ success: true, message: 'Last award undone', data: lastLog });
    } catch (error) {
        console.error('Error undoing award:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Delete all points for a department
// @route   DELETE /api/leaderboard/department/:deptId
// @access  Private (Admin)
const clearDepartmentPoints = async (req, res) => {
    try {
        const { deptId } = req.params;

        const result = await PointLog.deleteMany({ department: deptId });

        const io = req.app.get('io');
        if (io) {
            io.emit('pointsAwarded');
        }

        res.json({ success: true, message: 'Department points cleared', deletedCount: result.deletedCount });
    } catch (error) {
        console.error('Error clearing points:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get point history for a specific department
// @route   GET /api/leaderboard/department/:deptId/history
// @access  Public
const getDepartmentHistory = async (req, res) => {
    try {
        const { deptId } = req.params;
        const { limit = 20, page = 1 } = req.query;
        
        const logs = await PointLog.find({ department: deptId })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));
        
        const total = await PointLog.countDocuments({ department: deptId });
        const totalPoints = await PointLog.aggregate([
            { $match: { department: require('mongoose').Types.ObjectId(deptId) } },
            { $group: { _id: null, total: { $sum: '$points' } } }
        ]);
        
        res.json({
            success: true,
            count: logs.length,
            total,
            totalPoints: totalPoints[0]?.total || 0,
            data: logs
        });
    } catch (error) {
        console.error('Error getting department history:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    awardPoints,
    getStandings,
    getDetailedStandings,
    awardPointsFromMatch,
    resetLeaderboard,
    undoLastAward,
    clearDepartmentPoints,
    getDepartmentHistory
};
