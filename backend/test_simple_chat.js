import axios from 'axios';

async function testChatAPI() {
    try {
        console.log('Testing chat API without authentication...');

        const response = await axios.post('http://localhost:8001/api/chat/test', {
            message: "hi"
        });

        console.log('✅ Response received:');
        console.log(JSON.stringify(response.data, null, 2));

        // Test a few more messages
        const testMessages = [
            "hello",
            "How are you?",
            "I'm feeling sad",
            "Tell me a joke"
        ];

        for (const message of testMessages) {
            console.log(`\n📤 Sending: "${message}"`);
            const response = await axios.post('http://localhost:8001/api/chat/test', {
                message,
                conversationHistory: []
            });
            console.log(`🤖 Response: "${response.data.data.message}"`);
            console.log(`😊 Mood: ${response.data.data.mood}, Confidence: ${response.data.data.confidence}, Source: ${response.data.data.source}`);
        }

    } catch (error) {
        console.error('❌ Error testing API:', error.response?.data || error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

testChatAPI();