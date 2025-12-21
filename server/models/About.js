const mongoose = require('mongoose');

const aboutSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        default: 'About VNIT Inter-Department Games'
    },
    description: {
        type: String,
        required: true
    },
    missionStatement: {
        type: String,
        required: false
    },
    visionStatement: {
        type: String,
        required: false
    },
    history: {
        type: String,
        required: false
    },
    highlights: [{
        title: String,
        description: String
    }],
    logoUrl: {
        type: String,
        required: false
    },
    bannerUrl: {
        type: String,
        required: false
    },
    contactEmail: {
        type: String,
        required: false
    },
    contactPhone: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('About', aboutSchema);
