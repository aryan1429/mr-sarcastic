import axios from 'axios';

async function simpleTest() {
    console.log('🧪 Simple Server Test');
    console.log('====================');
    
    try {
        console.log('Testing basic health endpoint...');
        const response = await axios.get('http://localhost:3001/health', { timeout: 5000 });
        console.log('✅ Basic health check passed:', response.data);
        
        console.log('\nTesting original chat endpoint...');
        const chatResponse = await axios.post('http://localhost:3001/api/chat/send-no-auth', {
            message: "Hello"
        }, { timeout: 5000 });
        console.log('✅ Original chat endpoint works:', chatResponse.data);
        
    } catch (error) {
        console.error('❌ Test failed:', error.code || error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

simpleTest();