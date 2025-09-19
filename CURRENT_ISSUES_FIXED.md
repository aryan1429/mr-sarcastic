# Quick Fix Guide for Current Issues

## Issue 1: API Connection (FIXED ✅)

**Problem**: Frontend was trying to connect to `http://localhost:3000/api` instead of `http://localhost:8001/api`

**Cause**: The `.env.local` file had the wrong API URL which overrides the `.env` file

**Solution**: Updated `.env.local` with the correct API URL:
```
VITE_API_BASE_URL=http://localhost:8001/api
```

## Issue 2: Google OAuth Origin Error (NEEDS FIX ⚠️)

**Problem**: `The given origin is not allowed for the given client ID`

**Cause**: Google Cloud Console doesn't have `http://localhost:5173` in authorized origins

**Solution**: Add the following to your Google Cloud Console OAuth credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services > Credentials**
3. Click on your OAuth 2.0 Client ID: `543797604065-gg3s2j71ai6a5netegp1la3qk84lmhq9.apps.googleusercontent.com`
4. In **Authorized JavaScript origins**, add:
   - `http://localhost:5173`
   - `http://localhost:5174` (backup)

## Issue 3: E.C.P Message (NOT CRITICAL 🔵)

**Problem**: Console shows "E.C.P is not enabled, returning"

**Cause**: This appears to be from a browser extension or external script

**Solution**: This doesn't affect app functionality, can be ignored

## Current Status

- ✅ Backend: Running on port 8001
- ✅ Frontend: Running on port 5173
- ✅ API Connection: Fixed
- ⚠️ Google OAuth: Needs Google Cloud Console update
- ✅ Email Signup: Should work now

## Test Instructions

1. Try email signup with a test account
2. After fixing Google OAuth origins, test Google login
3. Both methods should work properly

## Port Configuration Summary

- Backend API: `http://localhost:8001`
- Frontend App: `http://localhost:5173`
- API Endpoint: `http://localhost:8001/api`
