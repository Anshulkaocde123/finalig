// Diagnose login issue - exact simulation of login flow
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function diagnose() {
    console.log('\n=== LOGIN DIAGNOSIS ===\n');
    
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('[OK] MongoDB connected');
        console.log('[OK] DB readyState:', mongoose.connection.readyState);
    } catch(e) {
        console.log('[FAIL] MongoDB connection failed:', e.message);
        console.log('\n*** THIS IS THE PROBLEM ***');
        console.log('*** IP not whitelisted in MongoDB Atlas ***');
        process.exit(1);
    }

    // Step 1: Raw DB check
    const db = mongoose.connection.db;
    const admin = await db.collection('admins').findOne({ username: 'admin' });
    
    if (!admin) {
        console.log('[FAIL] No admin with username "admin" in DB');
        console.log('Creating admin now...');
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('admin123', salt);
        await db.collection('admins').insertOne({
            username: 'admin', studentId: '00000', email: 'admin@vnit.ac.in',
            password: hash, name: 'VNIT Super Admin', provider: 'local',
            verified: true, role: 'super_admin', isTrusted: true, isActive: true,
            hierarchyLevel: 100, createdAt: new Date(), updatedAt: new Date()
        });
        console.log('[FIXED] Admin created with admin/admin123');
    } else {
        console.log('[OK] Admin found in DB');
        console.log('  username:', admin.username);
        console.log('  email:', admin.email);
        console.log('  role:', admin.role);
        console.log('  isActive:', admin.isActive);
        console.log('  has password:', !!admin.password);
        
        if (admin.password) {
            const isValidHash = admin.password.startsWith('$2');
            console.log('  valid bcrypt hash:', isValidHash);
            
            if (isValidHash) {
                const matches = await bcrypt.compare('admin123', admin.password);
                console.log('  password admin123 matches:', matches);
                
                if (!matches) {
                    console.log('\n[FIXING] Password does not match! Resetting...');
                    const salt = await bcrypt.genSalt(10);
                    const hash = await bcrypt.hash('admin123', salt);
                    await db.collection('admins').updateOne(
                        { _id: admin._id },
                        { $set: { password: hash } }
                    );
                    console.log('[FIXED] Password reset to admin123');
                }
            } else {
                console.log('\n[FIXING] Password is not a valid bcrypt hash! Resetting...');
                const salt = await bcrypt.genSalt(10);
                const hash = await bcrypt.hash('admin123', salt);
                await db.collection('admins').updateOne(
                    { _id: admin._id },
                    { $set: { password: hash } }
                );
                console.log('[FIXED] Password reset to admin123');
            }
        } else {
            console.log('\n[FIXING] No password set! Adding password...');
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash('admin123', salt);
            await db.collection('admins').updateOne(
                { _id: admin._id },
                { $set: { password: hash } }
            );
            console.log('[FIXED] Password set to admin123');
        }
        
        // Check isActive
        if (admin.isActive === false) {
            console.log('\n[FIXING] Account is DEACTIVATED! Activating...');
            await db.collection('admins').updateOne(
                { _id: admin._id },
                { $set: { isActive: true } }
            );
            console.log('[FIXED] Account activated');
        }
    }
    
    // Step 2: Test via Mongoose model (exact same as login controller)
    console.log('\n--- Testing Mongoose login flow ---');
    const Admin = require('./models/Admin');
    
    const found = await Admin.findOne({
        $or: [
            { username: 'admin' },
            { studentId: 'admin' },
            { email: 'admin' }
        ]
    }).select('+password');
    
    if (!found) {
        console.log('[FAIL] Mongoose findOne returned null!');
        console.log('This should not happen if raw DB found the admin.');
        console.log('Check if schema indexes/unique constraints are causing issues.');
    } else {
        console.log('[OK] Mongoose found admin');
        console.log('  has password via select(+password):', !!found.password);
        
        if (found.password) {
            const result = await found.comparePassword('admin123');
            console.log('  comparePassword("admin123"):', result);
            
            if (result) {
                console.log('\n=== RESULT: LOGIN SHOULD WORK ===');
                console.log('Username: admin');
                console.log('Password: admin123');
            } else {
                console.log('\n=== RESULT: comparePassword FAILED ===');
                console.log('The password hash may be corrupted.');
                console.log('Resetting via Mongoose...');
                found.password = 'admin123';
                await found.save();
                console.log('[FIXED] Password reset via Mongoose save (will auto-hash)');
            }
        }
    }
    
    await mongoose.disconnect();
    console.log('\nDone.');
}

diagnose().catch(e => { console.error(e); process.exit(1); });
