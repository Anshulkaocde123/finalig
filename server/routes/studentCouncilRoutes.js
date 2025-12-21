const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getAllMembers,
    getMember,
    addMember,
    updateMember,
    deleteMember
} = require('../controllers/studentCouncilController');

// Public routes
router.get('/', getAllMembers);
router.get('/:id', getMember);

// Protected admin routes
router.post('/', protect, addMember);
router.put('/:id', protect, updateMember);
router.delete('/:id', protect, deleteMember);

module.exports = router;
