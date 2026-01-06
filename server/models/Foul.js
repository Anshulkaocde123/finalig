const mongoose = require('mongoose');

/**
 * Foul/Card Schema - For tracking disciplinary actions
 * Supports yellow cards, red cards, fouls, penalties across sports
 */
const foulSchema = new mongoose.Schema({
    // Match reference
    match: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match',
        required: true,
        index: true
    },
    
    // Team that committed the foul
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    
    // Player who committed the foul (optional - may not track individual)
    player: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
        default: null
    },
    
    // Player name (if player not registered)
    playerName: {
        type: String,
        default: ''
    },
    
    // Type of foul/card
    foulType: {
        type: String,
        required: true,
        enum: [
            // Football/Hockey
            'YELLOW_CARD',
            'RED_CARD',
            'PENALTY',
            'FREE_KICK',
            'OFFSIDE',
            
            // Basketball
            'PERSONAL_FOUL',
            'TECHNICAL_FOUL',
            'FLAGRANT_FOUL',
            
            // Cricket
            'WIDE',
            'NO_BALL',
            'LEG_BYE',
            'BYE',
            'DEAD_BALL',
            'OBSTRUCTION',
            
            // Volleyball/Badminton
            'SERVICE_FAULT',
            'NET_TOUCH',
            'FOOT_FAULT',
            
            // Kabaddi/Kho-Kho
            'OUT_OF_BOUNDS',
            'ILLEGAL_TOUCH',
            
            // General
            'WARNING',
            'SUSPENSION',
            'OTHER'
        ]
    },
    
    // Sport type for filtering
    sport: {
        type: String,
        required: true,
        enum: ['CRICKET', 'BADMINTON', 'TABLE_TENNIS', 'VOLLEYBALL', 'FOOTBALL', 'BASKETBALL', 'KHOKHO', 'KABADDI', 'CHESS']
    },
    
    // Time/period when foul occurred
    gameTime: {
        type: String,
        default: ''  // e.g., "45:32", "2nd Quarter", "15.3 Overs"
    },
    
    // Period/Half/Quarter
    period: {
        type: Number,
        default: 1
    },
    
    // Description
    description: {
        type: String,
        default: ''
    },
    
    // Severity level
    severity: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        default: 'MEDIUM'
    },
    
    // Consequences
    consequence: {
        type: String,
        default: ''  // e.g., "Player sent off", "Penalty awarded"
    },
    
    // Pitch location (for tactical analysis)
    pitchLocation: {
        type: String,
        default: ''  // e.g., "Penalty Box", "Midfield Center", "Defensive Left"
    },
    
    // Jersey number
    jerseyNumber: {
        type: Number,
        default: null
    },
    
    // Points deducted (if applicable)
    pointsDeducted: {
        type: Number,
        default: 0
    },
    
    // Recorded by admin
    recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        default: null
    }
}, {
    timestamps: true
});

// Index for quick match fouls lookup
foulSchema.index({ match: 1, team: 1, foulType: 1 });

module.exports = mongoose.model('Foul', foulSchema);
