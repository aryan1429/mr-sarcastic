import axios from 'axios';

async function testNoAuthChat() {
    try {
        console.log('🧪 Testing no-auth chat endpoint...');

        const testMessages = [
            "hi",
            "hello", 
            "How are you?",
            "I'm feeling sad",
            "Tell me a joke"
        ];

        for (const message of testMessages) {
            console.log(`\n📤 Sending: "${message}"`);
            
            const response = await axios.post('http://localhost:8001/api/chat/send-no-auth', {
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

testNoAuthChat();