const axios = require('axios');

const testLogin = async (baseURL) => {
    console.log(`\n🧪 Testing login at: ${baseURL}/api/auth/login\n`);
    
    try {
        const response = await axios.post(`${baseURL}/api/auth/login`, {
            username: 'admin',
            password: 'admin123'
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        console.log('✅ LOGIN SUCCESSFUL!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('User:', response.data.username);
        console.log('Role:', response.data.role);
        console.log('Email:', response.data.email);
        console.log('Token:', response.data.token.substring(0, 30) + '...');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
    } catch (error) {
        console.log('❌ LOGIN FAILED!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Message:', error.response.data.message || error.response.data);
        } else if (error.request) {
            console.log('Error: No response from server');
            console.log('Details:', error.message);
        } else {
            console.log('Error:', error.message);
        }
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }
};

// Test both local and deployed
const runTests = async () => {
    console.log('🔍 API Login Test Tool');
    console.log('═══════════════════════════════════════\n');
    
    // Test local
    await testLogin('http://localhost:5000');
    
    // Test deployed (update with your Render URL)
    const renderURL = process.argv[2];
    if (renderURL) {
        await testLogin(renderURL);
    } else {
        console.log('💡 To test deployed app, run:');
        console.log('   node scripts/testLogin.js https://your-app.onrender.com\n');
    }
};

runTests();
