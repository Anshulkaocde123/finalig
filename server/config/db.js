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

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.warn('⚠️  MONGODB_URI not set - skipping database connection');
            return null;
        }
        console.log('🔄 Attempting MongoDB connection...');
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 5000,
            retryWrites: true,
            w: 'majority',
            maxPoolSize: 10,
            minPoolSize: 2
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

        // Auto-seed admin account on successful connection
        await seedAdminAccount();

        return conn;
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        if (error.message.includes('querySrv') || error.message.includes('connect') || error.message.includes('ENOTFOUND')) {
            console.error('❌ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.error('❌ Your IP may NOT be whitelisted in MongoDB Atlas!');
            console.error('❌ Fix: Go to https://cloud.mongodb.com');
            console.error('❌       → Network Access → Add IP → Allow All (0.0.0.0/0)');
            console.error('❌ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
        console.warn('⚠️  App running without MongoDB - login will NOT work!');
        return null;
    }
};

module.exports = connectDB;

