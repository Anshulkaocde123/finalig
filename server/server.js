const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Route imports
const matchRoutes = require('./routes/matchRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const seasonRoutes = require('./routes/seasonRoutes');
const scoringPresetRoutes = require('./routes/scoringPresetRoutes');
const studentCouncilRoutes = require('./routes/studentCouncilRoutes');
const aboutRoutes = require('./routes/aboutRoutes');

// Load environment variables
dotenv.config();

console.log('🔄 Starting VNIT IG App Server...');
console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);

// Connect to MongoDB
console.log('🔄 Connecting to MongoDB...');
connectDB().then(() => {
    console.log('✅ MongoDB connection completed');
}).catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    // Continue anyway - app can work without DB for now
});

const app = express();

// Create HTTP server for Socket.io
const server = http.createServer(app);

// Initialize Socket.io with CORS
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});

// Make io accessible to routes/controllers
app.set('io', io);

// ULTRA-SIMPLE TEST ROUTE (Before any middleware)
app.get('/alive', (req, res) => {
    res.json({ status: 'alive' });
});

// Security middleware
// Temporarily disabled for debugging - helmet may be causing issues
// app.use(helmet());

// CORS middleware
app.use(cors());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve React frontend in production
if (process.env.NODE_ENV === 'production') {
    const clientBuildPath = path.join(__dirname, '../client/dist');
    app.use(express.static(clientBuildPath));
}

// Logging middleware (development only)
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('❌ Client disconnected:', socket.id);
    });
});

// Health check route
app.get('/api/health', (req, res) => {
    console.log('📍 Health check requested');
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
    console.log('📍 Test endpoint requested');
    res.json({ message: 'Server is running!', timestamp: new Date().toISOString() });
});

// Debug endpoint for testing database connection
app.get('/api/debug/db-status', async (req, res) => {
    try {
        console.log('📍 DB status check requested');
        res.json({
            status: 'ok',
            database: 'ready_to_test',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ DB status error:', error.message);
        res.status(500).json({
            status: 'error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Mount routes
console.log('📍 Mounting API routes...');
app.use('/api/auth', require('./routes/authRoutes'));
console.log('📍 Auth routes mounted');
app.use('/api/matches', matchRoutes);
console.log('📍 Matches routes mounted');
app.use('/api/departments', departmentRoutes);
console.log('📍 Departments routes mounted');
app.use('/api/leaderboard', leaderboardRoutes);
console.log('📍 Leaderboard routes mounted');
app.use('/api/seasons', seasonRoutes);
console.log('📍 Seasons routes mounted');
app.use('/api/scoring-presets', scoringPresetRoutes);
console.log('📍 Scoring presets routes mounted');
app.use('/api/student-council', studentCouncilRoutes);
console.log('📍 Student council routes mounted');
app.use('/api/about', aboutRoutes);
console.log('📍 About routes mounted');

// Error handler middleware
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        success: false,
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
});

// React fallback for client-side routing - AFTER all API routes
if (process.env.NODE_ENV === 'production') {
    const clientBuildPath = path.join(__dirname, '../client/dist');
    // Use app.use() for fallback catch-all (Express 5 compatible)
    app.use((req, res, next) => {
        // Don't interfere with API routes
        if (req.path.startsWith('/api')) {
            return res.status(404).json({ error: 'API route not found' });
        }
        res.sendFile(path.join(clientBuildPath, 'index.html'), (err) => {
            if (err) {
                console.error('Error sending file:', err.message);
                res.status(500).json({ error: 'Failed to load page' });
            }
        });
    });
}

// Port configuration
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Always bind to 0.0.0.0 for Railway

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🚀 VNIT IG App Server Starting');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔌 Binding to: ${HOST}:${PORT}`);
console.log(`🗄️  Database: ${process.env.MONGODB_URI ? 'Configured' : 'NOT SET'}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Start server (use 'server' not 'app' for Socket.io)
const serverInstance = server.listen(PORT, HOST, () => {
    console.log(`✅ Server successfully listening on ${HOST}:${PORT}`);
    console.log(`🔌 Socket.io ready for connections`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

// Handle server errors
serverInstance.on('error', (err) => {
    console.error('❌ Server Error:', err);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection:', err);
    process.exit(1);
});
