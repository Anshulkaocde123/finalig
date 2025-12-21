const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Auth admin with username/password
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const admin = await Admin.findOne({ username });

        if (admin && (await bcrypt.compare(password, admin.password))) {
            res.json({
                _id: admin._id,
                username: admin.username,
                email: admin.email,
                name: admin.name,
                token: generateToken(admin._id),
                provider: 'local'
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
const googleCallback = async (req, res) => {
    try {
        const { googleId, email, name, picture } = req.body;

        let admin = await Admin.findOne({ googleId });

        if (!admin) {
            // Create new admin from Google profile
            admin = await Admin.create({
                googleId,
                email,
                name,
                profilePicture: picture,
                provider: 'google',
                verified: true
            });
        } else {
            // Update profile info
            admin.name = name || admin.name;
            admin.profilePicture = picture || admin.profilePicture;
            admin.email = email || admin.email;
            await admin.save();
        }

        res.json({
            _id: admin._id,
            email: admin.email,
            name: admin.name,
            profilePicture: admin.profilePicture,
            token: generateToken(admin._id),
            provider: 'google'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during Google login' });
    }
};

// @desc    Seed initial admin
// @route   POST /api/auth/seed
// @access  Public (Should be protected or removed in prod)
const seedAdmin = async (req, res) => {
    try {
        const exists = await Admin.findOne({ $or: [{ username: 'admin' }, { email: 'admin@vnit.ac.in' }] });
        if (exists) {
            return res.status(400).json({ message: 'Admin already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        const admin = await Admin.create({
            username: 'admin',
            email: 'admin@vnit.ac.in',
            password: hashedPassword,
            name: 'VNIT Admin',
            provider: 'local',
            verified: true,
            role: 'admin'
        });

        res.status(201).json({
            _id: admin._id,
            username: admin.username,
            email: admin.email,
            name: admin.name,
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
            role: 'admin'
        });

        res.status(201).json({
            _id: admin._id,
            email: admin.email,
            name: admin.name,
            profilePicture: admin.profilePicture,
            token: generateToken(admin._id),
            provider: 'google',
            message: 'Account created successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration' });
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
    seedAdmin
};
