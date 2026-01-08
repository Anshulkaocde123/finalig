const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

const createSuperAdmin = async () => {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // Check if super admin already exists
        const exists = await Admin.findOne({ 
            $or: [
                { username: 'admin' }, 
                { email: 'admin@vnit.ac.in' },
                { role: 'super_admin' }
            ] 
        });
        
        if (exists) {
            console.log('⚠️  Super admin already exists');
            console.log('Username:', exists.username);
            console.log('Email:', exists.email);
            console.log('Role:', exists.role);
            process.exit(0);
        }

        // Create super admin
        const admin = await Admin.create({
            username: 'admin',
            studentId: '00000',
            email: 'admin@vnit.ac.in',
            password: 'admin123', // Will be hashed by pre-save hook
            name: 'VNIT Super Admin',
            provider: 'local',
            verified: true,
            role: 'super_admin',
            isTrusted: true
        });

        console.log('\n✅ Super Admin created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📋 LOGIN CREDENTIALS:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Username: admin');
        console.log('Password: admin123');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Admin ID:', admin._id);
        console.log('Role:', admin.role);
        console.log('\n⚠️  IMPORTANT: Change this password after first login!');
        
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

createSuperAdmin();
