/**
 * Match Controller Test Suite
 *
 * Tests /api/matches/* endpoints against in-memory MongoDB.
 * Covers:
 *  1. CRUD: Create, Read, Update, Delete matches
 *  2. Security: NoSQL injection in query params
 *  3. Concurrency: Optimistic version conflict detection
 *  4. Pagination & filtering
 *  5. Input sanitization
 */
const {
    connectDB, clearDB, disconnectDB,
    seedAdmin, seedDepartments, getAgent,
} = require('./setup');
const { Match } = require('../models/Match');

let agent;
let token;
let deptA, deptB;

beforeAll(async () => {
    await connectDB();
    agent = getAgent();
});

beforeEach(async () => {
    await clearDB();
    // Seed fresh admin + departments for each test
    const adminData = await seedAdmin();
    token = adminData.token;
    const depts = await seedDepartments();
    deptA = depts.deptA;
    deptB = depts.deptB;
});

afterAll(async () => {
    await disconnectDB();
});

// ──────────────────────────────────────────────────
// Helper: create a match via API
// ──────────────────────────────────────────────────
async function createMatchViaAPI(overrides = {}) {
    const payload = {
        sport: 'CRICKET',
        teamA: deptA._id.toString(),
        teamB: deptB._id.toString(),
        venue: 'Main Ground',
        scheduledAt: new Date().toISOString(),
        ...overrides,
    };
    return agent
        .post('/api/matches')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);
}

// ══════════════════════════════════════════════════
// 1. CREATE MATCH — HAPPY PATH
// ══════════════════════════════════════════════════
describe('POST /api/matches', () => {
    it('should create a match with valid data', async () => {
        const res = await createMatchViaAPI();

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.sport).toBe('CRICKET');
        expect(res.body.data.teamA).toHaveProperty('name', 'Computer Science');
        expect(res.body.data.teamB).toHaveProperty('name', 'Electrical Engineering');
    });

    it('should reject unauthenticated request', async () => {
        const res = await agent
            .post('/api/matches')
            .send({ sport: 'CRICKET', teamA: deptA._id, teamB: deptB._id });

        expect(res.status).toBe(401);
    });

    it('should reject missing required fields', async () => {
        const res = await agent
            .post('/api/matches')
            .set('Authorization', `Bearer ${token}`)
            .send({ sport: 'CRICKET' }); // missing teamA, teamB

        expect(res.status).toBe(400);
    });

    it('should reject a team playing against itself', async () => {
        const res = await createMatchViaAPI({
            teamB: deptA._id.toString(),
        });

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/itself/i);
    });

    it('should uppercase the sport name', async () => {
        const res = await createMatchViaAPI({ sport: 'cricket' });
        expect(res.body.data.sport).toBe('CRICKET');
    });

    it('should emit matchCreated via socket.io', async () => {
        const { getApp } = require('./setup');
        const io = getApp().get('io');

        await createMatchViaAPI();

        expect(io.emit).toHaveBeenCalledWith('matchCreated', expect.any(Object));
    });
});

