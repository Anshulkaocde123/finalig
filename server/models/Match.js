const mongoose = require('mongoose');

// Sport types enum
const SPORTS = ['CRICKET', 'BADMINTON', 'TABLE_TENNIS', 'VOLLEYBALL', 'FOOTBALL', 'BASKETBALL', 'KHOKHO', 'KABADDI', 'CHESS'];

// Match status enum
const MATCH_STATUS = ['SCHEDULED', 'LIVE', 'COMPLETED', 'PAUSED', 'CANCELLED'];

// ============================================
// PLAYER IN MATCH - Batting/Bowling stats
// ============================================
const playerInMatchSchema = new mongoose.Schema({
    player: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
        default: null
    },
    playerName: { type: String, required: true },
    jerseyNumber: { type: Number, default: null },
    
    // Batting stats
    runsScored: { type: Number, default: 0 },
    ballsFaced: { type: Number, default: 0 },
    fours: { type: Number, default: 0 },
    sixes: { type: Number, default: 0 },
    isOut: { type: Boolean, default: false },
    outType: { 
        type: String, 
        enum: ['BOWLED', 'CAUGHT', 'LBW', 'RUN_OUT', 'STUMPED', 'HIT_WICKET', 'RETIRED', 'NOT_OUT', null],
        default: null 
    },
    outBy: { type: String, default: '' },  // Bowler/Fielder name
    
    // Bowling stats
    oversBowled: { type: Number, default: 0 },
    ballsBowled: { type: Number, default: 0 },
    runsConceded: { type: Number, default: 0 },
    wicketsTaken: { type: Number, default: 0 },
    maidens: { type: Number, default: 0 },
    wides: { type: Number, default: 0 },
    noBalls: { type: Number, default: 0 },
    
    // Role in match
    role: { 
        type: String, 
        enum: ['BATSMAN', 'BOWLER', 'ALL_ROUNDER', 'WICKET_KEEPER'],
        default: 'BATSMAN'
    },
    
    // Order
    battingOrder: { type: Number, default: null },
    bowlingOrder: { type: Number, default: null },
    
    // Current status
    isCurrentBatsman: { type: Boolean, default: false },
    isCurrentBowler: { type: Boolean, default: false },
    isOnStrike: { type: Boolean, default: false }
}, { _id: false });

// ============================================
// FOUL/CARD IN MATCH
// ============================================
const foulInMatchSchema = new mongoose.Schema({
    team: { type: String, enum: ['A', 'B'], required: true },
    playerName: { type: String, default: '' },
    foulType: {
        type: String,
        enum: ['YELLOW_CARD', 'RED_CARD', 'PENALTY', 'FOUL', 'WARNING', 'TECHNICAL', 'WIDE', 'NO_BALL', 'OTHER'],
        required: true
    },
    gameTime: { type: String, default: '' },
    period: { type: Number, default: 1 },
    description: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now }
}, { _id: false });

// ============================================
// TIMER SCHEMA
// ============================================
const timerSchema = new mongoose.Schema({
    isRunning: { type: Boolean, default: false },
    startTime: { type: Date, default: null },
    pausedAt: { type: Date, default: null },
    elapsedSeconds: { type: Number, default: 0 },
    periodDuration: { type: Number, default: 2700 },  // 45 mins in seconds for football
    addedTime: { type: Number, default: 0 },  // Injury/stoppage time
    isPaused: { type: Boolean, default: false }
}, { _id: false });

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
    // Match classification (changed discriminator key to matchCategory)
    matchCategory: {
        type: String,
        enum: ['REGULAR', 'SEMIFINAL', 'FINAL', 'QUARTER_FINAL', 'GROUP_STAGE'],
        default: 'REGULAR'
    },
    
    // ======== TOSS INFORMATION ========
    toss: {
        winner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Department',
            default: null
        },
        decision: {
            type: String,
            enum: ['BAT', 'BOWL', 'CHOOSE_SIDE', 'KICK', null],
            default: null
        },
        conductedAt: { type: Date, default: null }
    },
    
    // ======== ADMIN MANAGEMENT ========
    managedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        default: null
    },
    managerName: {
        type: String,
        default: ''
    },
    lockedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        default: null
    },
    lockExpiresAt: {
        type: Date,
        default: null
    },
    
    // ======== FOULS/CARDS ========
    fouls: [foulInMatchSchema],
    
    // ======== CARDS COUNT (Quick access) ========
    cardsA: {
        yellow: { type: Number, default: 0 },
        red: { type: Number, default: 0 }
    },
    cardsB: {
        yellow: { type: Number, default: 0 },
        red: { type: Number, default: 0 }
    },
    
    // ======== TIMER ========
    timer: {
        type: timerSchema,
        default: () => ({})
    },
    
    // ======== MATCH NOTES ========
    notes: {
        type: String,
        default: ''
    },
    
    // Search and filter fields
    tags: [{
        type: String,
        trim: true
    }],
    
    // Live stream URL (if any)
    streamUrl: {
        type: String,
        default: ''
    }
}, {
    timestamps: true,
    discriminatorKey: 'sportType'
});

// Create base Match model
const Match = mongoose.model('Match', baseMatchSchema);

// ============================================
// DISCRIMINATOR 1: Cricket Match
// ============================================
const cricketScoreSchema = new mongoose.Schema({
    runs: { type: Number, default: 0 },
    wickets: { type: Number, default: 0, max: 10 },
    overs: { type: Number, default: 0 },
    balls: { type: Number, default: 0 },  // Balls in current over
    extras: {
        wides: { type: Number, default: 0 },
        noBalls: { type: Number, default: 0 },
        byes: { type: Number, default: 0 },
        legByes: { type: Number, default: 0 }
    }
}, { _id: false });

