/**
 * Database Diagnostics and Health Check
 * Comprehensive database testing and analysis
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

// Color codes
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m'
};

const log = {
    success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
    warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
    info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
    data: (msg) => console.log(`${colors.cyan}📊 ${msg}${colors.reset}`),
    section: (msg) => console.log(`\n${colors.magenta}${'━'.repeat(60)}\n${msg}\n${'━'.repeat(60)}${colors.reset}\n`)
};

// Connect to database
async function connectDB() {
    try {
        if (!process.env.MONGODB_URI) {
            log.error('MONGODB_URI not set in environment variables');
            log.info('Please set MONGODB_URI in your .env file');
            process.exit(1);
        }
        
        log.info('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });
        
        log.success(`Connected to: ${mongoose.connection.host}`);
        log.info(`Database: ${mongoose.connection.db.databaseName}`);
        
        return true;
    } catch (error) {
        log.error(`Connection failed: ${error.message}`);
        return false;
    }
}

// Check database statistics
async function checkDatabaseStats() {
    log.section('DATABASE STATISTICS');
    
    try {
        const db = mongoose.connection.db;
        const stats = await db.stats();
        
        log.data(`Database Name: ${stats.db}`);
        log.data(`Collections: ${stats.collections}`);
        log.data(`Data Size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
        log.data(`Storage Size: ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);
        log.data(`Indexes: ${stats.indexes}`);
        log.data(`Index Size: ${(stats.indexSize / 1024 / 1024).toFixed(2)} MB`);
        log.data(`Objects: ${stats.objects}`);
        
        return stats;
    } catch (error) {
        log.error(`Failed to get database stats: ${error.message}`);
        return null;
    }
}

// List all collections
async function listCollections() {
    log.section('COLLECTIONS');
    
    try {
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        
        log.info(`Found ${collections.length} collections:`);
        
        for (const collection of collections) {
            const coll = db.collection(collection.name);
            const count = await coll.countDocuments();
            const indexes = await coll.indexes();
            
            log.data(`${collection.name}`);
            log.info(`  Documents: ${count}`);
            log.info(`  Indexes: ${indexes.length}`);
            
            // Show sample document structure
            const sample = await coll.findOne();
            if (sample) {
                const fields = Object.keys(sample).filter(k => k !== '_id');
                log.info(`  Fields: ${fields.join(', ')}`);
            }
        }
        
        return collections;
    } catch (error) {
        log.error(`Failed to list collections: ${error.message}`);
        return [];
    }
}

// Test each model
async function testModels() {
    log.section('MODEL VALIDATION AND DATA CHECK');
    
    const models = [
        { name: 'About', file: './models/About.js' },
        { name: 'Admin', file: './models/Admin.js' },
        { name: 'Department', file: './models/Department.js' },
        { name: 'Foul', file: './models/Foul.js' },
        { name: 'Match', file: './models/Match.js' },
        { name: 'Player', file: './models/Player.js' },
        { name: 'PointLog', file: './models/PointLog.js' },
        { name: 'ScoringPreset', file: './models/ScoringPreset.js' },
        { name: 'Season', file: './models/Season.js' },
        { name: 'StudentCouncil', file: './models/StudentCouncil.js' }
    ];
    
    for (const model of models) {
        try {
            const Model = require(model.file);
            
            // Special handling for Match.js which exports an object
            if (model.name === 'Match') {
                const MatchModel = Model.Match; // Get the main Match model
                if (MatchModel && typeof MatchModel.countDocuments === 'function') {
                    const count = await MatchModel.countDocuments();
                    log.success(`${model.name}: ${count} documents`);
                } else {
                    log.warning(`${model.name}: Complex model structure - skipping`);
                }
                continue;
            }
            
            const count = await Model.countDocuments();
            
            log.success(`${model.name}: ${count} documents`);
            
            if (count > 0) {
                // Get a sample document
                const sample = await Model.findOne().lean();
                if (sample) {
                    const keys = Object.keys(sample);
                    log.info(`  Fields (${keys.length}): ${keys.slice(0, 10).join(', ')}${keys.length > 10 ? '...' : ''}`);
                }
                
                // Check for recent documents
                const recent = await Model.find()
                    .sort({ createdAt: -1 })
                    .limit(1)
                    .lean();
                
                if (recent.length > 0 && recent[0].createdAt) {
                    const age = Math.floor((new Date() - new Date(recent[0].createdAt)) / (1000 * 60 * 60 * 24));
                    log.info(`  Most recent: ${age} days ago`);
                }
            }
            
        } catch (error) {
            log.error(`${model.name}: ${error.message}`);
        }
    }
}

// Check indexes
async function checkIndexes() {
    log.section('INDEX ANALYSIS');
    
    try {
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        
        for (const collection of collections) {
            const coll = db.collection(collection.name);
            const indexes = await coll.indexes();
            
            log.data(`${collection.name} (${indexes.length} indexes)`);
            indexes.forEach(idx => {
                const fields = Object.keys(idx.key).join(', ');
                const unique = idx.unique ? ' [UNIQUE]' : '';
                log.info(`  ${idx.name}: {${fields}}${unique}`);
            });
        }
    } catch (error) {
        log.error(`Failed to analyze indexes: ${error.message}`);
    }
}

// Check data integrity
async function checkDataIntegrity() {
    log.section('DATA INTEGRITY CHECKS');
    
    try {
        // Check for orphaned references
        const { Match: MatchModel } = require('./models/Match.js');
        const Department = require('./models/Department.js');
        
        const matches = await MatchModel.find().lean();
        const departments = await Department.find().lean();
        const deptIds = new Set(departments.map(d => d._id.toString()));
        
        let orphanedMatches = 0;
        for (const match of matches) {
            const team1Valid = match.teamA && deptIds.has(match.teamA.toString());
            const team2Valid = match.teamB && deptIds.has(match.teamB.toString());
            
            if (!team1Valid || !team2Valid) {
                orphanedMatches++;
            }
        }
        
        if (orphanedMatches > 0) {
            log.warning(`Found ${orphanedMatches} matches with invalid department references`);
        } else {
            log.success('All match references are valid');
        }
        
        // Check for duplicate emails in admins
        const Admin = require('./models/Admin.js');
        const admins = await Admin.find().lean();
        const emails = admins.map(a => a.email);
        const duplicates = emails.filter((e, i) => emails.indexOf(e) !== i);
        
        if (duplicates.length > 0) {
            log.warning(`Found ${duplicates.length} duplicate admin emails`);
        } else {
            log.success('No duplicate admin emails');
        }
        
    } catch (error) {
        log.error(`Data integrity check failed: ${error.message}`);
    }
}

// Check connection health
async function checkConnectionHealth() {
    log.section('CONNECTION HEALTH');
    
    try {
        const state = mongoose.connection.readyState;
        const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
        
        log.data(`Connection State: ${states[state]}`);
        log.data(`Host: ${mongoose.connection.host}`);
        log.data(`Port: ${mongoose.connection.port}`);
        log.data(`Database: ${mongoose.connection.name}`);
        
        // Test query performance
        const start = Date.now();
        await mongoose.connection.db.admin().ping();
        const latency = Date.now() - start;
        
        log.data(`Ping Latency: ${latency}ms`);
        
        if (latency < 50) {
            log.success('Excellent connection speed');
        } else if (latency < 200) {
            log.success('Good connection speed');
        } else {
            log.warning('Slow connection detected');
        }
        
    } catch (error) {
        log.error(`Health check failed: ${error.message}`);
    }
}

// Performance test
async function performanceTest() {
    log.section('PERFORMANCE TEST');
    
    try {
        const Department = require('./models/Department.js');
        
        // Test read performance
        const startRead = Date.now();
        await Department.find().limit(100);
        const readTime = Date.now() - startRead;
        log.data(`Read 100 documents: ${readTime}ms`);
        
        // Test write performance (if safe)
        const startWrite = Date.now();
        const testDoc = new Department({
            name: 'PERF_TEST_' + Date.now(),
            shortCode: 'PT' + Date.now().toString().slice(-4)
        });
        await testDoc.save();
        const writeTime = Date.now() - startWrite;
        log.data(`Write 1 document: ${writeTime}ms`);
        
        // Clean up
        await Department.findByIdAndDelete(testDoc._id);
        
        // Test aggregation performance
        const startAgg = Date.now();
        await Department.aggregate([
            { $group: { _id: null, total: { $sum: 1 } } } // Count departments
        ]);
        const aggTime = Date.now() - startAgg;
        log.data(`Aggregation query: ${aggTime}ms`);
        
        if (readTime < 100 && writeTime < 100 && aggTime < 100) {
            log.success('Excellent database performance');
        } else {
            log.warning('Database performance could be improved');
        }
        
    } catch (error) {
        log.error(`Performance test failed: ${error.message}`);
    }
}

// Main execution
async function runDiagnostics() {
    console.log('\n' + colors.magenta + '━'.repeat(60));
    console.log('🔍 DATABASE DIAGNOSTICS AND HEALTH CHECK');
    console.log('━'.repeat(60) + colors.reset + '\n');
    
    try {
        // Connect to database
        const connected = await connectDB();
        if (!connected) {
            process.exit(1);
        }
        
        // Run all diagnostic tests
        await checkConnectionHealth();
        await checkDatabaseStats();
        await listCollections();
        await testModels();
        await checkIndexes();
        await checkDataIntegrity();
        await performanceTest();
        
        // Final summary
        log.section('DIAGNOSTIC COMPLETE');
        log.success('All diagnostic tests completed');
        
        // Close connection
        await mongoose.connection.close();
        log.info('Database connection closed');
        
    } catch (error) {
        log.error(`Diagnostic error: ${error.message}`);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run diagnostics
runDiagnostics();
