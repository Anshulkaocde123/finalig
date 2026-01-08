const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.warn('⚠️  MONGODB_URI not set - skipping database connection');
            return null;
        }
        console.log('🔄 Attempting MongoDB connection...');
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,  // Reduced from 10s
            socketTimeoutMS: 45000,
            connectTimeoutMS: 5000,  // Reduced from 10s
            retryWrites: true,
            w: 'majority',
            maxPoolSize: 10,
            minPoolSize: 2
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        console.warn('⚠️  App running without MongoDB - some features may not work');
        return null;
    }
};

module.exports = connectDB;

