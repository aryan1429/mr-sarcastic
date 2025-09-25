import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const BASE_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const ENHANCED_CHAT_URL = `${BASE_URL}/api/enhanced-chat`;

// Test messages with different intents and moods
const testMessages = [
    {
        name: "Happy Greeting",
        message: "Hey there! I'm having such an amazing day!",
        expectedMood: "happy",
        expectedIntent: "greeting"
    },
    {
        name: "Sad Expression", 
        message: "I'm feeling really down today. Everything seems to go wrong.",
        expectedMood: "sad",
        expectedIntent: "emotional_support"
    },
    {
        name: "Music Request",
        message: "I'm bored, can you recommend some good music?",
        expectedMood: "bored",
        expectedIntent: "music_request"
    },
    {
        name: "Angry Rant",
        message: "I'm so frustrated with everything! Nothing makes sense anymore!",
        expectedMood: "angry",
        expectedIntent: "complaint"
    },
    {
        name: "Casual Question",
        message: "What do you think about artificial intelligence and the future of humanity?",
        expectedMood: "neutral",
        expectedIntent: "question"
    },
    {
        name: "Help Request",
        message: "I need some advice about dealing with stress. Can you help?",
        expectedMood: "neutral",
        expectedIntent: "help"
    },
    {
        name: "Playful Interaction",
        message: "Are you actually sarcastic or just pretending to be witty?",
        expectedMood: "playful",
        expectedIntent: "question"
    }
];

class DualModelTester {
    constructor() {
        this.results = [];
        this.conversationHistory = [];
    }

    async testServiceStatus() {
        console.log('🔍 Testing service status...');
        try {
            const response = await axios.get(`${ENHANCED_CHAT_URL}/status`);
            console.log('✅ Service Status:', JSON.stringify(response.data, null, 2));
            return response.data;
        } catch (error) {
            console.error('❌ Service status error:', error.message);
            return null;
        }
    }

    async testSingleMessage(testCase) {
        console.log(`\n🧪 Testing: ${testCase.name}`);
        console.log(`📝 Message: "${testCase.message}"`);
        console.log(`🎯 Expected - Mood: ${testCase.expectedMood}, Intent: ${testCase.expectedIntent}`);
        
        try {
            const startTime = Date.now();
            
            const response = await axios.post(`${ENHANCED_CHAT_URL}/send-no-auth`, {
                message: testCase.message,
                conversationHistory: this.conversationHistory
            }, {
                timeout: 30000  // 30 second timeout
            });

            const endTime = Date.now();
            const responseTime = endTime - startTime;

            if (response.data.success) {
                const result = response.data.data;
                
                console.log(`🤖 Response: "${result.message}"`);
                console.log(`📊 Detected - Mood: ${result.mood}, Confidence: ${result.confidence}`);
                console.log(`⚡ Response Time: ${responseTime}ms`);
                console.log(`🔧 Source: ${result.source}`);
                
                if (result.analysis) {
                    console.log(`🎯 Analysis - Intent: ${result.analysis.intent}, Sarcasm Level: ${result.analysis.sarcasm_level}`);
                }

                if (result.model_info) {
                    console.log(`🧠 Models Used:`, result.model_info);
                }

                // Update conversation history
                this.conversationHistory.push({
                    message: testCase.message,
                    response: result.message
                });

                // Keep only last 3 exchanges
                if (this.conversationHistory.length > 3) {
                    this.conversationHistory = this.conversationHistory.slice(-3);
                }

                const testResult = {
                    test: testCase.name,
                    success: true,
                    responseTime,
                    expected: { mood: testCase.expectedMood, intent: testCase.expectedIntent },
                    actual: { 
                        mood: result.mood, 
                        intent: result.analysis?.intent || 'unknown',
                        confidence: result.confidence,
                        source: result.source
                    },
                    response: result.message
                };

                this.results.push(testResult);
                return testResult;

            } else {
                console.error('❌ Request failed:', response.data);
                return { test: testCase.name, success: false, error: 'Request failed' };
            }

        } catch (error) {
            console.error(`❌ Test failed:`, error.message);
            if (error.response?.data) {
                console.error('Response data:', error.response.data);
            }
            
            const testResult = {
                test: testCase.name,
                success: false,
                error: error.message,
                responseTime: null
            };
            
            this.results.push(testResult);
            return testResult;
        }
    }

