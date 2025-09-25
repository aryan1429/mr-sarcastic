// Quick test to verify our dual model service setup
import dualModelChatService from './services/dualModelChatService.js';

console.log('🎭 Testing Dual Model Chat Service');
console.log('==================================');

// Test service initialization
console.log('✅ Service imported successfully');

// Test configuration check
try {
    const status = await dualModelChatService.getServiceStatus();
    console.log('\n📊 Service Status:');
    console.log(`OpenAI Available: ${status.openai_available}`);
    console.log(`Grok Available: ${status.grok_available}`);
    console.log(`ML Service Available: ${status.ml_service_available}`);
    console.log(`Service Mode: ${status.service_mode}`);
    
    console.log('\n🧪 Testing a simple response...');
    const testMessage = "Hello! I'm feeling bored today.";
    const response = await dualModelChatService.generateResponse(testMessage);
    
    console.log(`\n🤖 Response Generated:`);
    console.log(`Message: "${response.text}"`);
    console.log(`Mood: ${response.mood}`);
    console.log(`Confidence: ${response.confidence}`);
    console.log(`Source: ${response.source}`);
    console.log(`Generation Time: ${response.generation_time}ms`);
    
    if (response.analysis) {
        console.log(`Analysis Intent: ${response.analysis.intent}`);
        console.log(`Sarcasm Level: ${response.analysis.sarcasm_level_request}`);
    }
    
    console.log('\n✅ Quick test completed successfully!');
    console.log('\n🎯 Next Steps:');
    console.log('1. Add your API keys to .env file:');
    console.log('   OPENAI_API_KEY=your_openai_key');
    console.log('   GROK_API_KEY=your_grok_key');
    console.log('2. Set USE_DUAL_MODEL=true in .env');
    console.log('3. Restart the server and test the endpoints');
    
} catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 This is normal if you haven\'t configured API keys yet.');
    console.log('The service will fall back to pattern-based responses.');
}