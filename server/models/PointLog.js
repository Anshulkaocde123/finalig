const mongoose = require('mongoose');

const pointLogSchema = new mongoose.Schema({
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    eventName: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Sports', 'Cultural', 'Literary', 'Technical', 'Arts', 'Other']
    },
    position: {
        type: String,
        required: false
    },
    points: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    awardedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('PointLog', pointLogSchema);
