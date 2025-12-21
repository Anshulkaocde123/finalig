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

// Security middleware
app.use(helmet());

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
    
    // Fallback to index.html for client-side routing
    // Use a regex to match any path — compatible with path-to-regexp
    app.get(/.*/, (req, res) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.join(clientBuildPath, 'index.html'));
        }
    });
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
    res.json({ status: 'ok', sockets: io.engine.clientsCount });
});

// Debug endpoint for testing database connection
app.get('/api/debug/db-status', async (req, res) => {
    try {
        const adminCount = await require('./models/Admin').countDocuments();
        const deptCount = await require('./models/Department').countDocuments();
        const seasonCount = await require('./models/Season').countDocuments();
        const matchCount = await require('./models/Match').countDocuments();
        
        res.json({
            status: 'ok',
            database: 'connected',
            collections: {
                admins: adminCount,
                departments: deptCount,
                seasons: seasonCount,
                matches: matchCount
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Mount routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/matches', matchRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/seasons', seasonRoutes);
app.use('/api/scoring-presets', scoringPresetRoutes);
app.use('/api/student-council', studentCouncilRoutes);
app.use('/api/about', aboutRoutes);

// Error handler middleware
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        success: false,
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
});

// Port configuration
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// Start server (use 'server' not 'app' for Socket.io)
const serverInstance = server.listen(PORT, HOST, () => {
    console.log(`🚀 Server listening on ${HOST}:${PORT}`);
    console.log(`🔌 Socket.io ready for connections`);
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
