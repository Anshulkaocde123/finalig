const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    shortCode: {
        type: String,
        required: true,
        unique: true
    },
    logo: {
        type: String, // URL to the logo image
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Department', departmentSchema);
