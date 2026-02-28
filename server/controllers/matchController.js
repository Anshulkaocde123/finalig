const asyncHandler = require('express-async-handler');
const { Match } = require('../models/Match');

// @desc    Create a new match
// @route   POST /api/matches
// @access  Private (Admin)
const createMatch = asyncHandler(async (req, res) => {
    const { sport, teamA, teamB, scheduledAt, venue, matchCategory, notes, tags } = req.body;

    if (!sport || !teamA || !teamB) {
        res.status(400);
        throw new Error('Sport, teamA, and teamB are required');
    }

    if (teamA === teamB) {
        res.status(400);
        throw new Error('A team cannot play against itself');
    }

    const match = await Match.create({
        sport: sport.toUpperCase(),
        teamA,
        teamB,
        scheduledAt,
        venue: venue || '',
        matchCategory: matchCategory || 'REGULAR',
        notes: notes || '',
        tags: tags || [],
        managedBy: req.admin?._id || null
    });

    const populatedMatch = await Match.findById(match._id)
        .populate('teamA', 'name shortCode logo')
        .populate('teamB', 'name shortCode logo')
        .lean();

    const io = req.app.get('io');
    if (io) {
        io.emit('matchCreated', populatedMatch);
    }

    res.status(201).json({
        success: true,
        data: populatedMatch
    });
});

// @desc    Get all matches
// @route   GET /api/matches
// @access  Public
const getAllMatches = asyncHandler(async (req, res) => {
    const { 
        sport, status, limit = 50, page = 1,
        season, department, startDate, endDate,
        matchType, search, tags, venue
    } = req.query;

    const query = {};
    if (sport) query.sport = sport.toUpperCase();
    if (status) query.status = status.toUpperCase();
    if (season) query.season = season;
    if (department) {
        query.$or = [{ teamA: department }, { teamB: department }];
    }
    if (startDate || endDate) {
        query.scheduledAt = {};
        if (startDate) query.scheduledAt.$gte = new Date(startDate);
        if (endDate) query.scheduledAt.$lte = new Date(endDate);
    }
    if (matchType) query.matchCategory = matchType.toUpperCase();
    if (venue) query.venue = { $regex: venue, $options: 'i' };
    if (tags) {
        const tagArray = Array.isArray(tags) ? tags : [tags];
        query.tags = { $in: tagArray };
    }
    if (search) {
        const searchConditions = [
            { venue: { $regex: search, $options: 'i' } },
            { summary: { $regex: search, $options: 'i' } },
            { tags: { $in: [search] } }
        ];
        query.$or = query.$or ? [...query.$or, ...searchConditions] : searchConditions;
    }

    const matches = await Match.find(query)
        .populate('teamA', 'name shortCode logo')
        .populate('teamB', 'name shortCode logo')
        .populate('winner', 'name shortCode logo')
        .populate('season', 'name year')
        .sort({ scheduledAt: -1, createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .lean();

    const total = await Match.countDocuments(query);

    // Cache public endpoints for 30 seconds
    res.set('Cache-Control', 'public, max-age=30');
    res.json({
        success: true,
        count: matches.length,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        data: matches
    });
});

// @desc    Get single match
// @route   GET /api/matches/:id
// @access  Public
const getMatch = asyncHandler(async (req, res) => {
    const match = await Match.findById(req.params.id)
        .populate('teamA', 'name shortCode logo')
        .populate('teamB', 'name shortCode logo')
        .populate('winner', 'name shortCode logo')
        .populate('season', 'name year')
        .lean();

    if (!match) {
        res.status(404);
        throw new Error('Match not found');
    }

    // Cache public endpoints for 30 seconds
    res.set('Cache-Control', 'public, max-age=30');
    res.json({ success: true, data: match });
});

// @desc    Update match result (scores, winner, status)
// @route   PUT /api/matches/:id
// @access  Private (Admin)
const updateMatch = asyncHandler(async (req, res) => {
    const match = await Match.findById(req.params.id);

    if (!match) {
        res.status(404);
        throw new Error('Match not found');
    }

    const { scoreA, scoreB, winner, status, summary, venue, scheduledAt, matchCategory, notes, tags } = req.body;

    // Update fields if provided
    if (scoreA !== undefined) match.scoreA = scoreA;
    if (scoreB !== undefined) match.scoreB = scoreB;
    if (winner !== undefined) match.winner = winner || null;
    if (status) match.status = status;
    if (summary !== undefined) match.summary = summary;
    if (venue !== undefined) match.venue = venue;
    if (scheduledAt !== undefined) match.scheduledAt = scheduledAt;
    if (matchCategory) match.matchCategory = matchCategory;
    if (notes !== undefined) match.notes = notes;
    if (tags) match.tags = tags;

    // If marking as completed with scores but no explicit winner
    if (status === 'COMPLETED' && !winner && !match.winner) {
        // Admin should explicitly set winner, but we leave it null for draws
    }

    await match.save();

    const populatedMatch = await Match.findById(match._id)
        .populate('teamA', 'name shortCode logo')
        .populate('teamB', 'name shortCode logo')
        .populate('winner', 'name shortCode logo')
        .lean();

    const io = req.app.get('io');
    if (io) {
        io.emit('matchUpdate', populatedMatch);
    }

    res.json({ success: true, data: populatedMatch });
});

// @desc    Delete match
// @route   DELETE /api/matches/:id
// @access  Private (Admin)
const deleteMatch = asyncHandler(async (req, res) => {
    const match = await Match.findById(req.params.id);

    if (!match) {
        res.status(404);
        throw new Error('Match not found');
    }

    await match.deleteOne();

    const io = req.app.get('io');
    if (io) {
        io.emit('matchDeleted', { matchId: req.params.id });
    }

    res.json({ success: true, message: 'Match deleted successfully' });
});

module.exports = {
    createMatch,
    getAllMatches,
    getMatch,
    updateMatch,
    deleteMatch
};
