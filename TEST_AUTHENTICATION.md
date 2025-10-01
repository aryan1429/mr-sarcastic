# Testing Profile Update Functionality

## Issue: User Authentication Required

The 401 Unauthorized errors occur because the user is not authenticated. To test the profile update functionality, you need to authenticate first.

## Quick Testing Solutions

### Option 1: Create Test User via Email/Password

1. Navigate to: `http://localhost:5173/auth`
2. Click on "Sign Up" tab
3. Create a test account:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `TestPass123`
   - Confirm Password: `TestPass123`
4. After signup, you'll be logged in automatically
5. Navigate to `/profile` to test the new features

### Option 2: Use Browser Console (Manual Token)

If you need to test without going through full authentication:

1. Open browser developer tools (F12)
2. Go to Console tab
3. Create a test token manually:

```javascript
// Set a test token (this is just for testing)
localStorage.setItem('authToken', 'test-token');
localStorage.setItem('userData', JSON.stringify({
  email: 'test@example.com',
  name: 'Test User',
  picture: null
}));

// Reload the page
window.location.reload();
```

**Note:** This will still fail API calls because the backend needs a valid JWT token.

### Option 3: Backend Test Endpoint (Recommended)

Add a test endpoint to generate valid tokens for development:

```javascript
// Add to backend/routes/auth.js
router.post('/test-login', async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ error: 'Test endpoint only available in development' });
  }
  
  // Create or find test user
  let user = await User.findByEmail('test@example.com');
  if (!user) {
    user = new User({
      email: 'test@example.com',
      name: 'Test User',
      authProvider: 'email',
      emailVerified: true
    });
    await user.save();
  }
  
  // Generate token
  const token = jwt.sign(
    {
      userId: user._id,
      email: user.email,
      name: user.name,
      authProvider: 'email'
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  res.json({
    success: true,
    token,
    user: user.getPublicProfile()
  });
});
```

## Current Authentication Flow

1. **Firebase Auth** - Primary authentication (having issues)
2. **Email/Password** - Working backend implementation
3. **Google OAuth** - Available but requires setup

## To Test Profile Features

1. **Authentication Required**: User must be logged in first
2. **Valid JWT Token**: Must be stored in localStorage as 'authToken'
3. **API Calls**: Profile component only makes calls when authenticated

## Expected Behavior

- ✅ Unauthenticated users → Redirect to `/auth`
- ✅ Authenticated users → Access profile features
- ✅ 401 errors → User needs to log in
- ✅ Profile updates → Require valid authentication

## Debug Information

Current authentication state can be seen in browser console:
- Check localStorage for 'authToken' and 'userData'
- Look for authentication logs in console
- Verify API requests include Authorization headers