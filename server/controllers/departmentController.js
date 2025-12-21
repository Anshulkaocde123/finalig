const Department = require('../models/Department');

// @desc    Get all departments
// @route   GET /api/admin/departments
// @access  Public (for now)
const getDepartments = async (req, res) => {
    try {
        const departments = await Department.find().sort({ name: 1 });
        res.status(200).json({
            success: true,
            count: departments.length,
            data: departments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Update department (e.g., logo)
// @route   PUT /api/departments/:id
// @access  Private
const updateDepartment = async (req, res) => {
    try {
        const updates = { ...req.body };

        // If file uploaded, update logo path
        if (req.file) {
            // Store relative path
            updates.logo = `/uploads/${req.file.filename}`;
        }

        const department = await Department.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!department) {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }

        res.status(200).json({
            success: true,
            data: department
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

module.exports = {
    getDepartments,
    updateDepartment
};