// ══════════════════════════════════════════════════
// 2. GET ALL MATCHES
// ══════════════════════════════════════════════════
describe('GET /api/matches', () => {
    it('should return empty list initially', async () => {
        const res = await agent.get('/api/matches');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.count).toBe(0);
        expect(res.body.data).toEqual([]);
    });

    it('should return created matches', async () => {
        await createMatchViaAPI();
        await createMatchViaAPI({ sport: 'FOOTBALL' });

        const res = await agent.get('/api/matches');
        expect(res.body.count).toBe(2);
    });

    it('should filter by sport', async () => {
        await createMatchViaAPI({ sport: 'CRICKET' });
        await createMatchViaAPI({ sport: 'FOOTBALL' });

        const res = await agent.get('/api/matches?sport=CRICKET');
        expect(res.body.count).toBe(1);
        expect(res.body.data[0].sport).toBe('CRICKET');
    });

    it('should filter by status', async () => {
        await createMatchViaAPI();
        const res = await agent.get('/api/matches?status=SCHEDULED');
        expect(res.body.count).toBe(1);
    });

    it('should respect limit parameter', async () => {
        for (let i = 0; i < 5; i++) {
            await createMatchViaAPI({ sport: 'CRICKET' });
        }

        const res = await agent.get('/api/matches?limit=2');
        expect(res.body.count).toBe(2);
        expect(res.body.total).toBe(5);
        expect(res.body.pages).toBe(3);
    });

    it('should clamp limit to maximum 100', async () => {
        const res = await agent.get('/api/matches?limit=99999');
        // Should not crash — internally clamped to 100
        expect(res.status).toBe(200);
    });

    it('should exclude managedBy and __v from response', async () => {
        await createMatchViaAPI();
        const res = await agent.get('/api/matches');
        const match = res.body.data[0];
        expect(match).not.toHaveProperty('managedBy');
        expect(match).not.toHaveProperty('__v');
    });
});

// ══════════════════════════════════════════════════
// 3. SECURITY: NoSQL Injection in Query Params
// ══════════════════════════════════════════════════
describe('GET /api/matches — NoSQL Injection', () => {
    it('should ignore invalid sport enum value (operator injection)', async () => {
        await createMatchViaAPI();

        // Attacker tries to inject { $ne: null } as sport filter
        const res = await agent.get('/api/matches?sport[$ne]=null');
        // Should return ALL matches (filter is silently dropped) or 0 matches
        // The key point: it should NOT crash
        expect(res.status).toBe(200);
    });

    it('should ignore invalid ObjectId for department filter', async () => {
        const res = await agent.get('/api/matches?department=not-a-valid-id');
        expect(res.status).toBe(200);
        // Invalid ObjectId should be silently ignored, not crash
    });

    it('should ignore invalid ObjectId for season filter', async () => {
        const res = await agent.get('/api/matches?season={"$gt":""}');
        expect(res.status).toBe(200);
    });

    it('should escape regex special chars in search', async () => {
        await createMatchViaAPI({ venue: 'Main Ground' });

        // This regex attack should be escaped, not crash the server
        const res = await agent.get('/api/matches?search=(.*){10000}');
        expect(res.status).toBe(200);
    });

    it('should escape regex special chars in venue filter', async () => {
        const res = await agent.get('/api/matches?venue=.*');
        expect(res.status).toBe(200);
    });
});

// ══════════════════════════════════════════════════
// 4. UPDATE MATCH — HAPPY PATH
// ══════════════════════════════════════════════════
describe('PUT /api/matches/:id', () => {
    it('should update scores', async () => {
        const createRes = await createMatchViaAPI();
        const matchId = createRes.body.data._id;

        const res = await agent
            .put(`/api/matches/${matchId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ scoreA: '150/8', scoreB: '148/10', status: 'COMPLETED' });

        expect(res.status).toBe(200);
        expect(res.body.data.scoreA).toBe('150/8');
        expect(res.body.data.scoreB).toBe('148/10');
        expect(res.body.data.status).toBe('COMPLETED');
    });

    it('should emit matchUpdate via socket.io', async () => {
        const { getApp } = require('./setup');
        const io = getApp().get('io');
        io.emit.mockClear();

        const createRes = await createMatchViaAPI();
        const matchId = createRes.body.data._id;

        await agent
            .put(`/api/matches/${matchId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ scoreA: '2-1' });

        expect(io.emit).toHaveBeenCalledWith('matchUpdate', expect.objectContaining({
            scoreA: '2-1',
        }));
    });

    it('should truncate overly long inputs', async () => {
        const createRes = await createMatchViaAPI();
        const matchId = createRes.body.data._id;
        const longString = 'A'.repeat(5000);

        const res = await agent
            .put(`/api/matches/${matchId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ summary: longString });

        expect(res.status).toBe(200);
        expect(res.body.data.summary.length).toBeLessThanOrEqual(1000);
    });

    it('should return 404 for non-existent match', async () => {
        const fakeId = '507f1f77bcf86cd799439011'; // valid ObjectId format but doesn't exist

        const res = await agent
            .put(`/api/matches/${fakeId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ scoreA: '1-0' });

        expect(res.status).toBe(404);
    });
});

