const mongoose = require('mongoose');

// Auto-seed admin account if it doesn't exist
const seedAdminAccount = async () => {
    try {
        const bcrypt = require('bcryptjs');
        const db = mongoose.connection.db;
        const adminsCollection = db.collection('admins');
        const exists = await adminsCollection.findOne({ username: 'admin' });
        if (!exists) {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash('admin123', salt);
            await adminsCollection.insertOne({
                username: 'admin',
                studentId: '00000',
                email: 'admin@vnit.ac.in',
                password: hash,
                name: 'VNIT Super Admin',
                provider: 'local',
                verified: true,
                role: 'super_admin',
                isTrusted: true,
                isActive: true,
                hierarchyLevel: 100,
                permissions: {
                    canManageMatches: true,
                    canManageLeaderboard: true,
                    canManageAdmins: true,
                    canManageDepartments: true,
                    canManageSeasons: true,
                    canManagePlayers: true,
                    canViewAnalytics: true,
                    canReviewActions: true,
                    canUndoActions: true,
                    canResetLeaderboard: true
                },
                createdAt: new Date(),
                updatedAt: new Date()
            });
            console.log('🔑 Auto-seeded admin account (admin / admin123)');
        }
    } catch (err) {
        console.warn('⚠️  Could not auto-seed admin:', err.message);
    }
};

const connectDB = async (retryCount = 0) => {
    const MAX_RETRIES = 3;
    try {
        if (!process.env.MONGODB_URI) {
            console.warn('⚠️  MONGODB_URI not set - skipping database connection');
            return null;
        }
        console.log(`🔄 Attempting MongoDB connection${retryCount > 0 ? ` (retry ${retryCount}/${MAX_RETRIES})` : ''}...`);
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 30000,
            retryWrites: true,
            w: 'majority',
            maxPoolSize: 10,
            minPoolSize: 2,
            family: 4
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

        // Auto-seed admin account on successful connection
        await seedAdminAccount();

        return conn;
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        
        // Retry on timeout errors
        if (retryCount < MAX_RETRIES && (
            error.message.includes('timed out') || 
            error.message.includes('ECONNREFUSED') ||
            error.message.includes('buffering timed out')
        )) {
            console.log(`🔄 Retrying in 3 seconds... (${retryCount + 1}/${MAX_RETRIES})`);
            await new Promise(resolve => setTimeout(resolve, 3000));
            return connectDB(retryCount + 1);
        }
        
        if (error.message.includes('querySrv') || error.message.includes('connect') || error.message.includes('ENOTFOUND') || error.message.includes('whitelist') || error.message.includes('timed out')) {
            console.error('❌ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.error('❌ Could not connect to MongoDB Atlas!');
            console.error('❌ Possible causes:');
            console.error('❌   1. Your IP is not whitelisted in MongoDB Atlas');
            console.error('❌   2. Slow internet / DNS not resolving');
            console.error('❌   3. MongoDB Atlas cluster is paused');
            console.error('❌ Fix: Go to https://cloud.mongodb.com');
            console.error('❌       → Network Access → Add IP → Allow All (0.0.0.0/0)');
            console.error('❌ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
        console.warn('⚠️  App running without MongoDB - login will NOT work!');
        return null;
    }
};

module.exports = connectDB;

