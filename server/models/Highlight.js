const mongoose = require('mongoose');

const highlightSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['reel', 'pic'],
        required: [true, 'Highlight type is required']
    },
    instagramUrl: {
        type: String,
        required: [true, 'Instagram URL is required']
    },
    caption: {
        type: String,
        default: '',
        maxlength: 500
    },
    date: {
        type: String, // 'YYYY-MM-DD' format
        required: [true, 'Date is required']
    }
}, {
    timestamps: true
});

// Only one reel and one pic per day
highlightSchema.index({ type: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Highlight', highlightSchema);
