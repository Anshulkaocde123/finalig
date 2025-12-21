const mongoose = require('mongoose');

const seasonSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Season name is required'],
        unique: true,
        trim: true
    },
    year: {
        type: Number,
        required: [true, 'Year is required']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required']
    },
    description: {
        type: String,
        default: ''
    },
    archivedAt: {
        type: Date,
        default: null
    },
    archiveReason: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Ensure end date is after start date
seasonSchema.pre('save', async function() {
    if (this.endDate <= this.startDate) {
        throw new Error('End date must be after start date');
    }
});

module.exports = mongoose.model('Season', seasonSchema);
