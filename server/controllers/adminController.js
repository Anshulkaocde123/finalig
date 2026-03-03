const asyncHandler = require('express-async-handler');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * @desc    Get all admins (for super admin)
 * @route   GET /api/admins
 * @access  Private (Super Admin only)
 */
const getAllAdmins = asyncHandler(async (req, res) => {
    const { role, isTrusted, isActive, department } = req.query;
    
    let query = {};
    if (role) query.role = role;
    if (isTrusted !== undefined) query.isTrusted = isTrusted === 'true';
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (department) query.department = department;
    
    const admins = await Admin.find(query)
        .populate('department', 'name shortCode')
        .populate('trustedBy', 'name studentId')
        .populate('verifiedBy', 'name studentId')
        .select('-password -activeSessions')
        .sort({ hierarchyLevel: -1, name: 1 });
    
    res.json({
        success: true,
        count: admins.length,
        data: admins
    });
});

/**
 * @desc    Get admin by ID
 * @route   GET /api/admins/:id
 * @access  Private
 */
const getAdminById = asyncHandler(async (req, res) => {
    const admin = await Admin.findById(req.params.id)
        .populate('department', 'name shortCode logo')
        .populate('lockedMatches.match', 'sport teamA teamB status')
        .select('-password');
    
    if (!admin) {
        res.status(404);
        throw new Error('Admin not found');
    }
    
    res.json({
        success: true,
        data: admin
    });
});

/**
 * @desc    Create new admin (VNIT student registration)
 * @route   POST /api/admins
 * @access  Private (Super Admin/Admin)
 */
const createAdmin = asyncHandler(async (req, res) => {
    const { 
        studentId, 
        email, 
        name,
        username, 
        password, 
        role, 
        department, 
        allowedSports,
        phone 
    } = req.body;
    
    // Don't enforce VNIT email for manually created admins
    // Just check basic email format if provided
    if (email && !email.includes('@')) {
        res.status(400);
        throw new Error('Please provide a valid email address');
    }
    
    // Check if already exists
    const orConditions = [];
    if (email) orConditions.push({ email });
    if (studentId) orConditions.push({ studentId });
    if (username) orConditions.push({ username });
    
    if (orConditions.length > 0) {
        const existingAdmin = await Admin.findOne({ $or: orConditions });
        if (existingAdmin) {
            res.status(400);
            throw new Error('Admin with this Username or Email already exists');
        }
    }
    
    // Create admin
    const admin = await Admin.create({
        studentId: studentId || username,
        username: username || studentId || email,
        email,
        name: name || username,
        password: password || 'changeme123',
        role: role || 'viewer',
        department,
        allowedSports: allowedSports || [],
        phone,
        provider: 'local',
        isActive: true,
        isTrusted: true,
        createdBy: req.admin?._id
    });
    
    const populatedAdmin = await Admin.findById(admin._id)
        .populate('department', 'name shortCode')
        .select('-password');
    
    res.status(201).json({
        success: true,
        data: populatedAdmin
    });
});

/**
 * @desc    Update admin
 * @route   PUT /api/admins/:id
 * @access  Private (Super Admin or self)
 */
