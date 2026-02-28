#!/usr/bin/env node

/**
 * Backend Debugging and Issue Detection Script
 * Checks for common backend issues and provides solutions
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Color codes
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m',
    bold: '\x1b[1m'
};

const log = {
    success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
    warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
    info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
    debug: (msg) => console.log(`${colors.cyan}🔍 ${msg}${colors.reset}`),
    section: (msg) => console.log(`\n${colors.magenta}${colors.bold}${'━'.repeat(60)}\n${msg}\n${'━'.repeat(60)}${colors.reset}\n`)
};

const issues = [];
const solutions = [];

// Check if .env file exists
function checkEnvFile() {
    log.section('ENVIRONMENT FILE CHECK');
    
    const envPath = path.join(__dirname, '.env');
    
    if (!fs.existsSync(envPath)) {
        log.error('.env file not found');
        issues.push('Missing .env file');
        solutions.push('Create a .env file in the server directory with required variables');
        return false;
    }
    
    log.success('.env file exists');
    
    // Load and check environment variables
    dotenv.config({ path: envPath });
    
    const requiredVars = [
        { name: 'MONGODB_URI', description: 'MongoDB connection string' },
        { name: 'JWT_SECRET', description: 'JWT authentication secret' }
    ];
    
    const optionalVars = [
        { name: 'NODE_ENV', default: 'development' },
        { name: 'PORT', default: '5000' },
        { name: 'CORS_ORIGIN', default: '*' }
    ];
    
    let missingRequired = false;
    
    for (const varInfo of requiredVars) {
        if (!process.env[varInfo.name]) {
            log.error(`${varInfo.name} is not set`);
            issues.push(`Missing required environment variable: ${varInfo.name}`);
            solutions.push(`Add ${varInfo.name}=${varInfo.description} to your .env file`);
            missingRequired = true;
        } else {
            log.success(`${varInfo.name} is configured`);
        }
    }
    
    for (const varInfo of optionalVars) {
        if (!process.env[varInfo.name]) {
            log.warning(`${varInfo.name} not set (will use default: ${varInfo.default})`);
        } else {
            log.info(`${varInfo.name} = ${process.env[varInfo.name]}`);
        }
    }
    
    return !missingRequired;
}

// Check if node_modules exists
function checkNodeModules() {
    log.section('DEPENDENCIES CHECK');
    
    const nodeModulesPath = path.join(__dirname, 'node_modules');
    
    if (!fs.existsSync(nodeModulesPath)) {
        log.error('node_modules directory not found');
        issues.push('Dependencies not installed');
        solutions.push('Run: npm install');
        return false;
    }
    
    log.success('node_modules directory exists');
    
    // Check package.json
    const packageJsonPath = path.join(__dirname, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
        log.error('package.json not found');
        issues.push('Missing package.json');
        return false;
    }
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    log.info(`Project: ${packageJson.name || 'Unnamed'}`);
    log.info(`Version: ${packageJson.version || 'Unknown'}`);
    
    // Check if critical dependencies exist
    const criticalDeps = ['express', 'mongoose', 'dotenv'];
    let missingDeps = [];
    
    for (const dep of criticalDeps) {
        const depPath = path.join(__dirname, 'node_modules', dep);
        if (!fs.existsSync(depPath)) {
            log.error(`Missing dependency: ${dep}`);
            missingDeps.push(dep);
        } else {
            log.success(`Dependency found: ${dep}`);
        }
    }
    
    if (missingDeps.length > 0) {
        issues.push(`Missing dependencies: ${missingDeps.join(', ')}`);
        solutions.push('Run: npm install');
        return false;
    }
    
    return true;
}

// Check directory structure
function checkDirectoryStructure() {
    log.section('DIRECTORY STRUCTURE CHECK');
    
    const requiredDirs = [
        'controllers',
        'models',
        'routes',
        'config',
        'middleware'
    ];
    
    let allExists = true;
    
    for (const dir of requiredDirs) {
        const dirPath = path.join(__dirname, dir);
        if (!fs.existsSync(dirPath)) {
            log.error(`Missing directory: ${dir}`);
            issues.push(`Missing directory: ${dir}`);
            allExists = false;
        } else {
            const files = fs.readdirSync(dirPath);
            log.success(`${dir}/ (${files.length} files)`);
        }
    }
    
    // Check for uploads directory (optional but commonly needed)
    const uploadsPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsPath)) {
        log.warning('uploads/ directory not found (will be created when needed)');
    } else {
        log.info('uploads/ directory exists');
    }
    
    return allExists;
}

// Check for common file issues
function checkFileIssues() {
    log.section('FILE INTEGRITY CHECK');
    
    // Check server.js
    const serverPath = path.join(__dirname, 'server.js');
    if (!fs.existsSync(serverPath)) {
        log.error('server.js not found');
        issues.push('Missing main server file');
        solutions.push('Ensure server.js exists in the server directory');
        return false;
    }
    log.success('server.js exists');
    
    // Check for syntax errors in server.js
    try {
        const content = fs.readFileSync(serverPath, 'utf8');
        if (content.includes('require(') && content.includes('module.exports')) {
            log.success('server.js appears to be valid JavaScript');
        }
    } catch (error) {
        log.error(`Error reading server.js: ${error.message}`);
        issues.push('Cannot read server.js');
        return false;
    }
    
    // Check config/db.js
    const dbConfigPath = path.join(__dirname, 'config', 'db.js');
    if (!fs.existsSync(dbConfigPath)) {
        log.error('config/db.js not found');
        issues.push('Missing database configuration');
        solutions.push('Create config/db.js with MongoDB connection logic');
        return false;
    }
    log.success('config/db.js exists');
    
    return true;
}

// Check for port conflicts
function checkPortAvailability() {
    log.section('PORT AVAILABILITY CHECK');
    
    const net = require('net');
    const port = process.env.PORT || 5000;
    
    return new Promise((resolve) => {
        const server = net.createServer();
        
        server.once('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                log.error(`Port ${port} is already in use`);
                issues.push(`Port ${port} is occupied`);
                solutions.push(`Kill the process using port ${port} or use a different PORT in .env`);
                solutions.push(`Find process: lsof -ti:${port}`);
                solutions.push(`Kill process: kill -9 $(lsof -ti:${port})`);
                resolve(false);
            } else {
                log.error(`Port check error: ${err.message}`);
                resolve(false);
            }
        });
        
        server.once('listening', () => {
            log.success(`Port ${port} is available`);
            server.close();
            resolve(true);
        });
        
        server.listen(port);
    });
}

// Check MongoDB connection
async function checkMongoDBConnection() {
    log.section('MONGODB CONNECTION CHECK');
    
    if (!process.env.MONGODB_URI) {
        log.warning('MONGODB_URI not set, skipping connection check');
        return true;
    }
    
    try {
        const mongoose = require('mongoose');
        
        log.info('Attempting to connect to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000
        });
        
        log.success('MongoDB connection successful');
        log.info(`Host: ${mongoose.connection.host}`);
        log.info(`Database: ${mongoose.connection.db.databaseName}`);
        
        await mongoose.connection.close();
        return true;
        
    } catch (error) {
        log.error(`MongoDB connection failed: ${error.message}`);
        issues.push('Cannot connect to MongoDB');
        solutions.push('Verify MONGODB_URI is correct');
        solutions.push('Check network connectivity');
        solutions.push('Verify MongoDB Atlas/server is running');
        return false;
    }
}

// Check for common code issues
function checkCommonCodeIssues() {
    log.section('CODE QUALITY CHECK');
    
    const serverPath = path.join(__dirname, 'server.js');
    const content = fs.readFileSync(serverPath, 'utf8');
    
    // Check for common issues
    if (!content.includes('express()')) {
        log.warning('Express app initialization not found');
    } else {
        log.success('Express app initialized');
    }
    
    if (!content.includes('listen(')) {
        log.error('Server.listen() not found');
        issues.push('Server does not appear to start listening');
    } else {
        log.success('Server listen() found');
    }
    
    if (!content.includes('connectDB') && !content.includes('mongoose.connect')) {
        log.warning('Database connection not found in server.js');
    } else {
        log.success('Database connection code found');
    }
    
    return true;
}

// Print summary
function printSummary() {
    log.section('DIAGNOSTIC SUMMARY');
    
    if (issues.length === 0) {
        console.log(`${colors.green}${colors.bold}✨ No issues found! Backend appears healthy.${colors.reset}\n`);
        log.info('You can start the server with: npm run server');
        log.info('Or run tests with: npm run test:backend');
    } else {
        console.log(`${colors.red}${colors.bold}⚠️  Found ${issues.length} issue(s):${colors.reset}\n`);
        issues.forEach((issue, i) => {
            console.log(`${i + 1}. ${colors.red}${issue}${colors.reset}`);
        });
        
        console.log(`\n${colors.yellow}${colors.bold}💡 Suggested Solutions:${colors.reset}\n`);
        solutions.forEach((solution, i) => {
            console.log(`${i + 1}. ${colors.yellow}${solution}${colors.reset}`);
        });
    }
    
    console.log('\n' + colors.magenta + '━'.repeat(60) + colors.reset);
}

// Main execution
async function runDiagnostics() {
    console.log('\n' + colors.magenta + colors.bold + '━'.repeat(60));
    console.log('🔍 BACKEND DEBUGGING & ISSUE DETECTION');
    console.log('━'.repeat(60) + colors.reset + '\n');
    
    checkEnvFile();
    checkNodeModules();
    checkDirectoryStructure();
    checkFileIssues();
    await checkPortAvailability();
    await checkMongoDBConnection();
    checkCommonCodeIssues();
    
    printSummary();
}

// Run diagnostics
runDiagnostics().catch(error => {
    log.error(`Diagnostic error: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
});
