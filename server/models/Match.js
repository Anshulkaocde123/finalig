const mongoose = require('mongoose');

// Sport types enum
const SPORTS = ['CRICKET', 'BADMINTON', 'TABLE_TENNIS', 'VOLLEYBALL', 'FOOTBALL', 'BASKETBALL', 'KHOKHO', 'KABADDI', 'CHESS'];

// Match status enum
const MATCH_STATUS = ['SCHEDULED', 'LIVE', 'COMPLETED'];

// Base Match Schema
const baseMatchSchema = new mongoose.Schema({
    sport: {
        type: String,
        required: true,
        enum: SPORTS
    },
    teamA: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: [true, 'Team A is required']
    },
    teamB: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: [true, 'Team B is required']
    },
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        default: null
    },
    status: {
        type: String,
        enum: MATCH_STATUS,
        default: 'SCHEDULED'
    },
    scheduledAt: {
        type: Date,
        default: null
    },
    venue: {
        type: String,
        default: null
    },
    // Season reference
    season: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Season',
        required: false,
        default: null
    },
    // Match classification
    matchType: {
        type: String,
        enum: ['REGULAR', 'SEMIFINAL', 'FINAL'],
        default: 'REGULAR'
    },
    // Search and filter fields
    tags: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true,
    discriminatorKey: 'matchType'
});

// Create base Match model
const Match = mongoose.model('Match', baseMatchSchema);

// ============================================
// DISCRIMINATOR 1: Cricket Match
// ============================================
const cricketScoreSchema = new mongoose.Schema({
    runs: { type: Number, default: 0 },
    wickets: { type: Number, default: 0, max: 10 },
    overs: { type: Number, default: 0 }
}, { _id: false });

const CricketMatch = Match.discriminator('CricketMatch', new mongoose.Schema({
    scoreA: { type: cricketScoreSchema, default: () => ({}) },
    scoreB: { type: cricketScoreSchema, default: () => ({}) },
    totalOvers: { type: Number, default: 20 }, // Default T20 format
    scoreHistory: [{ // Track score changes for undo functionality
        timestamp: { type: Date, default: Date.now },
        team: { type: String, enum: ['A', 'B'] },
        action: String, // Description of what changed (e.g., "+1 run", "wicket", "wide")
        before: cricketScoreSchema,
        after: cricketScoreSchema
    }]
}));

// ============================================
// DISCRIMINATOR 2: Set-based Match (Badminton, TT, Volleyball)
// ============================================
const SetMatch = Match.discriminator('SetMatch', new mongoose.Schema({
    scoreA: { type: Number, default: 0 }, // Sets won by Team A
    scoreB: { type: Number, default: 0 }, // Sets won by Team B
    maxSets: { type: Number, default: 3 }, // Best of 3 or 5
    setDetails: [{
        type: String // e.g., "21-15", "18-21", "21-19"
    }],
    currentSet: {
        pointsA: { type: Number, default: 0 },
        pointsB: { type: Number, default: 0 }
    }
}));

// ============================================
// DISCRIMINATOR 3: Goal/Point-based Match (Football, Basketball, KhoKho, Kabaddi)
// ============================================
const GoalMatch = Match.discriminator('GoalMatch', new mongoose.Schema({
    scoreA: { type: Number, default: 0 }, // Goals/Points for Team A
    scoreB: { type: Number, default: 0 }, // Goals/Points for Team B
    period: { type: Number, default: 1 }, // Current half/quarter
    maxPeriods: { type: Number, default: 2 } // 2 halves for football, 4 quarters for basketball
}));

// ============================================
// DISCRIMINATOR 4: Simple Match (Chess)
// ============================================
const SimpleMatch = Match.discriminator('SimpleMatch', new mongoose.Schema({
    resultType: {
        type: String,
        enum: ['CHECKMATE', 'RESIGNATION', 'STALEMATE', 'TIME_OUT', 'DRAW', null],
        default: null
    }
}));

// Export all models
module.exports = {
    Match,
    CricketMatch,
    SetMatch,
    GoalMatch,
    SimpleMatch,
    SPORTS,
    MATCH_STATUS
};
