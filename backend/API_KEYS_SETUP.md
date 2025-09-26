# API Keys Setup Guide

## 🔑 Getting Your API Keys

### 1. OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Click "Create new secret key"
5. Copy the key (starts with `sk-`)
6. Add billing information (required for API access)

**Recommended model:** `gpt-4o-mini` (fast and cost-effective for analysis)

### 2. Grok API Key (X.AI)
1. Go to [X.AI Console](https://console.x.ai/)
2. Sign up or log in
3. Navigate to API Keys
4. Create a new API key
5. Copy the key
6. Note: Grok is currently in beta, you may need to request access

**Alternative:** If Grok is not available, you can use OpenAI for both analysis and response generation.

### 3. Update your .env file

Replace `your_openai_api_key_here` and `your_grok_api_key_here` with your actual keys:

```env
# AI Model Configuration
OPENAI_API_KEY=sk-your-actual-openai-key-here
GROK_API_KEY=your-actual-grok-key-here
GROK_BASE_URL=https://api.x.ai/v1

# Enable Dual Model Service
USE_DUAL_MODEL=true
```

### 4. Alternative Setup (OpenAI Only)

If you only have OpenAI API key, you can still use dual model approach:

```env
# Use OpenAI for both analysis and response
OPENAI_API_KEY=sk-your-actual-openai-key-here
USE_OPENAI_FOR_RESPONSES=true
USE_DUAL_MODEL=true
```

## 🔒 Security Notes

- Never commit real API keys to version control
- Add `.env` to `.gitignore`
- Use environment variables in production
- Monitor API usage and costs
- Set spending limits in API dashboards

## 💰 Cost Estimates

### OpenAI GPT-4o-mini
- Input: ~$0.15 per 1M tokens
- Output: ~$0.60 per 1M tokens
- Typical chat message: 50-200 tokens
- Cost per message: ~$0.0001-0.0005

### Grok (X.AI)
- Pricing varies (currently in beta)
- Check X.AI console for current rates

## 🧪 Testing Without API Keys

The dual model system includes fallback mechanisms:
- Pattern-based responses
- Local ML service integration
- Original chatbot functionality

You can test the architecture even without API keys!