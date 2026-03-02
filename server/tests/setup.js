/**
 * Per-file test setup
 * 
 * Each test file that requires('./setup') gets:
 *  - A fresh mongoose connection to the in-memory MongoDB
 *  - A supertest agent attached to the Express app
 *  - Helper functions to seed test data and clean up
 */
const mongoose = require('mongoose');
const request = require('supertest');
const path = require('path');
const fs = require('fs');
const createApp = require('../app');
const Admin = require('../models/Admin');
const Department = require('../models/Department');
const { Match } = require('../models/Match');

let app;
let agent;

const GLOBAL_CONFIG_PATH = path.join(__dirname, 'globalConfig.json');

/**
 * Connect mongoose to the in-memory MongoDB.
 * Called in beforeAll() of each test file.
 */
async function connectDB() {
    // Read URI from config file written by globalSetup (separate process)
    if (!process.env.MONGODB_URI) {
        try {
            const config = JSON.parse(fs.readFileSync(GLOBAL_CONFIG_PATH, 'utf-8'));
            process.env.MONGODB_URI = config.mongoUri;
        } catch (err) {
            throw new Error('Could not read globalConfig.json. Did globalSetup run? ' + err.message);
        }
    }
    if (!process.env.JWT_SECRET) {
        process.env.JWT_SECRET = 'test-jwt-secret-for-ci-only';
    }
    process.env.NODE_ENV = 'test';

    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    await mongoose.connect(process.env.MONGODB_URI);

    app = createApp();
    // Mock io on app so controllers don't crash
    app.set('io', { emit: jest.fn() });
    agent = request(app);
}

/**
 * Drop all collections between tests for isolation.
 */
async function clearDB() {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
}

/**
 * Disconnect mongoose after all tests in a file.
 */
async function disconnectDB() {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
}

/**
 * Seed a super_admin and return { admin, token }
 */
async function seedAdmin(overrides = {}) {
    const data = {
        username: 'testadmin',
        studentId: '99999',
        email: 'testadmin@vnit.ac.in',
        password: 'TestPass123!',
        name: 'Test Admin',
        provider: 'local',
        verified: true,
        role: 'super_admin',
        isTrusted: true,
        isActive: true,
        ...overrides,
    };
    const admin = await Admin.create(data);
    // Login to get token
    const res = await agent
        .post('/api/auth/login')
        .send({ username: data.username, password: data.password });

    return {
        admin,
        token: res.body.token,
        loginRes: res,
    };
}

/**
 * Seed two departments for match tests.
 */
async function seedDepartments() {
    const deptA = await Department.create({ name: 'Computer Science', shortCode: 'CSE' });
    const deptB = await Department.create({ name: 'Electrical Engineering', shortCode: 'EE' });
    return { deptA, deptB };
}

module.exports = {
    connectDB,
    clearDB,
    disconnectDB,
    seedAdmin,
    seedDepartments,
    getApp: () => app,
    getAgent: () => agent,
};
