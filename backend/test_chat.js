import axios from 'axios';

async function testChatAPI() {
    try {
        console.log('Testing YouTube-trained chat API...');

        const response = await axios.post('http://localhost:8001/api/chat/send', {
            message: "How are you today?"
        }, {
            headers: {
                'Authorization': 'Bearer test-token' // Mock token since we disabled auth
            }
        });

        console.log('✅ Response received:');
        console.log(JSON.stringify(response.data, null, 2));

        // Test a few more messages
        const testMessages = [
            "I'm feeling sad",
            "Tell me a joke",
            "I'm bored",
            "Can you help me?",
            "What's the weather like?"
        ];

        for (const message of testMessages) {
            console.log(`\n📤 Sending: "${message}"`);
            const response = await axios.post('http://localhost:8001/api/chat/send', {
                message,
                conversationHistory: []
            }, {
                headers: {
                    'Authorization': 'Bearer test-token'
                }
            });
            console.log(`🤖 Response: "${response.data.data.message}"`);
            console.log(`😊 Mood: ${response.data.data.mood}, Confidence: ${response.data.data.confidence}%, Source: ${response.data.data.source}`);
        }

    } catch (error) {
        console.error('❌ Error testing API:', error.response?.data || error.message);
        console.error('Full error:', error);
    }
}

testChatAPI();