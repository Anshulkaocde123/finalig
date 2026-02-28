/**
 * Comprehensive Backend Test Suite
 * Tests all API endpoints, database operations, and backend functionality
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Color codes for console output
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
    test: (msg) => console.log(`${colors.cyan}🧪 ${msg}${colors.reset}`),
    section: (msg) => console.log(`\n${colors.magenta}${'━'.repeat(60)}\n${msg}\n${'━'.repeat(60)}${colors.reset}\n`)
};

// Test results tracking
const results = {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
    tests: []
};

function recordTest(name, status, message = '') {
    results.total++;
    results.tests.push({ name, status, message });
    
    if (status === 'pass') {
        results.passed++;
        log.success(`${name}: PASSED ${message}`);
    } else if (status === 'fail') {
        results.failed++;
        log.error(`${name}: FAILED ${message}`);
    } else if (status === 'warn') {
        results.warnings++;
        log.warning(`${name}: WARNING ${message}`);
    }
}

// Database connection test
async function testDatabaseConnection() {
    log.section('DATABASE CONNECTION TEST');
    
    try {
        if (!process.env.MONGODB_URI) {
            recordTest('MongoDB URI Check', 'fail', 'MONGODB_URI not set in environment');
            return false;
        }
        
        recordTest('MongoDB URI Check', 'pass', 'URI is configured');
        
        log.info('Attempting to connect to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });
        
        recordTest('MongoDB Connection', 'pass', `Connected to ${mongoose.connection.host}`);
        
        // Test database operations
        const collections = await mongoose.connection.db.listCollections().toArray();
        log.info(`Found ${collections.length} collections`);
        collections.forEach(col => log.info(`  - ${col.name}`));
        
        recordTest('Collection Discovery', 'pass', `${collections.length} collections found`);
        
        return true;
    } catch (error) {
        recordTest('MongoDB Connection', 'fail', error.message);
        return false;
    }
}

// Model validation tests
async function testModels() {
    log.section('MODEL VALIDATION TESTS');
    
    const modelFiles = [
        'About.js',
        'Admin.js',
        'Department.js',
        'Foul.js',
        'Match.js',
        'Player.js',
        'PointLog.js',
        'ScoringPreset.js',
        'Season.js',
        'StudentCouncil.js'
    ];
    
    for (const modelFile of modelFiles) {
        try {
            const modelPath = path.join(__dirname, 'models', modelFile);
            const Model = require(modelPath);
            const modelName = modelFile.replace('.js', '');
            
            // Special handling for Match.js which exports an object
            if (modelName === 'Match') {
                if (Model && Model.Match) {
                    recordTest(`Model: ${modelName}`, 'pass', `Multiple schemas exported`);
                    const exportedModels = Object.keys(Model).filter(k => !k.startsWith('_'));
                    log.info(`  Exports: ${exportedModels.join(', ')}`);
                } else {
                    recordTest(`Model: ${modelName}`, 'warn', 'Model structure unclear');
                }
                continue;
            }
            
            if (Model && Model.modelName) {
                recordTest(`Model: ${modelName}`, 'pass', `Schema loaded successfully`);
                
                // Check if model has required methods
                if (Model.schema) {
                    const requiredMethods = Model.schema.methods || {};
                    const staticMethods = Model.schema.statics || {};
                    log.info(`  Methods: ${Object.keys(requiredMethods).length}, Statics: ${Object.keys(staticMethods).length}`);
                }
            } else {
                recordTest(`Model: ${modelName}`, 'warn', 'Model loaded but structure unclear');
            }
        } catch (error) {
            recordTest(`Model: ${modelFile}`, 'fail', error.message);
        }
    }
}

// Controller validation tests
async function testControllers() {
    log.section('CONTROLLER VALIDATION TESTS');
    
    const controllerFiles = [
        'aboutController.js',
        'adminController.js',
        'authController.js',
        'departmentController.js',
        'foulController.js',
        'leaderboardController.js',
        'matchController.js',
        'playerController.js',
        'scoringPresetController.js',
        'seasonController.js',
        'studentCouncilController.js'
    ];
    
    for (const controllerFile of controllerFiles) {
        try {
            const controllerPath = path.join(__dirname, 'controllers', controllerFile);
            const controller = require(controllerPath);
            const controllerName = controllerFile.replace('Controller.js', '');
            
            if (controller && typeof controller === 'object') {
                const methods = Object.keys(controller);
                recordTest(`Controller: ${controllerName}`, 'pass', `${methods.length} methods found`);
                log.info(`  Methods: ${methods.join(', ')}`);
            } else {
                recordTest(`Controller: ${controllerName}`, 'warn', 'Controller structure unclear');
            }
        } catch (error) {
            recordTest(`Controller: ${controllerFile}`, 'fail', error.message);
        }
    }
}

// Middleware validation tests
async function testMiddleware() {
    log.section('MIDDLEWARE VALIDATION TESTS');
    
    const middlewareFiles = [
        'authMiddleware.js',
        'uploadMiddleware.js'
    ];
    
    for (const middlewareFile of middlewareFiles) {
        try {
            const middlewarePath = path.join(__dirname, 'middleware', middlewareFile);
            const middleware = require(middlewarePath);
            const middlewareName = middlewareFile.replace('.js', '');
            
            if (middleware) {
                recordTest(`Middleware: ${middlewareName}`, 'pass', 'Loaded successfully');
                
                // Check if it's a function or object with functions
                if (typeof middleware === 'function') {
                    log.info(`  Type: Function middleware`);
                } else if (typeof middleware === 'object') {
                    const keys = Object.keys(middleware);
                    log.info(`  Type: Object with ${keys.length} exports`);
                    log.info(`  Exports: ${keys.join(', ')}`);
                }
            } else {
                recordTest(`Middleware: ${middlewareName}`, 'warn', 'Loaded but structure unclear');
            }
        } catch (error) {
            recordTest(`Middleware: ${middlewareFile}`, 'fail', error.message);
        }
    }
}

// Route validation tests
async function testRoutes() {
    log.section('ROUTE VALIDATION TESTS');
    
    const routeFiles = [
        'aboutRoutes.js',
        'adminRoutes.js',
        'authRoutes.js',
        'departmentRoutes.js',
        'foulRoutes.js',
        'leaderboardRoutes.js',
        'matchRoutes.js',
        'playerRoutes.js',
        'scoringPresetRoutes.js',
        'seasonRoutes.js',
        'studentCouncilRoutes.js'
    ];
    
    for (const routeFile of routeFiles) {
        try {
            const routePath = path.join(__dirname, 'routes', routeFile);
            const router = require(routePath);
            const routeName = routeFile.replace('Routes.js', '');
            
            if (router && router.stack) {
                const routes = router.stack
                    .filter(r => r.route)
                    .map(r => ({
                        path: r.route.path,
                        methods: Object.keys(r.route.methods).join(', ').toUpperCase()
                    }));
                
                recordTest(`Routes: ${routeName}`, 'pass', `${routes.length} endpoints defined`);
                routes.forEach(r => log.info(`  ${r.methods} ${r.path}`));
            } else {
                recordTest(`Routes: ${routeName}`, 'warn', 'Router loaded but endpoints unclear');
            }
        } catch (error) {
            recordTest(`Routes: ${routeFile}`, 'fail', error.message);
        }
    }
}

// Database CRUD operations test
async function testDatabaseOperations() {
    log.section('DATABASE CRUD OPERATIONS TEST');
    
    try {
        const Department = require('./models/Department');
        
        // Test CREATE
        log.test('Testing CREATE operation...');
        const testDept = new Department({
            name: 'TEST_DEPARTMENT_' + Date.now(),
            shortCode: 'TEST' + Date.now().toString().slice(-4)
        });
        
        await testDept.save();
        recordTest('CREATE Operation', 'pass', `Created department with ID: ${testDept._id}`);
        
        // Test READ
        log.test('Testing READ operation...');
        const foundDept = await Department.findById(testDept._id);
        if (foundDept && foundDept.name === testDept.name) {
            recordTest('READ Operation', 'pass', 'Successfully retrieved created document');
        } else {
            recordTest('READ Operation', 'fail', 'Could not retrieve or verify document');
        }
        
        // Test UPDATE
        log.test('Testing UPDATE operation...');
        foundDept.logo = 'http://test.com/logo.png';
        await foundDept.save();
        const updatedDept = await Department.findById(testDept._id);
        if (updatedDept.logo === 'http://test.com/logo.png') {
            recordTest('UPDATE Operation', 'pass', 'Successfully updated document');
        } else {
            recordTest('UPDATE Operation', 'fail', 'Update did not persist');
        }
        
        // Test DELETE
        log.test('Testing DELETE operation...');
        await Department.findByIdAndDelete(testDept._id);
        const deletedDept = await Department.findById(testDept._id);
        if (!deletedDept) {
            recordTest('DELETE Operation', 'pass', 'Successfully deleted document');
        } else {
            recordTest('DELETE Operation', 'fail', 'Document still exists after delete');
        }
        
    } catch (error) {
        recordTest('Database CRUD Operations', 'fail', error.message);
    }
}

// Environment variables check
function testEnvironmentVariables() {
    log.section('ENVIRONMENT VARIABLES CHECK');
    
    const requiredVars = [
        'MONGODB_URI',
        'JWT_SECRET',
        'NODE_ENV'
    ];
    
    const optionalVars = [
        'PORT',
        'CORS_ORIGIN',
        'GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_SECRET',
        'GOOGLE_CALLBACK_URL'
    ];
    
    requiredVars.forEach(varName => {
        if (process.env[varName]) {
            recordTest(`Env Var: ${varName}`, 'pass', 'Set');
        } else {
            recordTest(`Env Var: ${varName}`, 'fail', 'NOT SET (Required)');
        }
    });
    
    optionalVars.forEach(varName => {
        if (process.env[varName]) {
            recordTest(`Env Var: ${varName}`, 'pass', 'Set (Optional)');
        } else {
            recordTest(`Env Var: ${varName}`, 'warn', 'Not set (Optional)');
        }
    });
}

// Dependency check
function testDependencies() {
    log.section('DEPENDENCY CHECK');
    
    const packageJson = require('./package.json');
    const dependencies = packageJson.dependencies || {};
    
    log.info(`Checking ${Object.keys(dependencies).length} dependencies...`);
    
    let missingDeps = 0;
    for (const [dep, version] of Object.entries(dependencies)) {
        try {
            require(dep);
            log.info(`  ✓ ${dep}@${version}`);
        } catch (error) {
            log.error(`  ✗ ${dep}@${version} - MISSING`);
            missingDeps++;
        }
    }
    
    if (missingDeps === 0) {
        recordTest('Dependencies', 'pass', 'All dependencies available');
    } else {
        recordTest('Dependencies', 'fail', `${missingDeps} missing dependencies`);
    }
}

// Print final report
function printReport() {
    log.section('TEST RESULTS SUMMARY');
    
    console.log(`${colors.cyan}Total Tests: ${results.total}${colors.reset}`);
    console.log(`${colors.green}Passed: ${results.passed}${colors.reset}`);
    console.log(`${colors.red}Failed: ${results.failed}${colors.reset}`);
    console.log(`${colors.yellow}Warnings: ${results.warnings}${colors.reset}`);
    
    const passRate = ((results.passed / results.total) * 100).toFixed(2);
    console.log(`\n${colors.cyan}Pass Rate: ${passRate}%${colors.reset}`);
    
    if (results.failed > 0) {
        console.log(`\n${colors.red}Failed Tests:${colors.reset}`);
        results.tests
            .filter(t => t.status === 'fail')
            .forEach(t => console.log(`  ❌ ${t.name}: ${t.message}`));
    }
    
    if (results.warnings > 0) {
        console.log(`\n${colors.yellow}Warnings:${colors.reset}`);
        results.tests
            .filter(t => t.status === 'warn')
            .forEach(t => console.log(`  ⚠️  ${t.name}: ${t.message}`));
    }
    
    console.log('\n' + colors.magenta + '━'.repeat(60) + colors.reset);
}

// Main test execution
async function runAllTests() {
    console.log('\n' + colors.magenta + '━'.repeat(60));
    console.log('🧪 COMPREHENSIVE BACKEND TEST SUITE');
    console.log('━'.repeat(60) + colors.reset + '\n');
    
    try {
        // Phase 1: Environment and Dependencies
        testEnvironmentVariables();
        testDependencies();
        
        // Phase 2: Database Connection
        const dbConnected = await testDatabaseConnection();
        
        // Phase 3: Code Structure
        await testModels();
        await testControllers();
        await testMiddleware();
        await testRoutes();
        
        // Phase 4: Database Operations (only if connected)
        if (dbConnected) {
            await testDatabaseOperations();
        } else {
            log.warning('Skipping database operations test (no DB connection)');
        }
        
        // Print final report
        printReport();
        
        // Close database connection
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            log.info('Database connection closed');
        }
        
        // Exit with appropriate code
        process.exit(results.failed > 0 ? 1 : 0);
        
    } catch (error) {
        log.error(`Test suite error: ${error.message}`);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run tests
runAllTests();
