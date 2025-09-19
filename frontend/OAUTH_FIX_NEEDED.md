# Quick Setup Guide for Google OAuth

## Current Issue: Origin Mismatch
Your Google OAuth client ID `543797604065-gg3s2j71ai6a5netegp1la3qk84lmhq9.apps.googleusercontent.com` needs to have `http://localhost:8080` added as an authorized origin.

## How to Fix:

1. **Google Cloud Console**: https://console.cloud.google.com/
2. **Navigate to**: APIs & Services > Credentials
3. **Find your OAuth client**: 543797604065-gg3s2j71ai6a5netegp1la3qk84lmhq9.apps.googleusercontent.com
4. **Click Edit** (pencil icon)
5. **Add to "Authorized JavaScript origins"**:
   ```
   http://localhost:8080
   ```
6. **Click Save**

## After Fixing:
- ✅ Email/Password auth will continue working
- ✅ Google OAuth will work without errors
- ✅ Both login and signup with Google will function properly

## Status Check:
- Client ID: ✅ Correctly configured
- Environment: ✅ Properly loaded
- Code: ✅ Correctly implemented
- Origins: ❌ Need to add localhost:8080

Once you add the origin, refresh the page and test the Google sign-in button!
