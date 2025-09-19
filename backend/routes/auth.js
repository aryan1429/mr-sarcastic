import express from 'express';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import googleAuthService from '../services/googleAuth.js';
import mockDatabase from '../services/mockDatabase.js';

// Import User model - will fall back to mock if MongoDB fails
let User;
try {
  const userModule = await import('../models/User.js');
  User = userModule.default;
} catch (error) {
  console.log('Using mock User model');
  User = mockDatabase.User;
}

const router = express.Router();

// Email/Password Registration
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ 
        error: 'All fields are required',
        details: 'Username, email, and password must be provided'
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format' 
      });
    }

    if (password.length < 8) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters long' 
      });
    }

    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({ 
        error: 'Username must be between 3 and 30 characters' 
      });
    }

    // Password strength validation
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      return res.status(400).json({ 
        error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ 
        error: 'User already exists',
        details: 'An account with this email already exists'
      });
    }

    // Create new user
    const user = new User({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password,
      name: username.trim(), // Use username as display name initially
      authProvider: 'email',
      emailVerified: false // In production, send verification email
    });

    await user.save();

    // Generate JWT token
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

    res.status(201).json({
      success: true,
      token,
      user: user.getPublicProfile(),
      message: 'Account created successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: error.message
    });
  }
});

// Email/Password Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format' 
      });
    }

    // Find user and include password for comparison
    const user = await User.findByEmail(email).select('+password');
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        details: 'No account found with this email address'
      });
    }

    // Check if user registered with Google OAuth
    if (user.authProvider === 'google') {
      return res.status(400).json({ 
        error: 'Account uses Google sign-in',
        details: 'Please sign in with Google instead'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        details: 'Incorrect password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
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
      user: user.getPublicProfile(),
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: error.message
    });
  }
});

// Google OAuth login
router.post('/google', async (req, res) => {
  try {
    const { credential, code } = req.body;
    let userProfile;

    if (credential) {
      // ID Token flow (recommended for web apps)
      userProfile = await googleAuthService.verifyIdToken(credential);
    } else if (code) {
      // Authorization code flow
      const tokens = await googleAuthService.exchangeCodeForTokens(code);
      userProfile = await googleAuthService.getGoogleProfile(tokens.access_token);
    } else {
      return res.status(400).json({ error: 'Missing credential or authorization code' });
    }

    // Create or update user in MongoDB
    const googleId = userProfile.googleId || userProfile.id;
    let user = await User.findByGoogleId(googleId);

    if (user) {
      // Update existing user
      user.email = userProfile.email;
      user.name = userProfile.name;
      user.picture = userProfile.picture;
      user.emailVerified = userProfile.emailVerified || userProfile.verified_email;
      user.lastLogin = new Date();
      await user.save();
    } else {
      // Check if email already exists with email auth
      const existingEmailUser = await User.findByEmail(userProfile.email);
      if (existingEmailUser && existingEmailUser.authProvider === 'email') {
        return res.status(409).json({
          error: 'Account exists with email/password',
          details: 'Please sign in with your email and password instead'
        });
      }

      // Create new user
      user = new User({
        googleId,
        email: userProfile.email,
        name: userProfile.name,
        picture: userProfile.picture,
        emailVerified: userProfile.emailVerified || userProfile.verified_email,
        authProvider: 'google',
        lastLogin: new Date()
      });
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        googleId: user.googleId,
        email: user.email,
        name: user.name,
        authProvider: 'google'
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(400).json({
      error: 'Authentication failed',
      message: error.message
    });
  }
});

// Google OAuth code exchange for popup flow
router.post('/google/exchange', async (req, res) => {
  try {
    console.log('Received Google OAuth code exchange request');
    const { code, state } = req.body;
    
    console.log('Request body details:', { 
      codeReceived: !!code, 
      codeLength: code ? code.length : 0,
      stateReceived: !!state,
      stateValid: state?.startsWith('oauth_state_')
    });
    
    if (!code) {
      console.log('Error: Missing authorization code');
      return res.status(400).json({ 
        error: 'Authorization code is required',
        success: false 
      });
    }

    if (!state || !state.startsWith('oauth_state_')) {
      console.log('Error: Invalid state parameter:', state);
      return res.status(400).json({ 
        error: 'Invalid or missing state parameter',
        success: false 
      });
    }
    
    console.log('Google OAuth request validation passed, proceeding to exchange code');

    // Exchange authorization code for tokens
    const tokens = await googleAuthService.exchangeCodeForTokens(code);
    
    // Get user profile using access token
    const userProfile = await googleAuthService.getGoogleProfile(tokens.access_token);

    // Create or update user in database (same logic as existing Google auth)
    const googleId = userProfile.googleId || userProfile.id;
    let user = await User.findByGoogleId(googleId);

    if (user) {
      // Update existing user
      user.email = userProfile.email;
      user.name = userProfile.name;
      user.picture = userProfile.picture;
      user.emailVerified = userProfile.emailVerified || userProfile.verified_email;
      user.lastLogin = new Date();
      await user.save();
    } else {
      // Check if email already exists with email auth
      const existingEmailUser = await User.findByEmail(userProfile.email);
      if (existingEmailUser && existingEmailUser.authProvider === 'email') {
        return res.status(409).json({
          error: 'Account exists with email/password',
          details: 'Please sign in with your email and password instead',
          success: false
        });
      }

      // Create new user
      user = new User({
        googleId,
        email: userProfile.email,
        name: userProfile.name,
        picture: userProfile.picture,
        emailVerified: userProfile.emailVerified || userProfile.verified_email,
        authProvider: 'google',
        lastLogin: new Date()
      });
      await user.save();
    }

    // Generate JWT token (same format as existing endpoint)
    const token = jwt.sign(
      {
        userId: user._id,
        googleId: user.googleId,
        email: user.email,
        name: user.name,
        authProvider: 'google'
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return success response with JWT token as "credential" for compatibility
    res.json({
      success: true,
      token: token,  // Return as "token" to match frontend expectation
      credential: token,  // Keep "credential" for backward compatibility
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Google OAuth code exchange error:', error);
    res.status(400).json({
      success: false,
      error: 'OAuth code exchange failed',
      message: error.message
    });
  }
});

// Logout endpoint (mainly for token invalidation on client side)
router.post('/logout', (req, res) => {
  // In a production app, you might want to maintain a blacklist of tokens
  res.json({ success: true, message: 'Logged out successfully' });
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    // Verify the existing token (even if expired)
    const decoded = jwt.decode(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get user from MongoDB
    const user = await User.findByGoogleId(decoded.userId) || await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Generate new token
    const newToken = jwt.sign(
      {
        userId: user._id,
        googleId: user.googleId,
        email: user.email,
        name: user.name,
        authProvider: user.authProvider
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token: newToken,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ error: 'Token refresh failed' });
  }
});

export default router;
