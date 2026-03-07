const mongoose = require('mongoose');
require('dotenv').config();

async function debugDB() {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    
    // 1. Check all collections
    const collections = await db.listCollections().toArray();
    console.log('=== Collections ===');
    for (const c of collections) {
        const count = await db.collection(c.name).countDocuments();
        console.log('  ' + c.name + ': ' + count + ' docs');
    }
    
    // 2. Check PointLogs - verify leaderboard data
    console.log('\n=== PointLog Summary by Department ===');
    const pointLogs = await db.collection('pointlogs').aggregate([
        { $group: { _id: '$department', total: { $sum: '$points' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } }
    ]).toArray();
    
    const depts = await db.collection('departments').find({}).toArray();
    const deptMap = {};
    depts.forEach(d => { deptMap[d._id.toString()] = d.name; });
    
    for (const pl of pointLogs) {
        console.log('  ' + (deptMap[pl._id.toString()] || pl._id) + ': ' + pl.total + ' pts (' + pl.count + ' logs)');
    }
    
    // 3. Check completed matches
    console.log('\n=== Completed Matches ===');
    const completedMatches = await db.collection('matches').find({ status: 'COMPLETED' }).toArray();
    console.log('  Total completed: ' + completedMatches.length);
    for (const m of completedMatches) {
        const teamAName = deptMap[m.teamA.toString()] || m.teamA;
        const teamBName = deptMap[m.teamB.toString()] || m.teamB;
        const winnerName = m.winner ? (deptMap[m.winner.toString()] || m.winner) : 'DRAW';
        console.log('  ' + m.sport + ': ' + teamAName + ' vs ' + teamBName + ' -> Winner: ' + winnerName + ' | pointsAwarded: ' + m.pointsAwarded);
    }
    
    // 4. Check ranking
    console.log('\n=== Leaderboard Rankings (verifying 1st/2nd place) ===');
    const standings = pointLogs.map(pl => ({
        id: pl._id.toString(),
        name: deptMap[pl._id.toString()] || 'Unknown',
        points: pl.total,
        count: pl.count
    }));
    standings.sort((a, b) => b.points - a.points);
    
    standings.forEach((s, idx) => {
        console.log('  #' + (idx + 1) + ' ' + s.name + ': ' + s.points + ' pts');
    });
    
    // 5. Departments with 0 points
    console.log('\n=== Departments with 0 PointLogs ===');
    const deptsWithPoints = new Set(pointLogs.map(p => p._id.toString()));
    for (const dept of depts) {
        if (!deptsWithPoints.has(dept._id.toString())) {
            console.log('  ' + dept.name + ' (' + dept.shortCode + ') - 0 points, 0 logs');
        }
    }
    
    // 6. Check scoring presets
    console.log('\n=== Scoring Presets ===');
    const presets = await db.collection('scoringpresets').find({}).toArray();
    console.log('  Total presets: ' + presets.length);
    for (const p of presets) {
        console.log('  ' + p.sport + ': win=' + p.winPoints + ' loss=' + p.lossPoints + ' draw=' + p.drawPoints + ' active=' + p.isActive + ' default=' + p.isDefault);
    }
    
    // 7. All individual point logs
    console.log('\n=== All PointLogs (most recent first) ===');
    const allLogs = await db.collection('pointlogs').find({}).sort({ createdAt: -1 }).limit(30).toArray();
    for (const log of allLogs) {
        const dateStr = log.createdAt ? log.createdAt.toISOString().slice(0, 16) : 'no-date';
        console.log('  [' + dateStr + '] ' + (deptMap[log.department.toString()] || log.department) + ': ' + log.points + ' pts - ' + log.eventName + ' - ' + (log.description || ''));
    }
    
    // 8. Check all scheduled matches
    console.log('\n=== All Matches by Status ===');
    const allMatches = await db.collection('matches').find({}).toArray();
    const statusCounts = {};
    allMatches.forEach(m => {
        statusCounts[m.status] = (statusCounts[m.status] || 0) + 1;
    });
    console.log('  Status counts:', JSON.stringify(statusCounts));
    
    // 9. Check admin accounts
    console.log('\n=== Admin Accounts ===');
    const admins = await db.collection('admins').find({}, { projection: { password: 0 } }).toArray();
    for (const a of admins) {
        console.log('  ' + a.username + ' | role: ' + a.role + ' | active: ' + a.isActive + ' | verified: ' + a.verified);
    }
    
    // 10. Check seasons
    console.log('\n=== Seasons ===');
    const seasons = await db.collection('seasons').find({}).toArray();
    console.log('  Total seasons: ' + seasons.length);
    for (const s of seasons) {
        console.log('  ' + s.name + ' | active: ' + s.isActive);
    }
    
    // 11. Leaderboard ranking edge case test
    console.log('\n=== LEADERBOARD EDGE CASE ANALYSIS ===');
    console.log('  Testing for ties, close rankings, and rank assignment:');
    
    // Build full standings including 0-point departments
    const fullStandings = [];
    for (const dept of depts) {
        const pointEntry = pointLogs.find(p => p._id.toString() === dept._id.toString());
        fullStandings.push({
            name: dept.name,
            shortCode: dept.shortCode,
            points: pointEntry ? pointEntry.total : 0
        });
    }
    fullStandings.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        return a.name.localeCompare(b.name);
    });
    
    console.log('  Full standings:');
    let prevPoints = null;
    let prevRank = 0;
    fullStandings.forEach((s, idx) => {
        const displayRank = (s.points === prevPoints) ? prevRank : idx + 1;
        if (s.points !== prevPoints) prevRank = idx + 1;
        prevPoints = s.points;
        const label = displayRank <= 3 ? ['🥇', '🥈', '🥉'][displayRank - 1] : '#' + displayRank;
        console.log('    ' + label + ' ' + s.name + ' (' + s.shortCode + '): ' + s.points + ' pts');
    });
    
    // Check for ties at positions 1, 2, 3
    const uniquePoints = [...new Set(fullStandings.map(s => s.points))].sort((a, b) => b - a);
    console.log('\n  Unique point values (desc):', uniquePoints.join(', '));
    
    for (let i = 0; i < Math.min(3, uniquePoints.length); i++) {
        const tied = fullStandings.filter(s => s.points === uniquePoints[i]);
        if (tied.length > 1) {
            console.log('  ⚠️  TIE at position ' + (i + 1) + ': ' + tied.map(t => t.shortCode).join(', ') + ' with ' + uniquePoints[i] + ' pts');
        }
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Debug complete');
}

debugDB().catch(e => { console.error('Error:', e); process.exit(1); });
