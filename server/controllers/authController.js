const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Auth admin with username/password or student ID
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { username, password, studentId } = req.body;

        // Support both username and studentId login
        const loginId = studentId || username;
        
        const admin = await Admin.findOne({ 
            $or: [
                { username: loginId },
                { studentId: loginId },
                { email: loginId }
            ]
        }).select('+password');

        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if account is active
        if (!admin.isActive) {
            return res.status(403).json({ 
                message: 'Account suspended',
                reason: admin.suspensionReason 
            });
        }

        // Verify password
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Update login stats
        admin.lastLogin = new Date();
        admin.loginCount = (admin.loginCount || 0) + 1;
        await admin.save();

        res.json({
            _id: admin._id,
            studentId: admin.studentId,
            username: admin.username,
            email: admin.email,
            name: admin.name,
            role: admin.role,
            isTrusted: admin.isTrusted,
            permissions: admin.permissions,
            department: admin.department,
            profilePicture: admin.profilePicture,
            token: generateToken(admin._id),
            provider: 'local'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Google OAuth callback
// @route   POST /api/auth/google/callback
// @access  Public
const googleCallback = async (req, res) => {
    try {
        const { googleId, email, name, picture } = req.body;

        let admin = await Admin.findOne({ googleId });

        if (!admin) {
            // Check if email is a VNIT student email
            const isVNITEmail = email?.match(/^[a-z]{2}\d{2}[a-z]{3}\d{3}@students\.vnit\.ac\.in$/);
            
            // Create new admin from Google profile
            admin = await Admin.create({
                googleId,
                email,
                name,
                profilePicture: picture,
                provider: 'google',
                verified: true,
                role: 'viewer', // New OAuth users start as viewers
                isTrusted: false // Must be verified by super_admin
            });
            
            // Extract student ID from VNIT email if applicable
            if (isVNITEmail) {
                const match = email.match(/\d{2}[a-z]{3}(\d{3})/);
                if (match) {
                    admin.studentId = match[1].padStart(5, '0');
                    await admin.save();
                }
            }
        } else {
            // Update profile info
            admin.name = name || admin.name;
            admin.profilePicture = picture || admin.profilePicture;
            admin.email = email || admin.email;
            admin.lastLogin = new Date();
            admin.loginCount = (admin.loginCount || 0) + 1;
            await admin.save();
        }

        // Check if account is active
        if (!admin.isActive) {
            return res.status(403).json({ 
                message: 'Account suspended',
                reason: admin.suspensionReason 
            });
        }

        res.json({
            _id: admin._id,
            studentId: admin.studentId,
            email: admin.email,
            name: admin.name,
            role: admin.role,
            isTrusted: admin.isTrusted,
            permissions: admin.permissions,
            profilePicture: admin.profilePicture,
            token: generateToken(admin._id),
            provider: 'google'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during Google login' });
    }
};

// @desc    Seed initial super admin
// @route   POST /api/auth/seed
// @access  Public (Should be protected or removed in prod)
const seedAdmin = async (req, res) => {
    try {
        const exists = await Admin.findOne({ 
            $or: [
                { username: 'admin' }, 
                { email: 'admin@vnit.ac.in' },
                { role: 'super_admin' }
            ] 
        });
        
        if (exists) {
            return res.status(400).json({ message: 'Admin already exists' });
        }

        const admin = await Admin.create({
            username: 'admin',
            studentId: '00000',
            email: 'admin@vnit.ac.in',
            password: 'admin123',
            name: 'VNIT Super Admin',
            provider: 'local',
            verified: true,
            role: 'super_admin',
            isTrusted: true
        });

        res.status(201).json({
            _id: admin._id,
            username: admin.username,
            email: admin.email,
            name: admin.name,
            role: admin.role,
            token: generateToken(admin._id),
            provider: 'local'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Register new admin (for Google OAuth)
// @route   POST /api/auth/register-oauth
// @access  Public
const registerOAuth = async (req, res) => {
    try {
        const { googleId, email, name, picture } = req.body;

        // Check if admin with this email already exists
        let admin = await Admin.findOne({ email });

        if (admin) {
            // Link Google to existing account
            if (!admin.googleId) {
                admin.googleId = googleId;
                admin.provider = 'google';
                admin.profilePicture = picture || admin.profilePicture;
                await admin.save();
            }
            return res.json({
                _id: admin._id,
                email: admin.email,
                name: admin.name,
                role: admin.role,
                isTrusted: admin.isTrusted,
                profilePicture: admin.profilePicture,
                token: generateToken(admin._id),
                provider: 'google',
                message: 'Logged in successfully'
            });
        }

        // Create new admin
        admin = await Admin.create({
            googleId,
            email,
            name,
            profilePicture: picture,
            provider: 'google',
            verified: true,
            role: 'viewer', // Start as viewer
            isTrusted: false
        });

        res.status(201).json({
            _id: admin._id,
            email: admin.email,
            name: admin.name,
            role: admin.role,
            isTrusted: admin.isTrusted,
            profilePicture: admin.profilePicture,
            token: generateToken(admin._id),
            provider: 'google',
            message: 'Account created successfully. Contact admin to get trusted status.'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin._id)
            .populate('department', 'name shortCode logo')
            .populate('lockedMatches.match', 'sport teamA teamB status')
            .select('-password');
        
        res.json({
            success: true,
            data: admin
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update current user profile
// @route   PUT /api/auth/me
// @access  Private
const updateMe = async (req, res) => {
    try {
        const { name, phone, profilePicture } = req.body;
        
        const admin = await Admin.findById(req.admin._id);
        
        if (name) admin.name = name;
        if (phone !== undefined) admin.phone = phone;
        if (profilePicture) admin.profilePicture = profilePicture;
        
        await admin.save();
        
        res.json({
            success: true,
            data: admin.getPublicProfile()
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        const admin = await Admin.findById(req.admin._id).select('+password');
        
        if (!admin.password) {
            return res.status(400).json({ 
                message: 'Cannot change password for OAuth accounts' 
            });
        }
        
        const isMatch = await admin.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }
        
        admin.password = newPassword;
        await admin.save();
        
        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d'
    });
};

module.exports = {
    login,
    googleCallback,
    registerOAuth,
    seedAdmin,
    getMe,
    updateMe,
    changePassword
};