const updateAdmin = asyncHandler(async (req, res) => {
    const { 
        name, 
        phone, 
        role, 
        department, 
        allowedSports,
        isActive,
        isTrusted 
    } = req.body || {};
    
    const admin = await Admin.findById(req.params.id);
    
    if (!admin) {
        res.status(404);
        throw new Error('Admin not found');
    }
    
    const currentAdmin = req.admin;
    
    // Only super_admin can modify other admins
    // Admins can modify themselves (limited fields)
    const isSelf = currentAdmin._id.toString() === admin._id.toString();
    const isSuperAdmin = currentAdmin.role === 'super_admin';
    
    if (!isSuperAdmin && !isSelf) {
        res.status(403);
        throw new Error('Not authorized to modify this admin');
    }
    
    // Update basic fields (self or super_admin)
    if (name) admin.name = name;
    if (phone !== undefined) admin.phone = phone;
    
    // Only super_admin can change these
    if (isSuperAdmin) {
        if (department) admin.department = department;
        if (allowedSports) admin.allowedSports = allowedSports;
        
        if (role) {
            console.log(`🔄 Role change: ${admin.name || admin.username} ${admin.role} → ${role}`);
            admin.role = role;
        }
        if (isActive !== undefined) {
            admin.isActive = isActive;
            if (isActive === true) {
                admin.isSuspended = false;
                admin.suspendedAt = null;
                admin.suspendedBy = null;
                admin.suspensionReason = null;
                console.log(`✅ Admin ${admin.name || admin.username} reactivated`);
            }
        }
        if (isTrusted !== undefined) {
            admin.isTrusted = isTrusted;
            if (isTrusted) {
                admin.trustedSince = new Date();
                admin.trustedBy = currentAdmin._id;
            }
        }
    }
    
    await admin.save();
    
    const updatedAdmin = await Admin.findById(admin._id)
        .populate('department', 'name shortCode')
        .select('-password');
    
    console.log(`👤 Admin updated: ${updatedAdmin.name} | role=${updatedAdmin.role} active=${updatedAdmin.isActive} trusted=${updatedAdmin.isTrusted}`);
    
    res.json({
        success: true,
        data: updatedAdmin
    });
});

/**
 * @desc    Verify/Trust an admin
 * @route   PUT /api/admins/:id/verify
 * @access  Private (Super Admin only)
 */
const verifyAdmin = asyncHandler(async (req, res) => {
    const { isTrusted, verified } = req.body;
    
    const admin = await Admin.findById(req.params.id);
    
    if (!admin) {
        res.status(404);
        throw new Error('Admin not found');
    }
    
    console.log(`✅ Super Admin ${req.admin.username} verifying ${admin.name || admin.username}:`, { 
        provider: admin.provider,
        currentRole: admin.role, 
        wasTrusted: admin.isTrusted,
        nowTrusted: isTrusted 
    });
    
    if (verified !== undefined) {
        admin.verified = verified;
        admin.verifiedAt = verified ? new Date() : null;
        admin.verifiedBy = verified ? req.admin._id : null;
    }
    
    if (isTrusted !== undefined) {
        admin.isTrusted = isTrusted;
        admin.trustedSince = isTrusted ? new Date() : null;
        admin.trustedBy = isTrusted ? req.admin._id : null;
    }
    
    await admin.save();
    
    console.log(`👤 Admin ${admin.name || admin.username} is now:`, {
        verified: admin.verified,
        isTrusted: admin.isTrusted,
        role: admin.role,
        canAccessAdmin: admin.isTrusted || admin.role !== 'viewer'
    });
    
    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
        io.emit('adminUpdated', {
            adminId: admin._id,
            verified: admin.verified,
            isTrusted: admin.isTrusted
        });
    }
    
    res.json({
        success: true,
        message: `Admin ${isTrusted ? 'trusted' : 'trust revoked'}`,
        data: admin.getPublicProfile()
    });
});

/**
 * @desc    Lock a match for an admin
 * @route   PUT /api/admins/:id/lock-match
 * @access  Private (Super Admin/Admin)
 */
const lockMatchForAdmin = asyncHandler(async (req, res) => {
    const { matchId, durationHours } = req.body;
    
    const admin = await Admin.findById(req.params.id);
    
    if (!admin) {
        res.status(404);
        throw new Error('Admin not found');
    }
    
    // Check if match is already locked by another admin
    const existingLock = await Admin.getMatchManager(matchId);
    if (existingLock && existingLock._id.toString() !== admin._id.toString()) {
        res.status(400);
        throw new Error(`Match is already locked by ${existingLock.name}`);
    }
    
    admin.lockMatch(matchId, durationHours || 2);
    await admin.save();
    
    // Update match with manager info
    const { Match } = require('../models/Match');
    await Match.findByIdAndUpdate(matchId, {
        managedBy: admin._id,
        managerName: admin.name,
        lockedBy: admin._id,
        lockExpiresAt: new Date(Date.now() + (durationHours || 2) * 60 * 60 * 1000)
    });
    
    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
        io.emit('matchLocked', {
            matchId,
            lockedBy: admin._id,
            lockedByName: admin.name
        });
    }
    
    res.json({
        success: true,
        message: `Match locked for ${admin.name}`,
        data: {
            adminId: admin._id,
            matchId,
            expiresAt: admin.lockedMatches.find(m => m.match.toString() === matchId.toString())?.expiresAt
        }
    });
});

