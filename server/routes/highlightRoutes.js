const express = require('express');
const router = express.Router();
const Highlight = require('../models/Highlight');
const { protect } = require('../middleware/authMiddleware');

// GET all highlights (admin listing — no date filter)
router.get('/', async (req, res) => {
    try {
        const { date } = req.query;
        const query = date ? { date } : {};
        const highlights = await Highlight.find(query).sort({ date: -1, type: 1 });
        res.json({ success: true, data: highlights });
    } catch (err) {
        console.error('❌ GET /highlights error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET today's highlights (for public home page)
router.get('/today', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        const [reel, pic] = await Promise.all([
            Highlight.findOne({ type: 'reel', date: today }).lean(),
            Highlight.findOne({ type: 'pic', date: today }).lean()
        ]);

        res.json({
            success: true,
            data: {
                reelOfTheDay: reel || null,
                picOfTheDay: pic || null
            }
        });
    } catch (err) {
        console.error('❌ GET /highlights/today error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET all available dates that have highlights (public)
router.get('/dates', async (req, res) => {
    try {
        const dates = await Highlight.distinct('date');
        dates.sort((a, b) => b.localeCompare(a)); // newest first
        res.json(dates);
    } catch (err) {
        console.error('❌ GET /highlights/dates error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// POST create highlight (admin only)
router.post('/', protect, async (req, res) => {
    try {
        const { type, instagramUrl, caption, date } = req.body;

        console.log('📝 Create highlight request body:', req.body);

        if (!type || !instagramUrl || !date) {
            return res.status(400).json({
                message: 'type, instagramUrl and date are required',
                received: { type, instagramUrl: !!instagramUrl, date }
            });
        }

        // Validate type
        if (!['reel', 'pic'].includes(type)) {
            return res.status(400).json({
                message: `Invalid type "${type}". Must be "reel" or "pic".`
            });
        }

        // Validate date format (YYYY-MM-DD)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({
                message: `Invalid date format "${date}". Must be YYYY-MM-DD.`
            });
        }

        // Check if a highlight of this type already exists for this date
        const existing = await Highlight.findOne({ type, date });
        if (existing) {
            return res.status(409).json({
                message: `A ${type === 'reel' ? 'Reel' : 'Pic'} of the Day already exists for ${date}. Delete it first to upload a new one.`
            });
        }

        const highlight = new Highlight({
            type,
            instagramUrl: instagramUrl.trim(),
            caption: caption || '',
            date
        });
        await highlight.save();

        // Emit socket event if available
        const io = req.app.get('io');
        if (io) {
            io.emit('highlightCreated', highlight);
        }

        res.status(201).json({ success: true, data: highlight });
    } catch (err) {
        console.error('❌ POST /highlights error:', err);
        if (err.code === 11000) {
            return res.status(409).json({ message: 'A highlight of this type already exists for this date.' });
        }
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// DELETE highlight (admin only)
router.delete('/:id', protect, async (req, res) => {
    try {
        const highlight = await Highlight.findByIdAndDelete(req.params.id);
        if (!highlight) {
            return res.status(404).json({ message: 'Highlight not found' });
        }

        const io = req.app.get('io');
        if (io) {
            io.emit('highlightDeleted', { highlightId: req.params.id });
        }

        res.json({ success: true, message: 'Highlight deleted' });
    } catch (err) {
        console.error('❌ DELETE /highlights error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
