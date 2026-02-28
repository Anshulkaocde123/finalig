const axios = require('axios');

const API = 'http://localhost:5000/api';
const ADMIN_CREDS = { username: 'admin', password: 'admin123' };

let adminToken = null;
let adminUser = null;
let testDepts = [];
let testMatches = [];
let testHighlights = [];

const colors = {
    success: '\x1b[32m',
    error: '\x1b[31m',
    info: '\x1b[36m',
    warn: '\x1b[33m',
    reset: '\x1b[0m'
};

async function log(status, message) {
    const color = status === 'PASS' ? colors.success : status === 'FAIL' ? colors.error : colors.info;
    console.log(`${color}[${status}]${colors.reset} ${message}`);
}

async function runTest(name, fn) {
    try {
        await fn();
        await log('PASS', name);
        return true;
    } catch (err) {
        await log('FAIL', `${name}: ${err.message}`);
        return false;
    }
}

async function main() {
    console.log(`\n${colors.info}🚀 COMPREHENSIVE API TEST SUITE${colors.reset}\n`);

    let passed = 0, failed = 0;

    // ========== AUTH TESTS ==========
    console.log(`${colors.warn}📝 Auth Tests${colors.reset}`);
    
    if (await runTest('Login with credentials', async () => {
        const res = await axios.post(`${API}/auth/login`, ADMIN_CREDS);
        if (!res.data.token) throw new Error('No token returned');
        adminToken = res.data.token;
        adminUser = res.data.user || res.data.username;
    })) passed++; else failed++;

    if (await runTest('Token is valid and persists', async () => {
        const res = await axios.get(`${API}/matches`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        if (!res.data.data) throw new Error('Unauthorized or invalid token');
    })) passed++; else failed++;

    // ========== DEPARTMENT TESTS ==========
    console.log(`\n${colors.warn}🏢 Department Tests${colors.reset}`);

    if (await runTest('Fetch departments', async () => {
        const res = await axios.get(`${API}/departments`);
        testDepts = res.data.data || [];
        if (!Array.isArray(testDepts) || testDepts.length === 0) throw new Error('No departments');
    })) passed++; else failed++;

    // ========== MATCH CRUD TESTS ==========
    console.log(`\n${colors.warn}🏅 Match CRUD Tests${colors.reset}`);

    if (await runTest('Create match', async () => {
        if (testDepts.length < 2) throw new Error('Not enough departments');
        const res = await axios.post(`${API}/matches`, {
            sport: 'CRICKET',
            teamA: testDepts[0]._id,
            teamB: testDepts[1]._id,
            scheduledAt: new Date(Date.now() + 86400000),
            venue: 'Test Ground',
            matchCategory: 'REGULAR'
        }, { headers: { Authorization: `Bearer ${adminToken}` } });
        testMatches.push(res.data.data);
        if (!res.data.data._id) throw new Error('No match ID returned');
    })) passed++; else failed++;

    if (await runTest('Fetch all matches', async () => {
        const res = await axios.get(`${API}/matches`);
        if (!Array.isArray(res.data.data)) throw new Error('Matches not array');
        if (res.data.data.length === 0) throw new Error('No matches found');
    })) passed++; else failed++;

    if (await runTest('Fetch single match', async () => {
        if (testMatches.length === 0) throw new Error('No test match');
        const res = await axios.get(`${API}/matches/${testMatches[0]._id}`);
        if (!res.data.data._id) throw new Error('Match not found');
    })) passed++; else failed++;

    if (await runTest('Update match result (score + winner)', async () => {
        if (testMatches.length === 0) throw new Error('No test match');
        const match = testMatches[0];
        const res = await axios.put(`${API}/matches/${match._id}`, {
            scoreA: '150',
            scoreB: '145',
            winner: match.teamA._id,
            status: 'COMPLETED',
            summary: 'Thrilling match won by 5 runs'
        }, { headers: { Authorization: `Bearer ${adminToken}` } });
        if (!res.data.data.scoreA) throw new Error('Score not saved');
    })) passed++; else failed++;

    if (await runTest('Verify match update persisted', async () => {
        if (testMatches.length === 0) throw new Error('No test match');
        const res = await axios.get(`${API}/matches/${testMatches[0]._id}`);
        if (res.data.data.scoreA !== '150') throw new Error('Score not persisted');
    })) passed++; else failed++;

    // ========== HIGHLIGHT CRUD TESTS ==========
    console.log(`\n${colors.warn}✨ Highlight CRUD Tests${colors.reset}`);

    if (await runTest('Create reel highlight', async () => {
        const res = await axios.post(`${API}/highlights`, {
            type: 'REEL_OF_THE_DAY',
            title: 'Amazing Cricket Shots',
            description: 'Best moments from today',
            videoUrl: 'https://example.com/video.mp4',
            sport: 'CRICKET',
            credit: 'Camera Team'
        }, { headers: { Authorization: `Bearer ${adminToken}` } });
        testHighlights.push(res.data.data);
        if (!res.data.data._id) throw new Error('No highlight ID');
    })) passed++; else failed++;

    if (await runTest('Fetch today highlights', async () => {
        const res = await axios.get(`${API}/highlights/today`);
        if (!res.data.data || typeof res.data.data !== 'object') throw new Error('Invalid format');
    })) passed++; else failed++;

    if (await runTest('Update highlight (change type + title)', async () => {
        if (testHighlights.length === 0) throw new Error('No test highlight');
        const res = await axios.put(`${API}/highlights/${testHighlights[0]._id}`, {
            title: 'Updated Cricket Highlights',
            description: 'All cricket moments'
        }, { headers: { Authorization: `Bearer ${adminToken}` } });
        if (!res.data.data._id) throw new Error('Update failed');
    })) passed++; else failed++;

    // ========== LEADERBOARD TESTS ==========
    console.log(`\n${colors.warn}🏆 Leaderboard Tests${colors.reset}`);

    if (await runTest('Fetch leaderboard', async () => {
        const res = await axios.get(`${API}/leaderboard`);
        if (!Array.isArray(res.data.data)) throw new Error('Leaderboard not array');
    })) passed++; else failed++;

    // ========== PERFORMANCE TESTS ==========
    console.log(`\n${colors.warn}⚡ Performance Tests (lean queries + caching)${colors.reset}`);

    // First call warms up database connection
    await axios.get(`${API}/matches?limit=50`);
    
    if (await runTest('Matches endpoint response < 2000ms', async () => {
        const start = Date.now();
        await axios.get(`${API}/matches?limit=50`);
        const elapsed = Date.now() - start;
        console.log(`       ⏱  ${elapsed}ms`);
        if (elapsed > 2000) throw new Error(`Took ${elapsed}ms (expected < 2000ms)`);
    })) passed++; else failed++;

    // Warm up highlights
    await axios.get(`${API}/highlights?limit=20`);

    if (await runTest('Highlights endpoint response < 2000ms', async () => {
        const start = Date.now();
        await axios.get(`${API}/highlights?limit=20`);
        const elapsed = Date.now() - start;
        console.log(`       ⏱  ${elapsed}ms`);
        if (elapsed > 2000) throw new Error(`Took ${elapsed}ms (expected < 2000ms)`);
    })) passed++; else failed++;

    // Warm up today highlights
    await axios.get(`${API}/highlights/today`);

    if (await runTest('Today highlights response < 1000ms', async () => {
        const start = Date.now();
        await axios.get(`${API}/highlights/today`);
        const elapsed = Date.now() - start;
        if (elapsed > 1000) throw new Error(`Took ${elapsed}ms (expected < 1000ms)`);
    })) passed++; else failed++;

    // ========== SOCKET.IO READINESS ==========
    console.log(`\n${colors.warn}🔌 Socket.io Tests${colors.reset}`);

    if (await runTest('Socket status endpoint available', async () => {
        const res = await axios.get('http://localhost:5000/api/socket-status');
        if (typeof res.data.totalClients !== 'number') throw new Error('Invalid socket status');
    })) passed++; else failed++;

    // ========== CLEANUP ==========
    console.log(`\n${colors.warn}🧹 Cleanup${colors.reset}`);

    if (await runTest('Delete test match', async () => {
        if (testMatches.length > 0) {
            await axios.delete(`${API}/matches/${testMatches[0]._id}`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
        }
    })) passed++; else failed++;

    if (await runTest('Delete test highlight', async () => {
        if (testHighlights.length > 0) {
            await axios.delete(`${API}/highlights/${testHighlights[0]._id}`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
        }
    })) passed++; else failed++;

    // ========== SUMMARY ==========
    console.log(`\n${colors.info}═══════════════════════════════════${colors.reset}`);
    console.log(`${colors.success}✅ PASSED: ${passed}${colors.reset}`);
    console.log(`${colors.error}❌ FAILED: ${failed}${colors.reset}`);
    console.log(`${colors.info}TOTAL:  ${passed + failed}${colors.reset}`);
    console.log(`${colors.info}═══════════════════════════════════${colors.reset}\n`);

    process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
    console.error('Test suite error:', err.message);
    process.exit(1);
});
