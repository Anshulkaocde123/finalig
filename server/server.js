const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

// Load environment variables FIRST - before any other imports that need them
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('🔄 Starting VNIT IG App Server...');
console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔗 MongoDB URI: ${process.env.MONGODB_URI ? 'SET' : 'NOT SET'}`);

const connectDB = require('./config/db');

// Route imports
const matchRoutes = require('./routes/matchRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const seasonRoutes = require('./routes/seasonRoutes');
const scoringPresetRoutes = require('./routes/scoringPresetRoutes');
const studentCouncilRoutes = require('./routes/studentCouncilRoutes');
const aboutRoutes = require('./routes/aboutRoutes');
const adminRoutes = require('./routes/adminRoutes');
const playerRoutes = require('./routes/playerRoutes');
const foulRoutes = require('./routes/foulRoutes');

console.log('🔄 Starting VNIT IG App Server...');
console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);

// Connect to MongoDB asynchronously - don't block server startup
console.log('🔄 Initiating MongoDB connection in background...');
connectDB()
    .then(() => console.log('✅ MongoDB connection completed'))
    .catch((err) => console.error('❌ MongoDB connection error:', err.message));

const app = express();

// Create HTTP server for Socket.io
const server = http.createServer(app);

// Initialize Socket.io with CORS and connection settings
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
    },
    transports: ['websocket', 'polling'],
    connectTimeout: 45000,
    pingInterval: 25000,
    pingTimeout: 60000,
    upgradeSide: ['server'],
    perMessageDeflate: false,
    allowUpgrades: true
});

// Make io accessible to routes/controllers
app.set('io', io);

// ULTRA-SIMPLE TEST ROUTE (Before any middleware)
app.get('/alive', (req, res) => {
    res.json({ status: 'alive' });
});

// Socket.io status endpoint
app.get('/api/socket-status', (req, res) => {
    const clients = [];
    for (const [socketId, data] of connectedClients.entries()) {
        clients.push({
            socketId,
            connectedAt: data.connectedAt,
            transport: data.transport,
            connectedFor: Math.floor((new Date() - data.connectedAt) / 1000) + 's'
        });
    }
    res.json({
        totalClients: connectedClients.size,
        clients,
        serverTime: new Date()
    });
});

// Security middleware
// Temporarily disabled for debugging - helmet may be causing issues
// app.use(helmet());

// CORS middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));

// Compression middleware - reduces response size by ~70%
app.use(compression());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve React frontend in production
if (process.env.NODE_ENV === 'production') {
    const clientBuildPath = path.join(__dirname, '../client/dist');
    console.log('📁 Serving static files from:', clientBuildPath);
    
    const fs = require('fs');
    if (fs.existsSync(clientBuildPath)) {
        console.log('✅ Client build directory exists');
        const files = fs.readdirSync(clientBuildPath);
        console.log('📂 Files in dist:', files.slice(0, 5).join(', '));
    } else {
        console.log('❌ Client build directory NOT found');
    }
    
    app.use(express.static(clientBuildPath));
}

// Logging middleware (development only)
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// Socket.io connection handling with error management
const connectedClients = new Map();

io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);
    connectedClients.set(socket.id, {
        connectedAt: new Date(),
        transport: socket.conn.transport.name
    });
    console.log('📊 Total connected clients:', connectedClients.size);

    // Send initial connection confirmation
    socket.emit('connected', {
        socketId: socket.id,
        timestamp: new Date()
    });

    socket.on('disconnect', (reason) => {
        console.log('❌ Client disconnected:', socket.id, `(${reason})`);
        connectedClients.delete(socket.id);
        console.log('📊 Total connected clients:', connectedClients.size);
    });

    socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error.message);
    });

    socket.on('error', (error) => {
        console.error('❌ Socket error:', socket.id, error);
    });

    socket.on('ping', () => {
        socket.emit('pong');
    });
});

// Socket.io server error handling
io.engine.on('connection_error', (err) => {
    console.error('⚠️  Socket.io connection error:', err.message);
});

server.on('upgrade', (req, socket, head) => {
    console.log('🔄 WebSocket upgrade requested for:', req.url);
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
        const mongoose = require('mongoose');
        const mongoUri = process.env.MONGODB_URI || 'NOT SET';
        const maskedUri = mongoUri.replace(/\/\/.*:.*@/, '//***:***@');
        
        res.json({
            status: 'ok',
            database: {
                connected: mongoose.connection.readyState === 1,
                host: mongoose.connection.host || 'disconnected',
                database: mongoose.connection.db?.databaseName || 'unknown',
                uriMasked: maskedUri
            },
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
app.use('/api/admins', adminRoutes);
console.log('📍 Admin management routes mounted');
app.use('/api/players', playerRoutes);
console.log('📍 Player routes mounted');
app.use('/api/fouls', foulRoutes);
console.log('📍 Foul routes mounted');

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
    const fs = require('fs');
    const indexPath = path.join(clientBuildPath, 'index.html');
    
    console.log('📍 Setting up SPA fallback route');
    console.log('📁 Index path:', indexPath);
    console.log('📄 Index exists:', fs.existsSync(indexPath));
    
    // Express 5 compatible catch-all - use app.use() instead of app.get('*')
    app.use((req, res, next) => {
        // Don't interfere with API routes or uploads
        if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
            return next();
        }
        
        console.log('🔄 SPA fallback for:', req.path);
        res.sendFile(indexPath, (err) => {
            if (err) {
                console.error('❌ Error sending file:', err.message);
                res.status(500).send('Error loading application');
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

// Set socket timeout to prevent hung connections
serverInstance.setTimeout(120000); // 2 minutes
serverInstance.keepAliveTimeout = 65000;

// Handle server errors
serverInstance.on('error', (err) => {
    console.error('❌ Server Error:', err);
    process.exit(1);
});

// Handle client socket errors
serverInstance.on('clientError', (err, socket) => {
    console.error('❌ Client socket error:', err.message);
    if (socket.writable) {
        socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    }
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
