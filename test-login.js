// Quick test: Check admin login and seed if needed
const http = require('http');

function makeRequest(method, path, body) {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : null;
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...(data && { 'Content-Length': Buffer.byteLength(data) })
            }
        };
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
                catch { resolve({ status: res.statusCode, data: body }); }
            });
        });
        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

async function main() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 Testing Admin Login...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Step 1: Try login
    console.log('1️⃣  Trying login with admin/admin123...');
    try {
        const loginRes = await makeRequest('POST', '/api/auth/login', {
            username: 'admin',
            password: 'admin123'
        });
        console.log(`   Status: ${loginRes.status}`);
        console.log(`   Response:`, JSON.stringify(loginRes.data, null, 2));

        if (loginRes.status === 200) {
            console.log('\n✅ LOGIN SUCCESSFUL!');
            console.log(`   Username: ${loginRes.data.username}`);
            console.log(`   Email: ${loginRes.data.email}`);
            console.log(`   Role: ${loginRes.data.role}`);
            console.log(`   Token: ${loginRes.data.token?.substring(0, 30)}...`);
            process.exit(0);
        }
    } catch (e) {
        console.log(`   Error: ${e.message}`);
    }

    // Step 2: If login failed, seed the admin
    console.log('\n2️⃣  Admin not found. Seeding admin account...');
    try {
        const seedRes = await makeRequest('POST', '/api/auth/seed');
        console.log(`   Status: ${seedRes.status}`);
        console.log(`   Response:`, JSON.stringify(seedRes.data, null, 2));

        if (seedRes.status === 201) {
            console.log('\n✅ ADMIN SEEDED SUCCESSFULLY!');
        } else if (seedRes.status === 400) {
            console.log('\n⚠️  Admin already exists but login failed.');
            console.log('   The password in the database might be different.');
            console.log('   Checking with email login...');

            // Try with email
            const emailRes = await makeRequest('POST', '/api/auth/login', {
                username: 'admin@vnit.ac.in',
                password: 'admin123'
            });
            console.log(`   Email login status: ${emailRes.status}`);
            console.log(`   Response:`, JSON.stringify(emailRes.data, null, 2));
        }
    } catch (e) {
        console.log(`   Error: ${e.message}`);
    }

    // Step 3: Try login again after seeding
    console.log('\n3️⃣  Trying login again after seed...');
    try {
        const loginRes2 = await makeRequest('POST', '/api/auth/login', {
            username: 'admin',
            password: 'admin123'
        });
        console.log(`   Status: ${loginRes2.status}`);
        console.log(`   Response:`, JSON.stringify(loginRes2.data, null, 2));

        if (loginRes2.status === 200) {
            console.log('\n✅ LOGIN NOW WORKS!');
        } else {
            console.log('\n❌ LOGIN STILL FAILING - investigating...');
        }
    } catch (e) {
        console.log(`   Error: ${e.message}`);
    }

    process.exit(0);
}

main();
