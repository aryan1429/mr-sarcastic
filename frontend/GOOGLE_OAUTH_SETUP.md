# Google OAuth Setup Guide

## Setting up Google Authentication for Mr Sarcastic

### Step 1: Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Identity** API

### Step 2: Create OAuth 2.0 Credentials

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth 2.0 Client IDs**
3. Set Application type to **Web application**
4. Add authorized JavaScript origins:
   - For development: `http://localhost:5173`
   - For development backup: `http://localhost:5174`
   - For production: `https://yourdomain.com`

**Important**: Make sure to use `http://localhost:5173` (not port 8080 or 3000) as this is the port Vite uses by default.

### Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env.local`
2. Replace `demo-client-id` with your actual Google Client ID
3. Save the file

```bash
# In .env.local
VITE_GOOGLE_CLIENT_ID=your-actual-client-id-here.apps.googleusercontent.com
```

### Step 4: Test Authentication

1. Start the development server: `npm run dev`
2. Navigate to `/login` or `/signup`
3. Click the "Sign in with Google" button
4. Complete the Google OAuth flow

## Current Status

- ✅ **Email/Password Authentication**: Working (simulated)
- ✅ **Google OAuth UI**: Implemented with proper fallbacks
- ⚠️ **Google OAuth Integration**: Requires valid Client ID
- ⚠️ **Backend Integration**: Not yet implemented

## Features

### Dual Authentication Support
- Users can sign up/login with **email & password**
- Users can also use **Google OAuth** for quick access
- Both methods work independently
- Consistent user experience across both flows

### Fallback Handling
- If Google Client ID is not configured, buttons show but gracefully handle errors
- Email/password authentication always works
- Clear error messages for users

### Security Considerations
- Client ID validation
- Proper error handling
- Secure token management (when backend is added)

## Next Steps

1. **Add Backend API**: Implement user registration, authentication, and session management
2. **Database Integration**: Store user accounts and authentication data
3. **JWT Tokens**: Implement proper session management
4. **Email Verification**: Add email confirmation for new accounts
5. **Password Reset**: Implement forgot password functionality
