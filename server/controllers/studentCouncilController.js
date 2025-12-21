const StudentCouncil = require('../models/StudentCouncil');

// Get all student council members
exports.getAllMembers = async (req, res) => {
    try {
        const members = await StudentCouncil.find({ isActive: true }).sort({ order: 1 });
        res.json({
            success: true,
            data: members
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get single member
exports.getMember = async (req, res) => {
    try {
        const member = await StudentCouncil.findById(req.params.id);
        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }
        res.json({
            success: true,
            data: member
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Add new member
exports.addMember = async (req, res) => {
    try {
        const { name, position, department, photo, pledge, email, phone, order } = req.body;

        if (!name || !position || !department) {
            return res.status(400).json({
                success: false,
                message: 'Name, position, and department are required'
            });
        }

        const member = new StudentCouncil({
            name,
            position,
            department,
            photo,
            pledge,
            email,
            phone,
            order: order || 0,
            isActive: true
        });

        await member.save();

        res.status(201).json({
            success: true,
            data: member,
            message: 'Member added successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update member
exports.updateMember = async (req, res) => {
    try {
        const { name, position, department, photo, pledge, email, phone, order, isActive } = req.body;

        const member = await StudentCouncil.findByIdAndUpdate(
            req.params.id,
            {
                name,
                position,
                department,
                photo,
                pledge,
                email,
                phone,
                order,
                isActive
            },
            { new: true }
        );

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }

        res.json({
            success: true,
            data: member,
            message: 'Member updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete member
exports.deleteMember = async (req, res) => {
    try {
        const member = await StudentCouncil.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }

        res.json({
            success: true,
            message: 'Member deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
