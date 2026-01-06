const mongoose = require('mongoose');

/**
 * Player Schema - For tracking individual players in matches
 * Particularly useful for cricket scoreboard with batting/bowling details
 */
const playerSchema = new mongoose.Schema({
    // Student Information (VNIT specific)
    studentId: {
        type: String,
        required: [true, 'Student ID is required'],
        match: [/^\d{5}$/, 'Student ID must be a 5-digit number'],
        index: true
    },
    name: {
        type: String,
        required: [true, 'Player name is required'],
        trim: true
    },
    email: {
        type: String,
        lowercase: true,
        match: [/^[a-z]{2}\d{2}[a-z]{3}\d{3}@students\.vnit\.ac\.in$/, 'Email must be a valid VNIT student email']
    },
    
    // Department/Team affiliation
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: [true, 'Department is required']
    },
    
    // Player Position/Role
    position: {
        type: String,
        enum: ['BATSMAN', 'BOWLER', 'ALL_ROUNDER', 'WICKET_KEEPER', 'STRIKER', 'MIDFIELDER', 'DEFENDER', 'GOALKEEPER', 'GENERAL'],
        default: 'GENERAL'
    },
    
    // Jersey/Player Number
    jerseyNumber: {
        type: Number,
        min: 1,
        max: 99
    },
    
    // Profile photo
    photo: {
        type: String,
        default: ''
    },
    
    // Season-specific stats
    seasonStats: [{
        season: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Season'
        },
        sport: String,
        matchesPlayed: { type: Number, default: 0 },
        // Cricket specific
        runsScored: { type: Number, default: 0 },
        ballsFaced: { type: Number, default: 0 },
        wicketsTaken: { type: Number, default: 0 },
        oversBowled: { type: Number, default: 0 },
        runsConceded: { type: Number, default: 0 },
        catches: { type: Number, default: 0 },
        stumpings: { type: Number, default: 0 },
        // Football specific
        goals: { type: Number, default: 0 },
        assists: { type: Number, default: 0 },
        yellowCards: { type: Number, default: 0 },
        redCards: { type: Number, default: 0 },
        // General
        points: { type: Number, default: 0 }
    }],
    
    // Active status
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Create compound index for unique player per department
playerSchema.index({ studentId: 1, department: 1 }, { unique: true });

module.exports = mongoose.model('Player', playerSchema);
