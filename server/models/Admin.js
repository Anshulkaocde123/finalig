const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Enhanced Admin Schema with VNIT-specific hierarchy
 * Supports student ID based authentication and match locking
 */
const adminSchema = new mongoose.Schema({
    // ======== VNIT-SPECIFIC AUTHENTICATION ========
    // 5-digit student ID (e.g., "24008")
    studentId: {
        type: String,
        unique: true,
        sparse: true,
        match: [/^\d{5}$/, 'Student ID must be a 5-digit number'],
        index: true
    },
    
    // VNIT Student Email format: bt24cse008@students.vnit.ac.in
    email: {
        type: String,
        unique: true,
        sparse: true,
        lowercase: true
    },
    
    // Local authentication (for legacy/backup)
    username: {
        type: String,
        unique: true,
        sparse: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        select: false  // Don't include in queries by default
    },

    // OAuth authentication
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    
    // ======== PROFILE INFORMATION ========
    name: {
        type: String,
        trim: true,
        default: ''
    },
    profilePicture: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    
    // Department affiliation (for department-specific admins)
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        default: null
    },
    
    // ======== AUTH PROVIDER INFO ========
    provider: {
        type: String,
        enum: ['local', 'google', 'vnit-sso'],
        default: 'local'
    },
    verified: {
        type: Boolean,
        default: false
    },
    verifiedAt: {
        type: Date,
        default: null
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        default: null
    },
    
    // ======== ROLE AND HIERARCHY ========
    role: {
        type: String,
        enum: [
            'super_admin',    // Boss admin - can do everything
            'admin',          // Full admin - manage matches, leaderboard
            'score_manager',  // Can only update scores (locked to assigned matches)
            'moderator',      // Can view and moderate, limited edit
            'viewer'          // Read-only access
        ],
        default: 'viewer'
    },
    
    // Hierarchy level (for permission checking)
    hierarchyLevel: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
        // 100: Super Admin, 80: Admin, 60: Score Manager, 40: Moderator, 20: Viewer
    },
    
    // ======== TRUSTED ADMIN SYSTEM ========
    isTrusted: {
        type: Boolean,
        default: false  // Must be approved by super_admin
    },
    trustedSince: {
        type: Date,
        default: null
    },
    trustedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        default: null
    },
    
    // Allowed sports (for score managers)
    allowedSports: [{
        type: String,
        enum: ['CRICKET', 'BADMINTON', 'TABLE_TENNIS', 'VOLLEYBALL', 'FOOTBALL', 'BASKETBALL', 'KHOKHO', 'KABADDI', 'CHESS']
    }],
    
    // ======== MATCH LOCKING SYSTEM ========
    // Currently managing these matches (exclusive lock)
    lockedMatches: [{
        match: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Match'
        },
        lockedAt: {
            type: Date,
            default: Date.now
        },
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours
        }
    }],
    
    // ======== ACTIVITY TRACKING ========
    lastLogin: {
        type: Date,
        default: null
    },
    lastActive: {
        type: Date,
        default: null
    },
    loginCount: {
        type: Number,
        default: 0
    },
    
    // Session tracking for live monitoring
    activeSessions: [{
        sessionId: String,
        ipAddress: String,
        userAgent: String,
        startedAt: { type: Date, default: Date.now },
        lastActivity: { type: Date, default: Date.now }
    }],
    
    // ======== PERMISSIONS ========
    permissions: {
        canManageMatches: { type: Boolean, default: false },
        canManageLeaderboard: { type: Boolean, default: false },
        canManageAdmins: { type: Boolean, default: false },
        canManageDepartments: { type: Boolean, default: false },
        canManageSeasons: { type: Boolean, default: false },
        canManagePlayers: { type: Boolean, default: false },
        canViewAnalytics: { type: Boolean, default: false },
        canReviewActions: { type: Boolean, default: false },
        canUndoActions: { type: Boolean, default: false },
        canResetLeaderboard: { type: Boolean, default: false }
    },
    
    // ======== AUDIT TRAIL ========
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        default: null
    },
    
    // Status
    isActive: {
        type: Boolean,
        default: true
    },
    suspendedAt: {
        type: Date,
        default: null
    },
    suspendedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        default: null
    },
    suspensionReason: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// ======== MIDDLEWARE ========

