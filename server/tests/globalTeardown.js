/**
 * Jest Global Teardown
 * 
 * Stops the in-memory MongoDB instance after all tests complete.
 */
const path = require('path');
const fs = require('fs');

const GLOBAL_CONFIG_PATH = path.join(__dirname, 'globalConfig.json');

module.exports = async function globalTeardown() {
    if (globalThis.__MONGOD__) {
        await globalThis.__MONGOD__.stop();
        console.log('\n🧹 In-memory MongoDB stopped.\n');
    }

    // Clean up the config file
    try {
        fs.unlinkSync(GLOBAL_CONFIG_PATH);
    } catch { /* ignore */ }
};
