const mongoose = require('mongoose');

const SPORTS = ['CRICKET', 'BADMINTON', 'TABLE_TENNIS', 'VOLLEYBALL', 'FOOTBALL', 'HOCKEY', 'BASKETBALL', 'KHOKHO', 'KABADDI', 'CHESS'];
const MATCH_STATUS = ['SCHEDULED', 'COMPLETED', 'CANCELLED'];

const matchSchema = new mongoose.Schema({
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
    // Simple score display - admin enters final scores as text
    scoreA: { type: String, default: '' },
    scoreB: { type: String, default: '' },
    
    // Summary text - e.g. "CSE won by 16 runs", "Draw", "ECE won 2-0"
    summary: { type: String, default: '' },

    scheduledAt: { type: Date, default: null },
    venue: { type: String, default: '' },
    season: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Season', 
        default: null 
    },
    matchCategory: { 
        type: String, 
        enum: ['REGULAR', 'SEMIFINAL', 'FINAL', 'QUARTER_FINAL', 'GROUP_STAGE'], 
        default: 'REGULAR' 
    },
    notes: { type: String, default: '' },
    tags: [{ type: String, trim: true }],
    
    managedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Admin', 
        default: null 
    },

    // Idempotency flag — prevents awarding points twice for the same match
    pointsAwarded: {
        type: Boolean,
        default: false
    }
}, { 
    timestamps: true 
});

// ======== INDEXES ========
// Single-field indexes for individual filters
matchSchema.index({ status: 1 });
matchSchema.index({ teamA: 1 });
matchSchema.index({ teamB: 1 });
matchSchema.index({ winner: 1 });

// Compound indexes for common getAllMatches query patterns
matchSchema.index({ sport: 1, status: 1, scheduledAt: -1 }); // sport + status filter + date sort
matchSchema.index({ status: 1, scheduledAt: -1, _id: -1 });   // status filter + cursor pagination
matchSchema.index({ scheduledAt: -1, _id: -1 });               // default sort order + cursor
matchSchema.index({ season: 1, sport: 1, scheduledAt: -1 });   // season + sport filter
matchSchema.index({ tags: 1 });                                 // tag-based searches
matchSchema.index({ matchCategory: 1, scheduledAt: -1 });      // category filter + sort

const Match = mongoose.model('Match', matchSchema);

module.exports = { Match, SPORTS, MATCH_STATUS };
