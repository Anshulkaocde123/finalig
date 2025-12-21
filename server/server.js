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

// Connect to MongoDB
connectDB();

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

// Start server (use 'server' not 'app' for Socket.io)
server.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
    console.log(`🔌 Socket.io ready for connections`);
});
