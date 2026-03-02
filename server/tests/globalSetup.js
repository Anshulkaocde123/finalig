/**
 * Jest Global Setup
 * 
 * Starts an in-memory MongoDB instance before any test file runs.
 * The URI is written to a temp config file so workers can read it.
 */
const { MongoMemoryServer } = require('mongodb-memory-server');
const path = require('path');
const fs = require('fs');

const GLOBAL_CONFIG_PATH = path.join(__dirname, 'globalConfig.json');

module.exports = async function globalSetup() {
    const mongod = new MongoMemoryServer({
        instance: {
            dbName: 'vnit_ig_test',
        },
    });
    await mongod.start();

    const uri = mongod.getUri();

    // Write config to disk so Jest workers can read it
    const config = {
        mongoUri: uri,
        mongodInstancePath: mongod.instanceInfo?.tmpDir,
    };
    fs.writeFileSync(GLOBAL_CONFIG_PATH, JSON.stringify(config));

    // Also set for the globalSetup process itself
    process.env.MONGODB_URI = uri;
    process.env.JWT_SECRET = 'test-jwt-secret-for-ci-only';
    process.env.NODE_ENV = 'test';

    // Store the instance reference so globalTeardown can stop it
    globalThis.__MONGOD__ = mongod;

    console.log(`\n🧪 In-memory MongoDB started: ${uri}\n`);
};