    async testComparison() {
        console.log('\n🔄 Testing service comparison...');
        
        try {
            const testMessage = "I'm so bored, can you entertain me with some sarcasm?";
            
            const response = await axios.post(`${ENHANCED_CHAT_URL}/compare`, {
                message: testMessage
            }, {
                timeout: 45000  // 45 second timeout for comparison
            });

            if (response.data.success) {
                const comparison = response.data.data;
                
                console.log('📊 Service Comparison Results:');
                console.log('─'.repeat(50));
                
                if (comparison.responses.original.success) {
                    console.log('🔵 Original Service:');
                    console.log(`   Response: "${comparison.responses.original.text}"`);
                    console.log(`   Source: ${comparison.responses.original.source}`);
                    console.log(`   Confidence: ${comparison.responses.original.confidence}`);
                } else {
                    console.log('🔵 Original Service: ❌ Failed');
                    console.log(`   Error: ${comparison.responses.original.error}`);
                }

                if (comparison.responses.dual_model.success) {
                    console.log('\n🟢 Dual Model Service:');
                    console.log(`   Response: "${comparison.responses.dual_model.text}"`);
                    console.log(`   Source: ${comparison.responses.dual_model.source}`);
                    console.log(`   Confidence: ${comparison.responses.dual_model.confidence}`);
                    if (comparison.responses.dual_model.analysis) {
                        console.log(`   Analysis: Intent=${comparison.responses.dual_model.analysis.intent}`);
                    }
                } else {
                    console.log('\n🟢 Dual Model Service: ❌ Failed');
                    console.log(`   Error: ${comparison.responses.dual_model.error}`);
                }

                return comparison;
            }

        } catch (error) {
            console.error('❌ Comparison test failed:', error.message);
            return null;
        }
    }

    async runAllTests() {
        console.log('🎭 Starting Dual Model Chat Service Tests');
        console.log('='.repeat(60));
        
        // Test service status first
        const status = await this.testServiceStatus();
        if (!status) {
            console.error('❌ Service is not available. Please check your server.');
            return;
        }

        // Run individual message tests
        console.log('\n📝 Running individual message tests...');
        for (const testCase of testMessages) {
            await this.testSingleMessage(testCase);
            // Small delay between tests
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Test comparison
        await this.testComparison();

        // Generate summary report
        this.generateReport();
    }

    generateReport() {
        console.log('\n📊 Test Summary Report');
        console.log('='.repeat(60));

        const successful = this.results.filter(r => r.success);
        const failed = this.results.filter(r => !r.success);

        console.log(`✅ Successful tests: ${successful.length}/${this.results.length}`);
        console.log(`❌ Failed tests: ${failed.length}/${this.results.length}`);

        if (successful.length > 0) {
            const avgResponseTime = successful
                .filter(r => r.responseTime)
                .reduce((sum, r) => sum + r.responseTime, 0) / successful.length;
            
            console.log(`⚡ Average response time: ${avgResponseTime.toFixed(0)}ms`);

            // Source distribution
            const sources = {};
            successful.forEach(r => {
                sources[r.actual.source] = (sources[r.actual.source] || 0) + 1;
            });
            
            console.log('🔧 Response sources:');
            Object.entries(sources).forEach(([source, count]) => {
                console.log(`   ${source}: ${count} responses`);
            });

            // Confidence distribution
            const avgConfidence = successful
                .reduce((sum, r) => sum + (r.actual.confidence || 0), 0) / successful.length;
            
            console.log(`🎯 Average confidence: ${avgConfidence.toFixed(2)}`);
        }

        if (failed.length > 0) {
            console.log('\n❌ Failed Tests:');
            failed.forEach(r => {
                console.log(`   ${r.test}: ${r.error}`);
            });
        }

        console.log('\n🎭 Test completed! Check the results above.');
        
        // Save detailed results to file
        try {
            const reportData = {
                timestamp: new Date().toISOString(),
                summary: {
                    total: this.results.length,
                    successful: successful.length,
                    failed: failed.length,
                    avgResponseTime: successful.length > 0 ? 
                        successful.reduce((sum, r) => sum + (r.responseTime || 0), 0) / successful.length : 0
                },
                results: this.results
            };
            
            fs.writeFileSync('test-results.json', JSON.stringify(reportData, null, 2));
            console.log('📁 Detailed results saved to test-results.json');
        } catch (error) {
            console.log('⚠️  Could not save results to file:', error.message);
        }
    }
}

// Run tests if this file is executed directly
async function runTests() {
    const tester = new DualModelTester();
    await tester.runAllTests();
}

if (import.meta.url === `file://${process.argv[1]}`) {
    runTests().catch(console.error);
}

export default DualModelTester;