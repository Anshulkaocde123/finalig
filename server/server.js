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

console.log('🔄 Starting IG App Server...');
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
const highlightRoutes = require('./routes/highlightRoutes');
const { cacheMiddleware, clearCacheOnUpdate } = require('./utils/cache');
const { errorHandler } = require('./middleware/errorHandler');

// Connect to MongoDB asynchronously - don't block server startup
console.log('🔄 Initiating MongoDB connection in background...');
connectDB()
    .then(() => console.log('✅ MongoDB connection completed'))
    .catch((err) => console.error('❌ MongoDB connection error:', err.message));

const app = express();

// Create HTTP server for Socket.io
const server = http.createServer(app);

// Initialize Socket.io with CORS and connection settings
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, origin);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Make io accessible to routes/controllers
app.set('io', io);

// ── Global middleware (BEFORE any routes) ──
// Compression - reduces response size by ~70%
app.use(compression());

// ULTRA-SIMPLE TEST ROUTE (Before any middleware)
app.get('/alive', (req, res) => {
    res.json({ status: 'alive' });
});

// Socket.io status endpoint
const connectedClients = new Map();

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
// Helmet adds critical HTTP security headers (XSS, HSTS, no-sniff, etc.)
app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false, // Disable CSP in dev
    crossOriginEmbedderPolicy: false, // Required for loading external images
}));

// Rate limiting for auth endpoints to prevent brute-force attacks
const rateLimit = require('express-rate-limit');
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 attempts per window per IP
    message: { message: 'Too many login attempts. Please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});
// Relaxed limit for public GETs — campus Wi-Fi shares a single NAT IP
const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 600, // 600 req/min to accommodate 500 students behind shared NAT
    message: { message: 'Too many requests. Please slow down.' },
    standardHeaders: true,
    legacyHeaders: false,
    validate: { keyGeneratorIpFallback: false },
    // Use X-Forwarded-For so students behind same NAT aren't counted as one
    keyGenerator: (req) => {
        return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
    },
});

// Compression already applied above (before early routes)

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
io.on('connection', (socket) => {
    try {
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

        socket.on('error', (error) => {
            console.error('❌ Socket error:', socket.id, error?.message || error);
        });

        socket.on('ping', () => {
            socket.emit('pong');
        });
    } catch (err) {
        console.error('❌ Error in socket connection handler:', err?.message || err);
    }
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
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
console.log('📍 Auth routes mounted (rate-limited)');
app.use('/api/matches', apiLimiter, matchRoutes);
console.log('📍 Matches routes mounted');
app.use('/api/departments', cacheMiddleware(300), departmentRoutes);
console.log('📍 Departments routes mounted (cached 5min)');
app.use('/api/leaderboard', cacheMiddleware(30), leaderboardRoutes);
console.log('📍 Leaderboard routes mounted (cached 30s)');
app.use('/api/seasons', cacheMiddleware(300), seasonRoutes);
console.log('📍 Seasons routes mounted (cached 5min)');
app.use('/api/scoring-presets', scoringPresetRoutes);
console.log('📍 Scoring presets routes mounted');
app.use('/api/student-council', cacheMiddleware(300), studentCouncilRoutes);
console.log('📍 Student council routes mounted (cached 5min)');
app.use('/api/about', cacheMiddleware(300), aboutRoutes);
console.log('📍 About routes mounted (cached 5min)');
app.use('/api/admins', adminRoutes);
console.log('📍 Admin management routes mounted');
app.use('/api/players', playerRoutes);
console.log('📍 Player routes mounted');
app.use('/api/fouls', foulRoutes);
console.log('📍 Foul routes mounted');
app.use('/api/highlights', highlightRoutes);
console.log('📍 Highlight routes mounted');

// Error handler middleware — use the robust handler with Mongoose/JWT parsing
app.use(errorHandler);

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
console.log('🚀 IG App Server Starting');
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
