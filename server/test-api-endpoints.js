/**
 * API Endpoint Testing Script
 * Tests all REST API endpoints with actual HTTP requests
 */

const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

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
    test: (msg) => console.log(`${colors.cyan}🧪 ${msg}${colors.reset}`),
    section: (msg) => console.log(`\n${colors.magenta}${'━'.repeat(60)}\n${msg}\n${'━'.repeat(60)}${colors.reset}\n`)
};

// Test results
const results = {
    total: 0,
    passed: 0,
    failed: 0,
    endpoints: []
};

// Helper function to test endpoint
async function testEndpoint(method, endpoint, data = null, description = '') {
    results.total++;
    const fullUrl = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
    
    try {
        log.test(`${method.toUpperCase()} ${endpoint} - ${description}`);
        
        let response;
        const config = {
            timeout: 10000,
            validateStatus: () => true // Don't throw on any status
        };
        
        switch (method.toLowerCase()) {
            case 'get':
                response = await axios.get(fullUrl, config);
                break;
            case 'post':
                response = await axios.post(fullUrl, data, config);
                break;
            case 'put':
                response = await axios.put(fullUrl, data, config);
                break;
            case 'delete':
                response = await axios.delete(fullUrl, config);
                break;
            default:
                throw new Error(`Unknown method: ${method}`);
        }
        
        const success = response.status >= 200 && response.status < 500;
        
        if (success) {
            results.passed++;
            log.success(`Status: ${response.status} - ${description || 'Success'}`);
            log.info(`Response: ${JSON.stringify(response.data).substring(0, 100)}...`);
        } else {
            results.failed++;
            log.error(`Status: ${response.status} - ${description || 'Failed'}`);
        }
        
        results.endpoints.push({
            method,
            endpoint,
            status: response.status,
            success,
            description,
            responseTime: response.headers['x-response-time'] || 'N/A'
        });
        
        return response;
        
    } catch (error) {
        results.failed++;
        log.error(`${method.toUpperCase()} ${endpoint} - ${error.message}`);
        results.endpoints.push({
            method,
            endpoint,
            status: 'ERROR',
            success: false,
            description,
            error: error.message
        });
        return null;
    }
}

// Test health endpoints
async function testHealthEndpoints() {
    log.section('HEALTH CHECK ENDPOINTS');
    
    await testEndpoint('GET', '/health', null, 'Health check');
    await testEndpoint('GET', '/test', null, 'Test endpoint');
    await testEndpoint('GET', '/debug/db-status', null, 'Database status');
    await testEndpoint('GET', `${BASE_URL}/alive`, null, 'Alive check');
    await testEndpoint('GET', `${BASE_URL}/api/socket-status`, null, 'Socket status');
}

// Test auth endpoints
async function testAuthEndpoints() {
    log.section('AUTHENTICATION ENDPOINTS');
    
    await testEndpoint('POST', '/auth/login', {
        email: 'test@example.com',
        password: 'testpassword'
    }, 'Login (should fail - demo)');
    
    await testEndpoint('POST', '/auth/register', {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'Test User'
    }, 'Register (should fail - demo)');
    
    await testEndpoint('POST', '/auth/google', {}, 'Google OAuth (should fail - demo)');
}

// Test department endpoints
async function testDepartmentEndpoints() {
    log.section('DEPARTMENT ENDPOINTS');
    
    await testEndpoint('GET', '/departments', null, 'Get all departments');
    await testEndpoint('POST', '/departments', {
        name: 'Test Department',
        abbreviation: 'TEST',
        description: 'Test'
    }, 'Create department (may need auth)');
}

// Test season endpoints
async function testSeasonEndpoints() {
    log.section('SEASON ENDPOINTS');
    
    await testEndpoint('GET', '/seasons', null, 'Get all seasons');
    await testEndpoint('GET', '/seasons/active', null, 'Get active season');
    await testEndpoint('POST', '/seasons', {
        name: 'Test Season 2025',
        year: 2025,
        startDate: new Date(),
        isActive: false
    }, 'Create season (may need auth)');
}

// Test match endpoints
async function testMatchEndpoints() {
    log.section('MATCH ENDPOINTS');
    
    await testEndpoint('GET', '/matches', null, 'Get all matches');
    await testEndpoint('GET', '/matches/live', null, 'Get live matches');
    await testEndpoint('GET', '/matches/upcoming', null, 'Get upcoming matches');
    await testEndpoint('GET', '/matches/completed', null, 'Get completed matches');
}

// Test player endpoints
async function testPlayerEndpoints() {
    log.section('PLAYER ENDPOINTS');
    
    await testEndpoint('GET', '/players', null, 'Get all players');
    await testEndpoint('POST', '/players', {
        name: 'Test Player',
        department: 'TEST',
        email: 'player@test.com'
    }, 'Create player (may need auth)');
}

