const axios = require('axios');

async function verify() {
    console.log('--- Starting System Verification ---');
    const baseUrl = 'http://localhost:5000/api';

    // 1. Check Health
    try {
        const res = await axios.get(`${baseUrl}/health`);
        console.log('✅ Health Check Passed:', res.data);
    } catch (e) {
        console.error('❌ Health Check Failed:', e.message);
    }

    // 2. Check Departments (Public)
    try {
        const res = await axios.get(`${baseUrl}/departments`);
        console.log(`✅ Departments Check Passed: Found ${res.data.count} departments.`);
    } catch (e) {
        console.error('❌ Departments Check Failed:', e.message);
        if (e.response) console.error('Response:', e.response.data);
    }

    // 3. Check Leaderboard (Public)
    try {
        const res = await axios.get(`${baseUrl}/leaderboard`);
        console.log(`✅ Leaderboard Check Passed: Found ${res.data.length} entries.`);
    } catch (e) {
        console.error('❌ Leaderboard Check Failed:', e.message);
        if (e.response) console.error('Response:', e.response.data);
    }

    // 4. Check Matches (Public)
    try {
        const res = await axios.get(`${baseUrl}/matches`);
        console.log(`✅ Matches Check Passed: Found ${res.data.count} matches.`);
    } catch (e) {
        console.error('❌ Matches Check Failed:', e.message);
        if (e.response) console.error('Response:', e.response.data);
    }
}

verify();
