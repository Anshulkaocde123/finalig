const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Admin management routes
router.route('/')
    .get(authorize('super_admin', 'admin'), getAllAdmins)
    .post(authorize('super_admin', 'admin'), createAdmin);

// Live activity monitoring (super admin only)
router.get('/activity/live', authorize('super_admin'), getLiveActivity);

// Individual admin routes
router.route('/:id')
    .get(getAdminById)
    .put(updateAdmin)
    .delete(authorize('super_admin'), deleteAdmin);

// Verification and trust management (super admin only)
router.put('/:id/verify', authorize('super_admin'), verifyAdmin);
router.put('/:id/suspend', authorize('super_admin'), suspendAdmin);

// Match locking
router.put('/:id/lock-match', authorize('super_admin', 'admin'), lockMatchForAdmin);
router.put('/:id/unlock-match', unlockMatch);

module.exports = router;
