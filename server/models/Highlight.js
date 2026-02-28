const mongoose = require('mongoose');

const highlightSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['REEL_OF_THE_DAY', 'PIC_OF_THE_DAY'],
        required: [true, 'Highlight type is required']
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        default: '',
        maxlength: 500
    },
    // For PIC_OF_THE_DAY - image file uploaded via multer
    imageUrl: {
        type: String,
        default: ''
    },
    // For REEL_OF_THE_DAY - external video URL (YouTube, Instagram, etc.)
    videoUrl: {
        type: String,
        default: ''
    },
    // The date this highlight is for
    date: {
        type: Date,
        required: [true, 'Date is required'],
        default: Date.now
    },
    sport: {
        type: String,
        enum: ['CRICKET', 'BADMINTON', 'TABLE_TENNIS', 'VOLLEYBALL', 'FOOTBALL', 'HOCKEY', 'BASKETBALL', 'KHOKHO', 'KABADDI', 'CHESS', 'GENERAL', ''],
        default: 'GENERAL'
    },
    // Credit/attribution
    credit: {
        type: String,
        default: '',
        maxlength: 100
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // Who posted this
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        default: null
    }
}, {
    timestamps: true
});

// Index for efficient querying
highlightSchema.index({ type: 1, date: -1 });
highlightSchema.index({ isActive: 1, date: -1 });

module.exports = mongoose.model('Highlight', highlightSchema);
