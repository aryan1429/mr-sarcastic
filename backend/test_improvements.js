#!/usr/bin/env node

// Quick test script to verify chatService improvements
import chatService from './services/chatService.js';

async function testResponses() {
    console.log('🧪 Testing improved chat responses...\n');

    const testMessages = [
        'hi',
        'who are you',
        'what are you talking about',
        'what is bot\'s favorite color',
        'bot',
        'hello there'
    ];

    for (const message of testMessages) {
        console.log(`📤 Testing: "${message}"`);
        try {
            const response = await chatService.generateResponse(message, 'test-user', []);
            console.log(`🤖 Response: ${response.text}`);
            console.log(`📊 Mood: ${response.mood}, Source: ${response.source}`);
            console.log('---');
        } catch (error) {
            console.error(`❌ Error: ${error.message}`);
        }
    }
}

testResponses().catch(console.error);