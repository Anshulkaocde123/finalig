const Season = require('../models/Season');
const Match = require('../models/Match').Match;

// @desc    Create a new season
// @route   POST /api/seasons
// @access  Private
const createSeason = async (req, res) => {
    try {
        const { name, year, startDate, endDate, description } = req.body;

        // Validate dates
        if (new Date(endDate) <= new Date(startDate)) {
            return res.status(400).json({ message: 'End date must be after start date' });
        }

        // Deactivate all other seasons
        await Season.updateMany({ isActive: true }, { isActive: false });

        const season = await Season.create({
            name,
            year,
            startDate,
            endDate,
            description,
            isActive: true
        });

        res.status(201).json({
            success: true,
            data: season
        });
    } catch (error) {
        console.error('Season creation error:', error);
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all seasons
// @route   GET /api/seasons
// @access  Public
const getSeasons = async (req, res) => {
    try {
        console.log('📍 getSeasons: Starting request');
        const startTime = Date.now();
        const { active } = req.query;
        let query = {};

        if (active === 'true') {
            query.isActive = true;
        }

        const seasons = await Season.find(query).sort({ createdAt: -1 }).lean();

        const elapsed = Date.now() - startTime;
        console.log(`✅ getSeasons: Fetched ${seasons.length} seasons in ${elapsed}ms`);

        res.json({
            success: true,
            count: seasons.length,
            data: seasons,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ getSeasons Error:', error.message);
        res.status(500).json({ 
            success: false,
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
};

// @desc    Get active season
// @route   GET /api/seasons/active
// @access  Public
const getActiveSeason = async (req, res) => {
    try {
        const season = await Season.findOne({ isActive: true });

        if (!season) {
            return res.status(404).json({ message: 'No active season found' });
        }

        res.json({
            success: true,
            data: season
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get season by ID
// @route   GET /api/seasons/:id
// @access  Public
const getSeason = async (req, res) => {
    try {
        const season = await Season.findById(req.params.id);

        if (!season) {
            return res.status(404).json({ message: 'Season not found' });
        }

        res.json({
            success: true,
            data: season
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update season
// @route   PUT /api/seasons/:id
// @access  Private
const updateSeason = async (req, res) => {
    try {
        const { name, startDate, endDate, description, isActive } = req.body;

        let season = await Season.findById(req.params.id);

        if (!season) {
            return res.status(404).json({ message: 'Season not found' });
        }

        // If activating, deactivate all others
        if (isActive && !season.isActive) {
            await Season.updateMany({ _id: { $ne: req.params.id } }, { isActive: false });
        }

        season.name = name || season.name;
        season.startDate = startDate || season.startDate;
        season.endDate = endDate || season.endDate;
        season.description = description || season.description;
        season.isActive = isActive !== undefined ? isActive : season.isActive;

        await season.save();

        res.json({
            success: true,
            data: season
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Archive season
// @route   POST /api/seasons/:id/archive
// @access  Private
const archiveSeason = async (req, res) => {
    try {
        const { reason } = req.body;

        let season = await Season.findById(req.params.id);

        if (!season) {
            return res.status(404).json({ message: 'Season not found' });
        }

        season.isActive = false;
        season.archivedAt = new Date();
        season.archiveReason = reason || '';

        await season.save();

        res.json({
            success: true,
            message: 'Season archived successfully',
            data: season
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get season statistics
// @route   GET /api/seasons/:id/stats
// @access  Public
const getSeasonStats = async (req, res) => {
    try {
        const season = await Season.findById(req.params.id);

        if (!season) {
            return res.status(404).json({ message: 'Season not found' });
        }

        const matches = await Match.find({
            season: req.params.id
        }).populate('teamA teamB winner');

        const stats = {
            totalMatches: matches.length,
            completedMatches: matches.filter(m => m.status === 'COMPLETED').length,
            liveMatches: matches.filter(m => m.status === 'LIVE').length,
            scheduledMatches: matches.filter(m => m.status === 'SCHEDULED').length,
            byDepartment: {}
        };

        // Calculate stats by department
        matches.forEach(match => {
            const teamAId = match.teamA._id.toString();
            const teamBId = match.teamB._id.toString();

            if (!stats.byDepartment[teamAId]) {
                stats.byDepartment[teamAId] = { 
                    name: match.teamA.name, 
                    matches: 0, 
                    wins: 0, 
                    losses: 0 
                };
            }
            if (!stats.byDepartment[teamBId]) {
                stats.byDepartment[teamBId] = { 
                    name: match.teamB.name, 
                    matches: 0, 
                    wins: 0, 
                    losses: 0 
                };
            }

            stats.byDepartment[teamAId].matches++;
            stats.byDepartment[teamBId].matches++;

            if (match.status === 'COMPLETED' && match.winner) {
                if (match.winner._id.toString() === teamAId) {
                    stats.byDepartment[teamAId].wins++;
                    stats.byDepartment[teamBId].losses++;
                } else {
                    stats.byDepartment[teamBId].wins++;
                    stats.byDepartment[teamAId].losses++;
                }
            }
        });

        res.json({
            success: true,
            data: {
                season,
                stats
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createSeason,
    getSeasons,
    getActiveSeason,
    getSeason,
    updateSeason,
    archiveSeason,
    getSeasonStats
};