// Auto-set hierarchy level based on role
adminSchema.pre('save', function(next) {
    const hierarchyMap = {
        'super_admin': 100,
        'admin': 80,
        'score_manager': 60,
        'moderator': 40,
        'viewer': 20
    };
    this.hierarchyLevel = hierarchyMap[this.role] || 0;
    
    // Auto-set permissions based on role
    if (this.role === 'super_admin') {
        this.permissions = {
            canManageMatches: true,
            canManageLeaderboard: true,
            canManageAdmins: true,
            canManageDepartments: true,
            canManageSeasons: true,
            canManagePlayers: true,
            canViewAnalytics: true,
            canReviewActions: true,
            canUndoActions: true,
            canResetLeaderboard: true
        };
        this.isTrusted = true;
    } else if (this.role === 'admin') {
        this.permissions = {
            canManageMatches: true,
            canManageLeaderboard: true,
            canManageAdmins: false,
            canManageDepartments: true,
            canManageSeasons: true,
            canManagePlayers: true,
            canViewAnalytics: true,
            canReviewActions: false,
            canUndoActions: true,
            canResetLeaderboard: false
        };
    } else if (this.role === 'score_manager') {
        this.permissions = {
            canManageMatches: true, // Limited to locked matches
            canManageLeaderboard: false,
            canManageAdmins: false,
            canManageDepartments: false,
            canManageSeasons: false,
            canManagePlayers: false,
            canViewAnalytics: false,
            canReviewActions: false,
            canUndoActions: true, // For own matches only
            canResetLeaderboard: false
        };
    }
    
    next();
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
    if (!this.isModified('password') || !this.password) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// ======== METHODS ========

// Compare password
adminSchema.methods.comparePassword = async function(candidatePassword) {
    if (!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
};

// Check if admin can manage specific match
adminSchema.methods.canManageMatch = function(matchId) {
    if (this.role === 'super_admin' || this.role === 'admin') return true;
    if (this.role !== 'score_manager') return false;
    
    // Check if match is locked by this admin
    const lockedMatch = this.lockedMatches.find(
        lm => lm.match.toString() === matchId.toString() && new Date(lm.expiresAt) > new Date()
    );
    return !!lockedMatch;
};

// Lock a match for exclusive scoring
adminSchema.methods.lockMatch = function(matchId, durationHours = 2) {
    // Remove expired locks first
    this.lockedMatches = this.lockedMatches.filter(
        lm => new Date(lm.expiresAt) > new Date()
    );
    
    // Check if already locked
    const existing = this.lockedMatches.find(
        lm => lm.match.toString() === matchId.toString()
    );
    if (existing) {
        existing.expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000);
        return;
    }
    
    this.lockedMatches.push({
        match: matchId,
        lockedAt: new Date(),
        expiresAt: new Date(Date.now() + durationHours * 60 * 60 * 1000)
    });
};

// Unlock a match
adminSchema.methods.unlockMatch = function(matchId) {
    this.lockedMatches = this.lockedMatches.filter(
        lm => lm.match.toString() !== matchId.toString()
    );
};

// Check hierarchy permission
adminSchema.methods.canManageAdmin = function(targetAdmin) {
    return this.hierarchyLevel > targetAdmin.hierarchyLevel;
};

// Get public profile (without sensitive data)
adminSchema.methods.getPublicProfile = function() {
    return {
        _id: this._id,
        studentId: this.studentId,
        name: this.name,
        email: this.email,
        role: this.role,
        department: this.department,
        profilePicture: this.profilePicture,
        isTrusted: this.isTrusted,
        isActive: this.isActive
    };
};

// ======== STATICS ========

// Find trusted admins only
adminSchema.statics.findTrusted = function() {
    return this.find({ isTrusted: true, isActive: true });
};

// Get admin managing a specific match
adminSchema.statics.getMatchManager = async function(matchId) {
    return this.findOne({
        'lockedMatches.match': matchId,
        'lockedMatches.expiresAt': { $gt: new Date() }
    });
};

// ======== INDEXES ========
adminSchema.index({ role: 1, isTrusted: 1 });
adminSchema.index({ 'lockedMatches.match': 1 });
adminSchema.index({ department: 1 });

module.exports = mongoose.model('Admin', adminSchema);
