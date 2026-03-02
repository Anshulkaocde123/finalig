/**
 * Authentication Test Suite
 *
 * Tests the /api/auth/* endpoints against an in-memory MongoDB.
 * Covers:
 *  1. Happy path: seed, login, get profile
 *  2. Negative cases: bad password, missing fields, suspended account
 *  3. Security regression: NoSQL injection in login
 *  4. JWT validation
 */
const {
    connectDB, clearDB, disconnectDB, getAgent,
} = require('./setup');
const Admin = require('../models/Admin');

let agent;

beforeAll(async () => {
    await connectDB();
    agent = getAgent();
});

afterEach(async () => {
    await clearDB();
});

afterAll(async () => {
    await disconnectDB();
});

// ──────────────────────────────────────────────────
// Helper: create admin directly in DB (bypasses API)
// ──────────────────────────────────────────────────
async function createTestAdmin(overrides = {}) {
    return Admin.create({
        username: 'admin',
        studentId: '00001',
        email: 'admin@test.vnit.ac.in',
        password: 'SecurePass123!',
        name: 'Test Super Admin',
        provider: 'local',
        verified: true,
        role: 'super_admin',
        isTrusted: true,
        isActive: true,
        ...overrides,
    });
}

// ══════════════════════════════════════════════════
// 1. LOGIN — HAPPY PATH
// ══════════════════════════════════════════════════
describe('POST /api/auth/login', () => {
    it('should login with valid username & password', async () => {
        await createTestAdmin();

        const res = await agent
            .post('/api/auth/login')
            .send({ username: 'admin', password: 'SecurePass123!' });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body.username).toBe('admin');
        expect(res.body.role).toBe('super_admin');
        expect(res.body).not.toHaveProperty('password');
    });

    it('should login with studentId instead of username', async () => {
        await createTestAdmin();

        const res = await agent
            .post('/api/auth/login')
            .send({ studentId: '00001', password: 'SecurePass123!' });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
    });

    it('should login with email as identifier', async () => {
        await createTestAdmin();

        const res = await agent
            .post('/api/auth/login')
            .send({ username: 'admin@test.vnit.ac.in', password: 'SecurePass123!' });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
    });

    it('should increment loginCount on successful login', async () => {
        await createTestAdmin();

        await agent.post('/api/auth/login')
            .send({ username: 'admin', password: 'SecurePass123!' });
        await agent.post('/api/auth/login')
            .send({ username: 'admin', password: 'SecurePass123!' });

        const admin = await Admin.findOne({ username: 'admin' });
        expect(admin.loginCount).toBe(2);
    });
});

// ══════════════════════════════════════════════════
// 2. LOGIN — NEGATIVE CASES
// ══════════════════════════════════════════════════
describe('POST /api/auth/login — Negative', () => {
    it('should reject missing username', async () => {
        const res = await agent
            .post('/api/auth/login')
            .send({ password: 'anything' });

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/required/i);
    });

    it('should reject missing password', async () => {
        const res = await agent
            .post('/api/auth/login')
            .send({ username: 'admin' });

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/required/i);
    });

    it('should reject non-existent user', async () => {
        const res = await agent
            .post('/api/auth/login')
            .send({ username: 'noone', password: 'anything' });

        expect(res.status).toBe(401);
        expect(res.body.message).toMatch(/not found/i);
    });

    it('should reject wrong password', async () => {
        await createTestAdmin();

        const res = await agent
            .post('/api/auth/login')
            .send({ username: 'admin', password: 'WrongPassword' });

        expect(res.status).toBe(401);
        expect(res.body.message).toMatch(/wrong password/i);
    });

    it('should reject suspended accounts', async () => {
        await createTestAdmin({
            isActive: false,
            suspensionReason: 'Policy violation',
        });

        const res = await agent
            .post('/api/auth/login')
            .send({ username: 'admin', password: 'SecurePass123!' });

        expect(res.status).toBe(403);
        expect(res.body.message).toMatch(/suspended/i);
    });
});

// ══════════════════════════════════════════════════
// 3. SECURITY: NoSQL Injection in Login
// ══════════════════════════════════════════════════
describe('POST /api/auth/login — NoSQL Injection', () => {
    it('should NOT allow operator injection in username', async () => {
        await createTestAdmin();

        // Attacker sends { "$ne": null } as username to match any user
        const res = await agent
            .post('/api/auth/login')
            .send({ username: { $ne: null }, password: 'SecurePass123!' });

        // Should either 400 (bad input) or 401 (not found) — NOT 200
        expect(res.status).toBeGreaterThanOrEqual(400);
        expect(res.body).not.toHaveProperty('token');
    });

    it('should NOT allow operator injection in password', async () => {
        await createTestAdmin();

        const res = await agent
            .post('/api/auth/login')
            .send({ username: 'admin', password: { $ne: '' } });

        expect(res.status).toBeGreaterThanOrEqual(400);
        expect(res.body).not.toHaveProperty('token');
    });

    it('should NOT allow $gt operator bypass', async () => {
        await createTestAdmin();

        const res = await agent
            .post('/api/auth/login')
            .send({ username: { $gt: '' }, password: { $gt: '' } });

        expect(res.status).toBeGreaterThanOrEqual(400);
        expect(res.body).not.toHaveProperty('token');
    });
});

// ══════════════════════════════════════════════════
// 4. SEED ADMIN
// ══════════════════════════════════════════════════
describe('POST /api/auth/seed', () => {
    it('should create super_admin when none exists', async () => {
        const res = await agent.post('/api/auth/seed');

        expect(res.status).toBe(201);
        expect(res.body.role).toBe('super_admin');
        expect(res.body).toHaveProperty('token');
    });

    it('should REJECT seed when super_admin already exists', async () => {
        await createTestAdmin();

        const res = await agent.post('/api/auth/seed');

        expect(res.status).toBe(403);
        expect(res.body.message).toMatch(/already exists/i);
    });
});

// ══════════════════════════════════════════════════
// 5. GET /api/auth/me — JWT Protected
// ══════════════════════════════════════════════════
describe('GET /api/auth/me', () => {
    it('should return profile with valid token', async () => {
        await createTestAdmin();
        const loginRes = await agent
            .post('/api/auth/login')
            .send({ username: 'admin', password: 'SecurePass123!' });

        const token = loginRes.body.token;

        const res = await agent
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.username).toBe('admin');
    });

    it('should reject request without token', async () => {
        const res = await agent.get('/api/auth/me');
        expect(res.status).toBe(401);
    });

    it('should reject malformed token', async () => {
        const res = await agent
            .get('/api/auth/me')
            .set('Authorization', 'Bearer invalid.token.here');

        expect(res.status).toBe(401);
    });
});
