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
    const { Match: MatchModel, SPORTS, MATCH_STATUS } = require('../models/Match');
    const mongoose = require('mongoose');

    const { 
        sport, status, limit: rawLimit = '50', page: rawPage = '1',
        season, department, startDate, endDate,
        matchType, search, tags, venue,
        cursor // cursor-based pagination: pass last match _id
    } = req.query;

    // ── Input Sanitization ──
    // Clamp limit to prevent abuse (max 100 per page)
    const limit = Math.min(Math.max(parseInt(rawLimit) || 50, 1), 100);
    const page = Math.max(parseInt(rawPage) || 1, 1);

    // Escape regex special characters to prevent ReDoS attacks
    const escapeRegex = (str) => {
        if (typeof str !== 'string') return '';
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').substring(0, 200);
    };

    // Validate ObjectId strings to prevent NoSQL injection
    const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === String(id);

    const query = {};

    // ── Enum Whitelist Validation (prevents operator injection) ──
    if (sport) {
        const sportUpper = String(sport).toUpperCase();
        if (SPORTS.includes(sportUpper)) {
            query.sport = sportUpper;
        }
    }
    if (status) {
        const statusUpper = String(status).toUpperCase();
        if (MATCH_STATUS.includes(statusUpper)) {
            query.status = statusUpper;
        }
    }
    if (season && isValidObjectId(String(season))) {
        query.season = new mongoose.Types.ObjectId(String(season));
    }
    if (department && isValidObjectId(String(department))) {
        query.$or = [
            { teamA: new mongoose.Types.ObjectId(String(department)) },
            { teamB: new mongoose.Types.ObjectId(String(department)) }
        ];
    }
    if (startDate || endDate) {
        query.scheduledAt = {};
        if (startDate) {
            const sd = new Date(startDate);
            if (!isNaN(sd.getTime())) query.scheduledAt.$gte = sd;
        }
        if (endDate) {
            const ed = new Date(endDate);
            if (!isNaN(ed.getTime())) query.scheduledAt.$lte = ed;
        }
        // Remove empty scheduledAt filter
        if (Object.keys(query.scheduledAt).length === 0) delete query.scheduledAt;
    }
    if (matchType) {
        const mtUpper = String(matchType).toUpperCase();
        const VALID_CATEGORIES = ['REGULAR', 'SEMIFINAL', 'FINAL', 'QUARTER_FINAL', 'GROUP_STAGE'];
        if (VALID_CATEGORIES.includes(mtUpper)) {
            query.matchCategory = mtUpper;
        }
    }
    if (venue) {
        query.venue = { $regex: escapeRegex(String(venue)), $options: 'i' };
    }
    if (tags) {
        // Sanitize each tag as a plain string
        const tagArray = (Array.isArray(tags) ? tags : [tags])
            .map(t => String(t).trim().substring(0, 100))
            .filter(Boolean);
        if (tagArray.length > 0) {
            query.tags = { $in: tagArray };
        }
    }
    if (search) {
        const safeSearch = escapeRegex(String(search));
        if (safeSearch.length > 0) {
            const searchConditions = [
                { venue: { $regex: safeSearch, $options: 'i' } },
                { summary: { $regex: safeSearch, $options: 'i' } },
                { tags: { $in: [String(search).trim().substring(0, 200)] } }
            ];
            // Merge with existing $or (department filter) using $and
            if (query.$or) {
                query.$and = [
                    { $or: query.$or },
                    { $or: searchConditions }
                ];
                delete query.$or;
            } else {
                query.$or = searchConditions;
            }
        }
    }

    // ── Cursor-based pagination (for large datasets) ──
    if (cursor && isValidObjectId(String(cursor))) {
        query._id = { $lt: new mongoose.Types.ObjectId(String(cursor)) };
    }

    // ── Query Execution ──
    // Use lean() for read-only performance, select only needed fields
    const [matches, total] = await Promise.all([
        Match.find(query)
            .populate('teamA', 'name shortCode logo')
            .populate('teamB', 'name shortCode logo')
            .populate('winner', 'name shortCode logo')
            .populate('season', 'name year')
            .select('-managedBy -__v') // Exclude sensitive/internal fields
            .sort({ scheduledAt: -1, _id: -1 })
            .limit(limit)
            .skip(cursor ? 0 : (page - 1) * limit) // skip only for offset mode
            .lean(),
        cursor ? null : Match.countDocuments(query) // skip count for cursor mode
    ]);

    // Cache public endpoints for 30 seconds
    res.set('Cache-Control', 'public, max-age=30');

    const response = {
        success: true,
        count: matches.length,
        data: matches
    };

    if (cursor) {
        // Cursor mode: return nextCursor for infinite scroll
        response.nextCursor = matches.length === limit ? matches[matches.length - 1]._id : null;
    } else {
        // Offset mode: return pagination info
        response.total = total;
        response.page = page;
        response.pages = Math.ceil(total / limit);
    }

    res.json(response);
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
    const { scoreA, scoreB, winner, status, summary, venue, scheduledAt, matchCategory, notes, tags, _expectedVersion } = req.body;

    // ── Optimistic Concurrency Control ──
    // If client sends _expectedVersion (updatedAt timestamp), verify no one else modified the match
    const findQuery = { _id: req.params.id };
    if (_expectedVersion) {
        findQuery.updatedAt = new Date(_expectedVersion);
    }

    const match = await Match.findOne(findQuery);

    if (!match) {
        // Distinguish between "not found" and "conflict"
        const exists = await Match.findById(req.params.id).lean();
        if (exists && _expectedVersion) {
            res.status(409);
            throw new Error('Conflict: This match was modified by another admin. Please refresh and try again.');
        }
        res.status(404);
        throw new Error('Match not found');
    }

    // ── Whitelist allowed fields with validation ──
    if (scoreA !== undefined) match.scoreA = String(scoreA).substring(0, 50);
    if (scoreB !== undefined) match.scoreB = String(scoreB).substring(0, 50);
    if (winner !== undefined) match.winner = winner || null;
    if (status) match.status = status;
    if (summary !== undefined) match.summary = String(summary).substring(0, 1000);
    if (venue !== undefined) match.venue = String(venue).substring(0, 200);
    if (scheduledAt !== undefined) match.scheduledAt = scheduledAt;
    if (matchCategory) match.matchCategory = matchCategory;
    if (notes !== undefined) match.notes = String(notes).substring(0, 2000);
    if (tags) match.tags = (Array.isArray(tags) ? tags : []).map(t => String(t).trim().substring(0, 50)).slice(0, 20);

    await match.save();

    const populatedMatch = await Match.findById(match._id)
        .populate('teamA', 'name shortCode logo')
        .populate('teamB', 'name shortCode logo')
        .populate('winner', 'name shortCode logo')
        .select('-managedBy -__v')
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
