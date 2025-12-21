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
                    points: 1,
                    history: 1
                }
            }
        ]);

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
                    points: 0,
                    history: []
                });
            }
        }

        finalStandings.sort((a, b) => b.points - a.points);

        res.json({ success: true, data: finalStandings });
    } catch (error) {
        console.error('Error fetching standings:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Reset entire leaderboard
// @route   POST /api/leaderboard/reset
// @access  Private (Admin)
const resetLeaderboard = async (req, res) => {
    try {
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

module.exports = {
    awardPoints,
    getStandings,
    resetLeaderboard,
    undoLastAward,
    clearDepartmentPoints
};
