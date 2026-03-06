const mongoose = require('mongoose');

const highlightSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['reel', 'pic', 'article'],
        required: [true, 'Highlight type is required']
    },
    instagramUrl: {
        type: String,
        default: ''
    },
    caption: {
        type: String,
        default: '',
        maxlength: 500
    },
    // Article body text (only used when type === 'article')
    content: {
        type: String,
        default: '',
        maxlength: 10000
    },
    // Optional — which department won this highlight
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        default: null
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