// Innings schema for detailed tracking
const inningsSchema = new mongoose.Schema({
    team: { type: String, enum: ['A', 'B'], required: true },
    inningsNumber: { type: Number, default: 1 },
    score: { type: cricketScoreSchema, default: () => ({}) },
    batting: [playerInMatchSchema],
    bowling: [playerInMatchSchema],
    fallOfWickets: [{
        wicketNumber: Number,
        score: Number,
        overs: Number,
        batsmanName: String
    }],
    isCompleted: { type: Boolean, default: false },
    completedReason: {
        type: String,
        enum: ['ALL_OUT', 'OVERS_COMPLETED', 'DECLARED', 'TARGET_ACHIEVED', null],
        default: null
    }
}, { _id: false });

const CricketMatch = Match.discriminator('CricketMatch', new mongoose.Schema({
    scoreA: { type: cricketScoreSchema, default: () => ({}) },
    scoreB: { type: cricketScoreSchema, default: () => ({}) },
    totalOvers: { type: Number, default: 20 }, // Default T20 format
    
    // Current innings (1 or 2)
    currentInnings: { type: Number, default: 1, min: 1, max: 2 },
    
    // Which team is batting currently
    battingTeam: { type: String, enum: ['A', 'B'], default: 'A' },
    
    // Detailed innings data
    innings: [inningsSchema],
    
    // Team squads for this match
    squadA: [playerInMatchSchema],
    squadB: [playerInMatchSchema],
    
    // Current batsmen on crease
    currentBatsmen: {
        striker: playerInMatchSchema,
        nonStriker: playerInMatchSchema
    },
    
    // Current bowler
    currentBowler: playerInMatchSchema,
    
    // Target (for 2nd innings)
    target: { type: Number, default: null },
    
    // Required run rate
    requiredRunRate: { type: Number, default: null },
    
    // Current run rate
    currentRunRate: { type: Number, default: null },
    
    // Last 6 balls for over-by-over display
    currentOverBalls: [{
        type: String  // e.g., "1", "4", "6", "W", "Wd", "Nb"
    }],
    
    // Recent overs summary
    recentOvers: [{
        overNumber: Number,
        runs: Number,
        wickets: Number,
        balls: [String]
    }],
    
    // Score history for undo functionality
    scoreHistory: [{
        timestamp: { type: Date, default: Date.now },
        team: { type: String, enum: ['A', 'B'] },
        action: String,
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
        setNumber: Number,
        pointsA: Number,
        pointsB: Number,
        winner: { type: String, enum: ['A', 'B', null] }
    }],
    currentSet: {
        setNumber: { type: Number, default: 1 },
        pointsA: { type: Number, default: 0 },
        pointsB: { type: Number, default: 0 }
    },
    // Server tracking (for badminton/TT)
    currentServer: { type: String, enum: ['A', 'B', null], default: null },
    serviceCount: { type: Number, default: 0 }
}));

// ============================================
// DISCRIMINATOR 3: Goal/Point-based Match (Football, Basketball, KhoKho, Kabaddi)
// ============================================
const GoalMatch = Match.discriminator('GoalMatch', new mongoose.Schema({
    scoreA: { type: Number, default: 0 }, // Goals/Points for Team A
    scoreB: { type: Number, default: 0 }, // Goals/Points for Team B
    period: { type: Number, default: 1 }, // Current half/quarter
    maxPeriods: { type: Number, default: 2 }, // 2 halves for football, 4 quarters for basketball
    
    // Period-wise scores
    periodScores: [{
        period: Number,
        scoreA: Number,
        scoreB: Number
    }],
    
    // Goal/Point scorers
    scorers: [{
        team: { type: String, enum: ['A', 'B'] },
        playerName: String,
        time: String,
        period: Number,
        points: { type: Number, default: 1 },  // For basketball: 1, 2, or 3
        type: { type: String, enum: ['GOAL', 'PENALTY', 'FREE_THROW', 'TWO_POINTER', 'THREE_POINTER', 'POINT'], default: 'GOAL' }
    }],
    
    // Substitutions
    substitutions: [{
        team: { type: String, enum: ['A', 'B'] },
        playerOut: String,
        playerIn: String,
        time: String,
        period: Number
    }],
    
    // Penalty Shootout (for knockout matches)
    penaltyShootout: {
        status: {
            type: String,
            enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'],
            default: 'NOT_STARTED'
        },
        teamA: [{
            round: Number,
            scored: Boolean,
            playerName: String,
            savedBy: String,
            missType: { type: String, enum: ['SAVED', 'MISSED', 'HIT_POST', ''], default: '' },
            timestamp: Date
        }],
        teamB: [{
            round: Number,
            scored: Boolean,
            playerName: String,
            savedBy: String,
            missType: { type: String, enum: ['SAVED', 'MISSED', 'HIT_POST', ''], default: '' },
            timestamp: Date
        }],
        currentRound: { type: Number, default: 1 },
        winner: { type: String, enum: ['A', 'B', null], default: null },
        finalScore: {
            A: { type: Number, default: 0 },
            B: { type: Number, default: 0 }
        }
    }
}));

// ============================================
// DISCRIMINATOR 4: Simple Match (Chess)
// ============================================
const SimpleMatch = Match.discriminator('SimpleMatch', new mongoose.Schema({
    resultType: {
        type: String,
        enum: ['CHECKMATE', 'RESIGNATION', 'STALEMATE', 'TIME_OUT', 'DRAW', null],
        default: null
    },
    // Chess-specific
    playerA: { type: String, default: '' },
    playerB: { type: String, default: '' },
    moves: { type: Number, default: 0 },
    duration: { type: Number, default: 0 }  // in minutes
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