// ══════════════════════════════════════════════════
// 5. CONCURRENCY: Optimistic Version Conflict
// ══════════════════════════════════════════════════
describe('PUT /api/matches/:id — Version Conflict', () => {
    it('should detect concurrent modification via _expectedVersion', async () => {
        // Create a match
        const createRes = await createMatchViaAPI();
        const matchId = createRes.body.data._id;

        // Fetch the match to get its updatedAt
        const fetchRes = await agent.get(`/api/matches/${matchId}`);
        const originalUpdatedAt = fetchRes.body.data.updatedAt;

        // First update — should succeed
        const update1 = await agent
            .put(`/api/matches/${matchId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                scoreA: '100/5',
                _expectedVersion: originalUpdatedAt,
            });
        expect(update1.status).toBe(200);

        // Second update using the ORIGINAL (now stale) version — should get 409
        const update2 = await agent
            .put(`/api/matches/${matchId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                scoreA: '200/3',
                _expectedVersion: originalUpdatedAt, // stale!
            });

        expect(update2.status).toBe(409);
        expect(update2.body.message).toMatch(/conflict/i);
    });

    it('should allow update without _expectedVersion (backward compat)', async () => {
        const createRes = await createMatchViaAPI();
        const matchId = createRes.body.data._id;

        const res = await agent
            .put(`/api/matches/${matchId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ scoreA: '3-2' });

        // Without _expectedVersion, no version check — should always succeed
        expect(res.status).toBe(200);
    });
});

// ══════════════════════════════════════════════════
// 6. DELETE MATCH
// ══════════════════════════════════════════════════
describe('DELETE /api/matches/:id', () => {
    it('should delete a match', async () => {
        const createRes = await createMatchViaAPI();
        const matchId = createRes.body.data._id;

        const res = await agent
            .delete(`/api/matches/${matchId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        // Verify it's gone
        const count = await Match.countDocuments();
        expect(count).toBe(0);
    });

    it('should emit matchDeleted via socket.io', async () => {
        const { getApp } = require('./setup');
        const io = getApp().get('io');
        io.emit.mockClear();

        const createRes = await createMatchViaAPI();
        const matchId = createRes.body.data._id;

        await agent
            .delete(`/api/matches/${matchId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(io.emit).toHaveBeenCalledWith('matchDeleted', { matchId });
    });

    it('should return 404 for non-existent match', async () => {
        const res = await agent
            .delete('/api/matches/507f1f77bcf86cd799439011')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
    });

    it('should reject unauthenticated delete', async () => {
        const createRes = await createMatchViaAPI();
        const res = await agent.delete(`/api/matches/${createRes.body.data._id}`);
        expect(res.status).toBe(401);
    });
});

// ══════════════════════════════════════════════════
// 7. GET SINGLE MATCH
// ══════════════════════════════════════════════════
describe('GET /api/matches/:id', () => {
    it('should return a single match with populated teams', async () => {
        const createRes = await createMatchViaAPI();
        const matchId = createRes.body.data._id;

        const res = await agent.get(`/api/matches/${matchId}`);
        expect(res.status).toBe(200);
        expect(res.body.data.teamA).toHaveProperty('shortCode', 'CSE');
        expect(res.body.data.teamB).toHaveProperty('shortCode', 'EE');
    });

    it('should return 404 for non-existent match', async () => {
        const res = await agent.get('/api/matches/507f1f77bcf86cd799439011');
        expect(res.status).toBe(404);
    });
});
