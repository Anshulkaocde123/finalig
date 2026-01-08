const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const checkAdmin = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB\n');

        const admin = await Admin.findOne({ username: 'admin' }).select('+password');
        
        if (!admin) {
            console.log('❌ Admin not found');
            process.exit(1);
        }

        console.log('📋 Admin Details:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('ID:', admin._id);
        console.log('Username:', admin.username);
        console.log('Email:', admin.email);
        console.log('Role:', admin.role);
        console.log('Is Active:', admin.isActive);
        console.log('Password Hash:', admin.password.substring(0, 30) + '...');
        
        // Test password comparison
        console.log('\n🔐 Testing Password:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        const testPassword = 'admin123';
        const isMatch = await admin.comparePassword(testPassword);
        
        console.log(`Password "${testPassword}":`, isMatch ? '✅ CORRECT' : '❌ WRONG');
        
        // Also test direct bcrypt
        const directMatch = await bcrypt.compare(testPassword, admin.password);
        console.log('Direct bcrypt check:', directMatch ? '✅ CORRECT' : '❌ WRONG');
        
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

checkAdmin();
