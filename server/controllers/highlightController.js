const asyncHandler = require('express-async-handler');
const Highlight = require('../models/Highlight');
const path = require('path');

// @desc    Get all highlights (with optional filters)
// @route   GET /api/highlights
// @access  Public
const getHighlights = asyncHandler(async (req, res) => {
    const { type, limit = 20, page = 1, active } = req.query;

    const query = {};
    if (type) query.type = type;
    if (active !== undefined) query.isActive = active === 'true';

    const highlights = await Highlight.find(query)
        .populate('postedBy', 'name username')
        .sort({ date: -1, createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .lean();

    const total = await Highlight.countDocuments(query);

    // Cache public endpoints for 60 seconds (highlights don't change often)
    res.set('Cache-Control', 'public, max-age=60');
    res.json({
        success: true,
        count: highlights.length,
        total,
        data: highlights
    });
});

// @desc    Get today's highlights (latest reel + pic of the day)
// @route   GET /api/highlights/today
// @access  Public
const getTodayHighlights = asyncHandler(async (req, res) => {
    // Get the latest active reel and pic
    const [latestReel, latestPic] = await Promise.all([
        Highlight.findOne({ type: 'REEL_OF_THE_DAY', isActive: true })
            .populate('postedBy', 'name username')
            .sort({ date: -1 })
            .lean(),
        Highlight.findOne({ type: 'PIC_OF_THE_DAY', isActive: true })
            .populate('postedBy', 'name username')
            .sort({ date: -1 })
            .lean()
    ]);

    // Cache highlights for 5 minutes
    res.set('Cache-Control', 'public, max-age=300');
    res.json({
        success: true,
        data: {
            reelOfTheDay: latestReel || null,
            picOfTheDay: latestPic || null
        }
    });
});

// @desc    Get single highlight
// @route   GET /api/highlights/:id
// @access  Public
const getHighlight = asyncHandler(async (req, res) => {
    const highlight = await Highlight.findById(req.params.id)
        .populate('postedBy', 'name username')
        .lean();

    if (!highlight) {
        res.status(404);
        throw new Error('Highlight not found');
    }

    res.set('Cache-Control', 'public, max-age=300');
    res.json({ success: true, data: highlight });
});

// @desc    Create highlight (Reel or Pic of the day)
// @route   POST /api/highlights
// @access  Private (Admin)
const createHighlight = asyncHandler(async (req, res) => {
    const { type, title, description, videoUrl, imageUrl, date, sport, credit } = req.body;

    if (!type || !title) {
        res.status(400);
        throw new Error('Type and title are required');
    }

    const highlightData = {
        type,
        title,
        description: description || '',
        date: date || new Date(),
        sport: sport || 'GENERAL',
        credit: credit || '',
        postedBy: req.admin?._id || null
    };

    // Handle image upload for PIC_OF_THE_DAY
    if (req.file) {
        highlightData.imageUrl = `/uploads/${req.file.filename}`;
    } else if (imageUrl) {
        highlightData.imageUrl = imageUrl;
    }

    // Handle video URL for REEL_OF_THE_DAY
    if (videoUrl) {
        highlightData.videoUrl = videoUrl;
    }

    // Validation: PIC needs image, REEL needs video URL
    if (type === 'PIC_OF_THE_DAY' && !highlightData.imageUrl) {
        res.status(400);
        throw new Error('Image is required for Pic of the Day');
    }

    if (type === 'REEL_OF_THE_DAY' && !highlightData.videoUrl) {
        res.status(400);
        throw new Error('Video URL is required for Reel of the Day');
    }

    const highlight = await Highlight.create(highlightData);

    const populatedHighlight = await Highlight.findById(highlight._id)
        .populate('postedBy', 'name username')
        .lean();

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
        io.emit('highlightCreated', populatedHighlight);
    }

    res.status(201).json({
        success: true,
        data: populatedHighlight
    });
});

// @desc    Update highlight
// @route   PUT /api/highlights/:id
// @access  Private (Admin)
const updateHighlight = asyncHandler(async (req, res) => {
    const highlight = await Highlight.findById(req.params.id);

    if (!highlight) {
        res.status(404);
        throw new Error('Highlight not found');
    }

    const { type, title, description, videoUrl, imageUrl, date, sport, credit, isActive } = req.body;

    if (type !== undefined) highlight.type = type;
    if (title !== undefined) highlight.title = title;
    if (description !== undefined) highlight.description = description;
    if (videoUrl !== undefined) highlight.videoUrl = videoUrl;
    if (date !== undefined) highlight.date = date;
    if (sport !== undefined) highlight.sport = sport;
    if (credit !== undefined) highlight.credit = credit;
    if (isActive !== undefined) highlight.isActive = isActive;

    // Handle image upload or URL
    if (req.file) {
        highlight.imageUrl = `/uploads/${req.file.filename}`;
    } else if (imageUrl !== undefined) {
        highlight.imageUrl = imageUrl;
    }

    await highlight.save();

    const populatedHighlight = await Highlight.findById(highlight._id)
        .populate('postedBy', 'name username')
        .lean();

    const io = req.app.get('io');
    if (io) {
        io.emit('highlightUpdated', populatedHighlight);
    }

    res.json({ success: true, data: populatedHighlight });
});

// @desc    Delete highlight
// @route   DELETE /api/highlights/:id
// @access  Private (Admin)
const deleteHighlight = asyncHandler(async (req, res) => {
    const highlight = await Highlight.findById(req.params.id);

    if (!highlight) {
        res.status(404);
        throw new Error('Highlight not found');
    }

    await highlight.deleteOne();

    const io = req.app.get('io');
    if (io) {
        io.emit('highlightDeleted', { highlightId: req.params.id });
    }

    res.json({ success: true, message: 'Highlight deleted' });
});

module.exports = {
    getHighlights,
    getTodayHighlights,
    getHighlight,
    createHighlight,
    updateHighlight,
    deleteHighlight
};
