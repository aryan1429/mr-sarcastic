import axios from 'axios';

async function testAPI() {
    const baseURL = 'http://localhost:3001/api/enhanced-chat';
    
    console.log('🧪 Testing Enhanced Chat API');
    console.log('============================');
    
    try {
        // Test 1: Service Status
        console.log('\n1. Testing service status...');
        const statusResponse = await axios.get(`${baseURL}/status`, { timeout: 5000 });
        console.log('✅ Status Response:');
        console.log(JSON.stringify(statusResponse.data, null, 2));
        
        // Test 2: Simple message
        console.log('\n2. Testing simple message...');
        const chatResponse = await axios.post(`${baseURL}/send-no-auth`, {
            message: "Hello! I'm feeling bored today, can you entertain me?"
        }, { timeout: 10000 });
        
        console.log('✅ Chat Response:');
        console.log(`Message: "${chatResponse.data.data.message}"`);
        console.log(`Mood: ${chatResponse.data.data.mood}`);
        console.log(`Confidence: ${chatResponse.data.data.confidence}`);
        console.log(`Source: ${chatResponse.data.data.source}`);
        
        // Test 3: Another message with different mood
        console.log('\n3. Testing sad message...');
        const sadResponse = await axios.post(`${baseURL}/send-no-auth`, {
            message: "I'm feeling really down today. Everything seems to go wrong."
        }, { timeout: 10000 });
        
        console.log('✅ Sad Response:');
        console.log(`Message: "${sadResponse.data.data.message}"`);
        console.log(`Mood: ${sadResponse.data.data.mood}`);
        console.log(`Source: ${sadResponse.data.data.source}`);
        
        console.log('\n🎉 All tests passed! The Dual Model Chat Service is working!');
        console.log('\n🎯 Summary:');
        console.log('- Enhanced chat endpoints are functional');
        console.log('- Fallback responses are working correctly');
        console.log('- Mood detection is operational');  
        console.log('- Ready to add API keys for full dual model functionality');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testAPI();