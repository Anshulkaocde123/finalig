const mongoose = require('mongoose');
const dotenv = require('dotenv');
const axios = require('axios');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const API_URL = `http://localhost:${process.env.PORT || 5000}/api`;

const runTests = async () => {
    try {
        console.log('🧪 Starting Sports Engine Verification...');

        // 1. Create Departments
        console.log('\n--- 1. Testing Departments ---');
        // We need to use direct DB access strictly for seeding if no seed API exists yet, 
        // but for this verification, let's assume we might need to create them via Mongoose script 
        // OR we can just check if they exist and create if not. 
        // Since we don't have department API routes in this task, I'll seed them directly using Mongoose.

        await mongoose.connect(process.env.MONGODB_URI);
        const departmentSchema = new mongoose.Schema({ name: String, abbreviation: String });
        // Use the existing collection or define it inline just for seeding
        const Department = mongoose.models.Department || mongoose.model('Department', departmentSchema);

        let cse = await Department.findOne({ abbreviation: 'CSE' });
        if (!cse) cse = await Department.create({ name: 'Computer Science', abbreviation: 'CSE' });

        let ece = await Department.findOne({ abbreviation: 'ECE' });
        if (!ece) ece = await Department.create({ name: 'Electronics', abbreviation: 'ECE' });

        console.log(`✅ Departments ready: ${cse.abbreviation} vs ${ece.abbreviation}`);

        // Disconnect mongoose to let the server handle the rest via API
        // actually we can keep it open or just rely on axios. 
        // Let's disconnect to emulate pure client.
        // await mongoose.disconnect(); 

        const teamA = cse._id;
        const teamB = ece._id;

        // 2. Test Cricket
        console.log('\n--- 2. Testing Cricket Match ---');
        const cricketRes = await axios.post(`${API_URL}/matches/cricket/create`, {
            teamA, teamB, scheduledAt: new Date()
        });
        const cricketId = cricketRes.data.data._id;
        console.log(`✅ Created Cricket Match: ${cricketId}`);

        const cricketUpdateRes = await axios.put(`${API_URL}/matches/cricket/update/${cricketId}`, {
            team: 'A', runs: 45, wickets: 2, overs: 5.2
        });
        console.log(`✅ Updated Cricket Score: ${cricketUpdateRes.data.data.scoreA.runs}/${cricketUpdateRes.data.data.scoreA.wickets}`);

        // 3. Test Badminton (SetMatch)
        console.log('\n--- 3. Testing Badminton Match ---');
        const badmRes = await axios.post(`${API_URL}/matches/badminton/create`, {
            teamA, teamB, maxSets: 3
        });
        const badmId = badmRes.data.data._id;
        console.log(`✅ Created Badminton Match: ${badmId}`);

        const badmUpdateRes = await axios.put(`${API_URL}/matches/badminton/update/${badmId}`, {
            setsA: 1, setsB: 0, setResult: "21-18"
        });
        console.log(`✅ Updated Badminton Score: Sets ${badmUpdateRes.data.data.scoreA}-${badmUpdateRes.data.data.scoreB}`);
        console.log(`   Set Details: ${badmUpdateRes.data.data.setDetails}`);

        // 4. Test Football (GoalMatch)
        console.log('\n--- 4. Testing Football Match ---');
        const fbRes = await axios.post(`${API_URL}/matches/football/create`, {
            teamA, teamB
        });
        const fbId = fbRes.data.data._id;
        console.log(`✅ Created Football Match: ${fbId}`);

        const fbUpdateRes = await axios.put(`${API_URL}/matches/football/update/${fbId}`, {
            pointsA: 2, pointsB: 1, period: 2
        });
        console.log(`✅ Updated Football Score: ${fbUpdateRes.data.data.scoreA}-${fbUpdateRes.data.data.scoreB}`);

        // 5. Test Chess (SimpleMatch)
        console.log('\n--- 5. Testing Chess Match ---');
        const chessRes = await axios.post(`${API_URL}/matches/chess/create`, {
            teamA, teamB
        });
        const chessId = chessRes.data.data._id;
        console.log(`✅ Created Chess Match: ${chessId}`);

        const chessUpdateRes = await axios.put(`${API_URL}/matches/chess/update/${chessId}`, {
            winnerId: teamA, resultType: 'CHECKMATE'
        });
        console.log(`✅ Updated Chess Result: Winner ${chessUpdateRes.data.data.winner}, Result ${chessUpdateRes.data.data.resultType}`);
        console.log(`   Status: ${chessUpdateRes.data.data.status}`);

        console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! 🎉');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ TEST FAILED');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error(error.message);
        }
        process.exit(1);
    }
};

runTests();