// Test leaderboard endpoints
async function testLeaderboardEndpoints() {
    log.section('LEADERBOARD ENDPOINTS');
    
    await testEndpoint('GET', '/leaderboard', null, 'Get leaderboard');
    await testEndpoint('GET', '/leaderboard/current', null, 'Get current leaderboard');
}

// Test scoring preset endpoints
async function testScoringPresetEndpoints() {
    log.section('SCORING PRESET ENDPOINTS');
    
    await testEndpoint('GET', '/scoring-presets', null, 'Get all scoring presets');
    await testEndpoint('GET', '/scoring-presets/active', null, 'Get active presets');
}

// Test student council endpoints
async function testStudentCouncilEndpoints() {
    log.section('STUDENT COUNCIL ENDPOINTS');
    
    await testEndpoint('GET', '/student-council', null, 'Get student council members');
    await testEndpoint('POST', '/student-council', {
        name: 'Test Member',
        position: 'Test Position'
    }, 'Add council member (may need auth)');
}

// Test about endpoints
async function testAboutEndpoints() {
    log.section('ABOUT PAGE ENDPOINTS');
    
    await testEndpoint('GET', '/about', null, 'Get about info');
}

// Test foul endpoints
async function testFoulEndpoints() {
    log.section('FOUL ENDPOINTS');
    
    await testEndpoint('GET', '/fouls', null, 'Get all fouls');
}

// Test admin endpoints
async function testAdminEndpoints() {
    log.section('ADMIN ENDPOINTS');
    
    await testEndpoint('GET', '/admins', null, 'Get all admins (should need auth)');
    await testEndpoint('POST', '/admins', {
        email: 'admin@test.com',
        password: 'admin123'
    }, 'Create admin (should need auth)');
}

// Print final report
function printReport() {
    log.section('API TEST RESULTS SUMMARY');
    
    console.log(`${colors.cyan}Total Endpoints Tested: ${results.total}${colors.reset}`);
    console.log(`${colors.green}Successful Responses: ${results.passed}${colors.reset}`);
    console.log(`${colors.red}Failed/Error Responses: ${results.failed}${colors.reset}`);
    
    const successRate = ((results.passed / results.total) * 100).toFixed(2);
    console.log(`\n${colors.cyan}Success Rate: ${successRate}%${colors.reset}`);
    
    console.log(`\n${colors.blue}Endpoint Details:${colors.reset}`);
    results.endpoints.forEach(ep => {
        const statusColor = ep.success ? colors.green : colors.red;
        console.log(`${statusColor}${ep.method.padEnd(6)} ${ep.endpoint.padEnd(30)} - ${ep.status}${colors.reset}`);
    });
    
    console.log('\n' + colors.magenta + '━'.repeat(60) + colors.reset);
}

// Main execution
async function runAllAPITests() {
    console.log('\n' + colors.magenta + '━'.repeat(60));
    console.log('🧪 API ENDPOINT TESTING SUITE');
    console.log(`📍 Testing server at: ${BASE_URL}`);
    console.log('━'.repeat(60) + colors.reset + '\n');
    
    try {
        // First check if server is running
        log.test('Checking if server is running...');
        try {
            await axios.get(`${BASE_URL}/alive`, { timeout: 5000 });
            log.success('Server is running and responding');
        } catch (error) {
            log.error('Server is not responding!');
            log.warning(`Make sure the server is running on ${BASE_URL}`);
            log.info('Start the server with: npm run server');
            process.exit(1);
        }
        
        // Run all test suites
        await testHealthEndpoints();
        await testAuthEndpoints();
        await testDepartmentEndpoints();
        await testSeasonEndpoints();
        await testMatchEndpoints();
        await testPlayerEndpoints();
        await testLeaderboardEndpoints();
        await testScoringPresetEndpoints();
        await testStudentCouncilEndpoints();
        await testAboutEndpoints();
        await testFoulEndpoints();
        await testAdminEndpoints();
        
        // Print report
        printReport();
        
    } catch (error) {
        log.error(`Test suite error: ${error.message}`);
        console.error(error.stack);
        process.exit(1);
    }
}

// Check if server URL is provided
if (process.argv.includes('--help')) {
    console.log('Usage: node test-api-endpoints.js [--server=URL]');
    console.log('Example: node test-api-endpoints.js --server=http://localhost:5000');
    console.log('Default: http://localhost:5000');
    process.exit(0);
}

// Parse custom server URL if provided
const serverArg = process.argv.find(arg => arg.startsWith('--server='));
if (serverArg) {
    const customUrl = serverArg.split('=')[1];
    console.log(`Using custom server URL: ${customUrl}`);
}

// Run tests
runAllAPITests();
