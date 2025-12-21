const asyncHandler = require('express-async-handler');
const { Match } = require('../models/Match');

/**
 * @desc    Get all matches with advanced filtering and search
 * @route   GET /api/matches
 * @access  Public
 * @query   sport, status, limit, page, season, department, startDate, endDate, matchType, search, tags, venue
 */
const getAllMatches = asyncHandler(async (req, res) => {
    const { 
        sport, 
        status, 
        limit = 50, 
        page = 1,
        season,
        department,
        startDate,
        endDate,
        matchType,
        search,
        tags,
        venue
    } = req.query;

    const query = {};

    // Sport filter
    if (sport) {
        query.sport = sport.toUpperCase();
    }

    // Status filter
    if (status) {
        query.status = status.toUpperCase();
    }

    // Season filter
    if (season) {
        query.season = season;
    }

    // Department filter (search in either team)
    if (department) {
        query.$or = [
            { teamA: department },
            { teamB: department }
        ];
    }

    // Date range filter
    if (startDate || endDate) {
        query.scheduledAt = {};
        if (startDate) {
            query.scheduledAt.$gte = new Date(startDate);
        }
        if (endDate) {
            query.scheduledAt.$lte = new Date(endDate);
        }
    }

    // Match type filter (REGULAR, SEMIFINAL, FINAL)
    if (matchType) {
        query.matchType = matchType.toUpperCase();
    }

    // Venue filter
    if (venue) {
        query.venue = { $regex: venue, $options: 'i' };
    }

    // Tags filter
    if (tags) {
        const tagArray = Array.isArray(tags) ? tags : [tags];
        query.tags = { $in: tagArray };
    }

    // Text search in venue and tags
    if (search) {
        query.$or = query.$or ? [...query.$or, 
            { venue: { $regex: search, $options: 'i' } },
            { tags: { $in: [search] } }
        ] : [
            { venue: { $regex: search, $options: 'i' } },
            { tags: { $in: [search] } }
        ];
    }

    const matches = await Match.find(query)
        .populate('teamA', 'name shortCode logo')
        .populate('teamB', 'name shortCode logo')
        .populate('winner', 'name shortCode logo')
        .populate('season', 'name year')
        .sort({ scheduledAt: -1, createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Match.countDocuments(query);

    res.status(200).json({
        success: true,
        count: matches.length,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        data: matches
    });
});

/**
 * @desc    Delete a match
 * @route   DELETE /api/matches/:id
 * @access  Public
 */
const deleteMatch = asyncHandler(async (req, res) => {
    const match = await Match.findById(req.params.id);

    if (!match) {
        res.status(404);
        throw new Error('Match not found');
    }

    await match.deleteOne();

    // Emit real-time delete event
    const io = req.app.get('io');
    if (io) {
        io.emit('matchDeleted', { matchId: req.params.id });
    }

    res.status(200).json({
        success: true,
        message: 'Match deleted successfully'
    });
});

module.exports = {
    getAllMatches,
    deleteMatch
};
