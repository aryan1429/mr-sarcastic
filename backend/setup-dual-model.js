#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupDualModelService() {
  console.log('🎭 Mr. Sarcastic Dual Model Setup');
  console.log('==================================================');
  console.log('\nThis script will help you configure the dual model chatbot service.');
  console.log('The dual model approach uses:');
  console.log('📊 OpenAI GPT-4o-mini for analyzing user prompts');
  console.log('🤖 Grok for generating sarcastic responses');
  console.log('\nBenefits:');
  console.log('✅ Better understanding of user intent');
  console.log('✅ More creative and sarcastic responses');
  console.log('✅ Fallback to local ML service if APIs are unavailable');
  console.log('\nLet\'s get started!\n');

  try {
    // Read current .env file
    const envPath = path.join(__dirname, '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Parse existing env variables
    const envVars = {};
    envContent.split('\n').forEach(line => {
      if (line.includes('=') && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        envVars[key] = valueParts.join('=');
      }
    });

    console.log('🔑 API Key Configuration');
    console.log('------------------------------');
    
    // OpenAI API Key
    const currentOpenAI = envVars.OPENAI_API_KEY;
    if (currentOpenAI && !currentOpenAI.includes('your_')) {
      console.log(`✅ OpenAI API Key is already configured`);
    } else {
      console.log('\n📊 OpenAI API Key (for prompt analysis)');
      console.log('Get your key from: https://platform.openai.com/api-keys');
      const openaiKey = await question('Enter your OpenAI API key (or press Enter to skip): ');
      if (openaiKey.trim()) {
        envVars.OPENAI_API_KEY = openaiKey.trim();
      }
    }

    // Grok API Key
    const currentGrok = envVars.GROK_API_KEY;
    if (currentGrok && !currentGrok.includes('your_')) {
      console.log(`✅ Grok API Key is already configured`);
    } else {
      console.log('\n🤖 Grok API Key (for sarcastic responses)');
      console.log('Get your key from: https://x.ai/ (X.AI Platform)');
      const grokKey = await question('Enter your Grok API key (or press Enter to skip): ');
      if (grokKey.trim()) {
        envVars.GROK_API_KEY = grokKey.trim();
      }
    }

    // Service configuration
    console.log('\n⚙️  Service Configuration');
    console.log('------------------------------');
    
    const enableDualModel = await question('Enable dual model service? (y/n) [y]: ');
    envVars.USE_DUAL_MODEL = (enableDualModel.toLowerCase() !== 'n').toString();

    // ML Service URL
    const currentMLUrl = envVars.ML_SERVICE_URL || 'http://localhost:8001';
    console.log(`\n📡 Local ML Service URL: ${currentMLUrl}`);
    const newMLUrl = await question('Enter ML service URL (or press Enter to keep current): ');
    if (newMLUrl.trim()) {
      envVars.ML_SERVICE_URL = newMLUrl.trim();
    }

    // Write updated .env file
    let newEnvContent = '';
    const processedKeys = new Set();

    // Update existing lines
    envContent.split('\n').forEach(line => {
      if (line.includes('=') && !line.startsWith('#')) {
        const [key] = line.split('=');
        if (envVars[key] !== undefined) {
          newEnvContent += `${key}=${envVars[key]}\n`;
          processedKeys.add(key);
        } else {
          newEnvContent += line + '\n';
        }
      } else {
        newEnvContent += line + '\n';
      }
    });

    // Add new keys that weren't in the original file
    Object.keys(envVars).forEach(key => {
      if (!processedKeys.has(key)) {
        newEnvContent += `${key}=${envVars[key]}\n`;
      }
    });

    fs.writeFileSync(envPath, newEnvContent);

    console.log('\n✅ Configuration saved to .env file');
    console.log('\n🎯 Next Steps:');
    console.log('1. Restart your backend server');
    console.log('2. Test the enhanced chat endpoint: /api/enhanced-chat/send');
    console.log('3. Check service status: /api/enhanced-chat/status');
    console.log('4. Compare both services: /api/enhanced-chat/compare');
    
    console.log('\n🧪 Quick Test Commands:');
    console.log('curl -X POST http://localhost:3001/api/enhanced-chat/send-no-auth \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -d \'{"message":"Hello! I\'m feeling bored today"}\'');
    
    console.log('\nService Status:');
    console.log('curl http://localhost:3001/api/enhanced-chat/status');

    console.log('\n🎭 Happy chatting with your enhanced Mr. Sarcastic!');

  } catch (error) {
    console.error('❌ Setup error:', error.message);
  } finally {
    rl.close();
  }
}

// Run setup if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDualModelService();
}

export default setupDualModelService;