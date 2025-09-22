import chatService from './services/chatService.js';

// Test song recommendations
async function testSongRecommendations() {
    try {
        console.log('Testing mood-based song recommendations...\n');
        
        // Test different mood queries
        const testQueries = [
            "I feel sad",
            "I'm happy today",
            "I'm feeling angry",
            "Recommend me some songs based on my mood - I'm energetic",
            "I need some music, feeling chill",
            "What music should I listen to when I'm bored?"
        ];
        
        for (const query of testQueries) {
            console.log(`\nQuery: "${query}"`);
            console.log('---'.repeat(20));
            
            const response = await chatService.generateResponse(query);
            console.log(response.text);
            console.log(`Detected mood: ${response.mood}`);
            console.log('='.repeat(60));
        }
        
    } catch (error) {
        console.error('Error testing song recommendations:', error);
    }
}

testSongRecommendations();