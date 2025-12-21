const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    // Local authentication
    username: {
        type: String,
        unique: true,
        sparse: true
    },
    password: {
        type: String
    },

    // OAuth authentication
    email: {
        type: String,
        unique: true,
        sparse: true,
        lowercase: true
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    
    // Profile information
    name: {
        type: String
    },
    profilePicture: {
        type: String
    },
    
    // Auth provider info
    provider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    },
    verified: {
        type: Boolean,
        default: false
    },
    
    // Role and permissions
    role: {
        type: String,
        enum: ['admin', 'moderator', 'viewer'],
        default: 'admin'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Admin', adminSchema);
