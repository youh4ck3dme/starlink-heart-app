import axios from 'axios';

async function testProxy() {
    const BASE_URL = 'http://localhost:3001/api';
    console.log('--- TESTING EDUPAGE PROXY ---');

    try {
        // 1. Health check
        console.log('\n[1] Checking Health...');
        const health = await axios.get(`${BASE_URL}/health`);
        console.log('✅ Health OK:', health.data);

        // 2. Mock Login
        console.log('\n[2] Attempting Login...');
        let sessionId = '';
        try {
            const login = await axios.post(`${BASE_URL}/edupage/login`, {
                username: 'demo',
                password: 'demo',
                ebuid: 'zskostolany'
            });
            sessionId = login.data.sessionId;
            console.log('✅ Login Response:', login.data);
        } catch (e: any) {
            console.log('❌ Login failed (as expected if credentials invalid):', e.response?.data || e.message);
        }

        // 3. Snapshot with session
        if (sessionId) {
            console.log('\n[3] Testing Snapshot with Session:', sessionId);
            try {
                const snapshot = await axios.get(`${BASE_URL}/edupage/snapshot`, {
                    headers: { 'x-session-id': sessionId }
                });
                console.log('✅ Snapshot Data Received:');
                console.log(JSON.stringify(snapshot.data, null, 2).slice(0, 1000) + '...');
            } catch (e: any) {
                console.log('❌ Snapshot failed:', e.response?.data || e.message);
            }
        }

        console.log('\n--- TEST COMPLETE ---');
    } catch (error: any) {
        console.error('❌ Proxy Test Failed:', error.message);
    }
}

testProxy();
