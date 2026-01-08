const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

/**
 * Protect routes - require valid JWT token
 */
const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];
            
            console.log('🔐 Auth Middleware - Token received:', token?.substring(0, 20) + '...');

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
            console.log('✅ Token verified for admin ID:', decoded.id);

            // Get admin from the token
            req.admin = await Admin.findById(decoded.id)
                .select('-password')
                .populate('department', 'name shortCode');

            if (!req.admin) {
                console.log('❌ Admin not found for ID:', decoded.id);
                return res.status(401).json({ message: 'Admin not found' });
            }
            
            console.log('👤 Admin authenticated:', { 
                id: req.admin._id, 
                username: req.admin.username,
                role: req.admin.role,
                isActive: req.admin.isActive
            });

            // Check if admin is active
            if (!req.admin.isActive) {
                console.log('🚫 Admin account suspended:', req.admin.username);
                return res.status(403).json({ 
                    message: 'Account suspended',
                    reason: req.admin.suspensionReason 
                });
            }

            // Update last active timestamp
            Admin.findByIdAndUpdate(req.admin._id, { 
                lastActive: new Date() 
            }).catch(() => {});

            next();
        } catch (error) {
            console.error('❌ Auth error:', error.message);
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expired' });
            }
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Invalid token' });
            }
            return res.status(401).json({ message: 'Not authorized, token verification failed' });
        }
    } else {
        console.log('❌ No authorization header found');
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

/**
 * Optional auth - populate admin if token exists, but don't block
 */
const optionalAuth = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
            req.admin = await Admin.findById(decoded.id)
                .select('-password')
                .populate('department', 'name shortCode');
        } catch (error) {
            // Silently fail - user can continue without auth
            req.admin = null;
        }
    }
    next();
};

/**
 * Authorize specific roles
 * Usage: authorize('super_admin', 'admin')
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.admin) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (!roles.includes(req.admin.role)) {
            return res.status(403).json({ 
                message: `Role '${req.admin.role}' is not authorized to access this resource`,
                requiredRoles: roles
            });
        }

        next();
    };
};

/**
 * Check if admin is trusted
 */
const requireTrusted = (req, res, next) => {
    if (!req.admin) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    if (!req.admin.isTrusted) {
        return res.status(403).json({ 
            message: 'This action requires a trusted admin account',
            hint: 'Contact a super admin to verify your account'
        });
    }

    next();
};

/**
 * Check if admin can manage a specific match
 */
const canManageMatch = async (req, res, next) => {
    if (!req.admin) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    const matchId = req.body.matchId || req.params.id || req.params.matchId;
    
    if (!matchId) {
        return res.status(400).json({ message: 'Match ID required' });
    }

    // Super admin and admin can manage any match
    if (['super_admin', 'admin'].includes(req.admin.role)) {
        return next();
    }

    // Score managers can only manage their locked matches
    if (req.admin.role === 'score_manager') {
        if (req.admin.canManageMatch(matchId)) {
            return next();
        }
        
        // Check who has the lock
        const lockHolder = await Admin.getMatchManager(matchId);
        if (lockHolder) {
            return res.status(403).json({ 
                message: `Match is currently being managed by ${lockHolder.name}`,
                lockedBy: lockHolder.name
            });
        }
        
        return res.status(403).json({ 
            message: 'You do not have permission to manage this match',
            hint: 'Request match lock from an admin'
        });
    }

    return res.status(403).json({ message: 'Not authorized to manage matches' });
};

/**
 * Check specific permission
 */
const hasPermission = (permission) => {
    return (req, res, next) => {
        if (!req.admin) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Super admin bypasses all permission checks
        if (req.admin.role === 'super_admin') {
            return next();
        }

        if (!req.admin.permissions?.[permission]) {
            return res.status(403).json({ 
                message: `Missing permission: ${permission}` 
            });
        }

        next();
    };
};

module.exports = { 
    protect, 
    optionalAuth,
    authorize, 
    requireTrusted,
    canManageMatch,
    hasPermission
};
