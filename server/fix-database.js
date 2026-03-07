/**
 * Database fix script — run once to fix:
 * 1. Set pointsAwarded=true on completed matches that lack the flag
 * 2. Fix scoring preset to have isDefault=true for the existing preset
 * 3. Create missing scoring presets for all sports
 */
const mongoose = require('mongoose');
require('dotenv').config();

const SPORTS = ['CRICKET', 'BADMINTON', 'TABLE_TENNIS', 'VOLLEYBALL', 'FOOTBALL', 'HOCKEY', 'BASKETBALL', 'KHOKHO', 'KABADDI', 'CHESS'];

async function fixDatabase() {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    
    console.log('=== Fixing Database Issues ===\n');
    
    // 1. Fix completed matches with undefined pointsAwarded
    console.log('1️⃣  Fixing completed matches with missing pointsAwarded flag...');
    const result = await db.collection('matches').updateMany(
        { status: 'COMPLETED', pointsAwarded: { $exists: false } },
        { $set: { pointsAwarded: true } }
    );
    console.log(`   Updated ${result.modifiedCount} matches\n`);
    
    // 2. Fix existing scoring preset to be default
    console.log('2️⃣  Fixing existing scoring preset...');
    const fixPreset = await db.collection('scoringpresets').updateMany(
        {},
        { $set: { isDefault: true } }
    );
    console.log(`   Updated ${fixPreset.modifiedCount} presets to isDefault=true\n`);
    
    // 3. Create missing scoring presets for all sports
    console.log('3️⃣  Creating missing scoring presets...');
    const existingPresets = await db.collection('scoringpresets').find({}).toArray();
    const existingSports = new Set(existingPresets.map(p => p.sport));
    
    let created = 0;
    for (const sport of SPORTS) {
        if (!existingSports.has(sport)) {
            await db.collection('scoringpresets').insertOne({
                sport: sport,
                winPoints: 10,
                lossPoints: 0,
                drawPoints: 5,
                bonusPoints: 2,
                dominantVictoryMargin: 50,
                matchTypeMultipliers: {
                    regular: 1,
                    group_stage: 1,
                    quarter_final: 1.5,
                    semifinal: 2,
                    final: 3
                },
                isActive: true,
                isDefault: true,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            created++;
            console.log(`   ✅ Created preset for ${sport}`);
        } else {
            console.log(`   ⏭️  Preset already exists for ${sport}`);
        }
    }
    console.log(`   Created ${created} new presets\n`);
    
    // 4. Verify fixes
    console.log('=== Verification ===');
    
    const brokenMatches = await db.collection('matches').countDocuments({
        status: 'COMPLETED', pointsAwarded: { $exists: false }
    });
    console.log(`Completed matches without pointsAwarded: ${brokenMatches} (should be 0)`);
    
    const presets = await db.collection('scoringpresets').find({}).toArray();
    console.log(`Total scoring presets: ${presets.length}`);
    for (const p of presets) {
        console.log(`  ${p.sport}: win=${p.winPoints} loss=${p.lossPoints} draw=${p.drawPoints} active=${p.isActive} default=${p.isDefault}`);
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Database fixes complete');
}

fixDatabase().catch(e => { console.error('Error:', e); process.exit(1); });