/**
 * @desc    Unlock a match
 * @route   PUT /api/admins/:id/unlock-match
 * @access  Private
 */
const unlockMatch = asyncHandler(async (req, res) => {
    const { matchId } = req.body;
    
    const admin = await Admin.findById(req.params.id);
    
    if (!admin) {
        res.status(404);
        throw new Error('Admin not found');
    }
    
    admin.unlockMatch(matchId);
    await admin.save();
    
    // Update match
    const { Match } = require('../models/Match');
    await Match.findByIdAndUpdate(matchId, {
        lockedBy: null,
        lockExpiresAt: null
    });
    
    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
        io.emit('matchUnlocked', { matchId });
    }
    
    res.json({
        success: true,
        message: 'Match unlocked'
    });
});

/**
 * @desc    Get live admin activity (for super admin monitoring)
 * @route   GET /api/admins/activity/live
 * @access  Private (Super Admin)
 */
const getLiveActivity = asyncHandler(async (req, res) => {
    // Get admins with recent activity (last 30 mins)
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
    
    const activeAdmins = await Admin.find({
        lastActive: { $gte: thirtyMinsAgo }
    })
    .populate('lockedMatches.match', 'sport teamA teamB status')
    .populate('department', 'name shortCode')
    .select('name studentId role lockedMatches lastActive activeSessions')
    .sort({ lastActive: -1 });
    
    res.json({
        success: true,
        count: activeAdmins.length,
        data: activeAdmins
    });
});

/**
 * @desc    Suspend an admin
 * @route   PUT /api/admins/:id/suspend
 * @access  Private (Super Admin)
 */
const suspendAdmin = asyncHandler(async (req, res) => {
    const { reason } = req.body || {};
    
    const admin = await Admin.findById(req.params.id);
    
    if (!admin) {
        res.status(404);
        throw new Error('Admin not found');
    }
    
    if (admin.role === 'super_admin') {
        res.status(400);
        throw new Error('Cannot suspend a super admin');
    }
    
    admin.isActive = false;
    admin.isSuspended = true;
    admin.isTrusted = false;
    admin.suspendedAt = new Date();
    admin.suspendedBy = req.admin._id;
    admin.suspensionReason = reason || 'No reason provided';
    
    // Unlock all matches
    admin.lockedMatches = [];
    
    await admin.save();
    
    res.json({
        success: true,
        message: `Admin ${admin.name || admin.username} has been suspended`
    });
});

/**
 * @desc    Delete admin
 * @route   DELETE /api/admins/:id
 * @access  Private (Super Admin)
 */
const deleteAdmin = asyncHandler(async (req, res) => {
    const admin = await Admin.findById(req.params.id);
    
    if (!admin) {
        res.status(404);
        throw new Error('Admin not found');
    }
    
    if (admin.role === 'super_admin') {
        res.status(400);
        throw new Error('Cannot delete a super admin');
    }
    
    await admin.deleteOne();
    
    res.json({
        success: true,
        message: 'Admin deleted'
    });
});

module.exports = {
    getAllAdmins,
    getAdminById,
    createAdmin,
    updateAdmin,
    verifyAdmin,
    lockMatchForAdmin,
    unlockMatch,
    getLiveActivity,
    suspendAdmin,
    deleteAdmin
};
