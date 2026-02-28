// Direct database check for admin account
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function checkAdmin() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 Checking Admin Account in Database');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const db = mongoose.connection.db;
        const adminsCollection = db.collection('admins');

        // Find all admins
        const allAdmins = await adminsCollection.find({}).toArray();
        console.log(`📊 Total admin accounts in DB: ${allAdmins.length}\n`);

        if (allAdmins.length === 0) {
            console.log('❌ NO ADMIN ACCOUNTS FOUND IN DATABASE!');
            console.log('   Your teammates need to seed the admin first.\n');
            
            // Create the admin
            console.log('🔧 Creating admin account now...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);
            
            const result = await adminsCollection.insertOne({
                username: 'admin',
                studentId: '00000',
                email: 'admin@vnit.ac.in',
                password: hashedPassword,
                name: 'VNIT Super Admin',
                provider: 'local',
                verified: true,
                role: 'super_admin',
                isTrusted: true,
                isActive: true,
                hierarchyLevel: 100,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            
            console.log('✅ Admin account CREATED!\n');
            console.log('📋 LOGIN CREDENTIALS:');
            console.log('   Username: admin');
            console.log('   Password: admin123');
            console.log('   Email:    admin@vnit.ac.in');
            console.log('   Role:     super_admin\n');
        } else {
            console.log('📋 Existing admin accounts:');
            for (const admin of allAdmins) {
                console.log(`\n   ─────────────────────────────`);
                console.log(`   👤 Username:  ${admin.username || 'N/A'}`);
                console.log(`   📧 Email:     ${admin.email || 'N/A'}`);
                console.log(`   🪪 StudentID: ${admin.studentId || 'N/A'}`);
                console.log(`   👑 Role:      ${admin.role || 'N/A'}`);
                console.log(`   🔑 Has password: ${admin.password ? 'YES' : 'NO'}`);
                console.log(`   ✅ Active:    ${admin.isActive !== false ? 'YES' : 'NO'}`);
                console.log(`   🤝 Trusted:   ${admin.isTrusted ? 'YES' : 'NO'}`);
                console.log(`   🔐 Provider:  ${admin.provider || 'N/A'}`);

                // Test password match
                if (admin.password) {
                    const matches = await bcrypt.compare('admin123', admin.password);
                    console.log(`   🔓 Password 'admin123' matches: ${matches ? '✅ YES' : '❌ NO'}`);
                    
                    if (!matches) {
                        console.log('\n   ⚠️  Password mismatch! Resetting password to admin123...');
                        const salt = await bcrypt.genSalt(10);
                        const newHash = await bcrypt.hash('admin123', salt);
                        await adminsCollection.updateOne(
                            { _id: admin._id },
                            { $set: { password: newHash, isActive: true } }
                        );
                        console.log('   ✅ Password RESET to admin123');
                    }
                } else {
                    console.log('\n   ⚠️  No password set! Setting password to admin123...');
                    const salt = await bcrypt.genSalt(10);
                    const newHash = await bcrypt.hash('admin123', salt);
                    await adminsCollection.updateOne(
                        { _id: admin._id },
                        { $set: { password: newHash, provider: 'local', isActive: true } }
                    );
                    console.log('   ✅ Password SET to admin123');
                }
            }
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ DONE! Login credentials:');
        console.log('   Username: admin');
        console.log('   Password: admin123');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await mongoose.disconnect();
    }
}

checkAdmin();
