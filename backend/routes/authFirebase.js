import express from 'express';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import firebaseAdmin from '../services/firebaseAdmin.js';
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

// Initialize Firebase Admin
firebaseAdmin.initialize();

// Firebase Authentication
router.post('/firebase', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ 
        error: 'Firebase ID token is required',
        success: false 
      });
    }

    console.log('Verifying Firebase ID token...');

    // Verify Firebase ID token
    const firebaseUser = await firebaseAdmin.verifyIdToken(idToken);
    
    console.log('Firebase user verified:', { 
      uid: firebaseUser.uid, 
      email: firebaseUser.email,
      provider: firebaseUser.firebase?.sign_in_provider 
    });

    // Create or update user in our database
    let user = await User.findByFirebaseUID(firebaseUser.uid);

    if (user) {
      // Update existing user
      user.email = firebaseUser.email;
      user.name = firebaseUser.name || firebaseUser.displayName;
      user.picture = firebaseUser.picture || firebaseUser.photoURL;
      user.emailVerified = firebaseUser.emailVerified;
      user.lastLogin = new Date();
      await user.save();
      console.log('Updated existing user');
    } else {
      // Check if email already exists with different auth provider
      const existingEmailUser = await User.findByEmail(firebaseUser.email);
      if (existingEmailUser && existingEmailUser.authProvider === 'email') {
        return res.status(409).json({
          error: 'Account exists with email/password',
          details: 'Please sign in with your email and password instead',
          success: false
        });
      }

      // Create new user
      user = new User({
        firebaseUID: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.name || firebaseUser.displayName,
        picture: firebaseUser.picture || firebaseUser.photoURL,
        emailVerified: firebaseUser.emailVerified,
        authProvider: firebaseUser.firebase?.sign_in_provider || 'firebase',
        lastLogin: new Date()
      });
      await user.save();
      console.log('Created new user');
    }

    // Generate our own JWT token for session management
    const token = jwt.sign(
      {
        userId: user._id,
        firebaseUID: user.firebaseUID,
        email: user.email,
        name: user.name,
        authProvider: user.authProvider
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
    console.error('Firebase auth error:', error);
    res.status(400).json({
      error: 'Firebase authentication failed',
      message: error.message,
      success: false
    });
  }
});

// Email/Password Registration (kept for backward compatibility)
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

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ 
        error: 'User already exists',
        details: 'An account with this email already exists'
      });
    }

    const existingUsername = await User.findByUsername(username);
    if (existingUsername) {
      return res.status(409).json({ 
        error: 'Username already taken',
        details: 'Please choose a different username'
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      emailVerified: false,
      authProvider: 'email',
      lastLogin: new Date()
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        email: user.email,
        authProvider: 'email'
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      error: 'Registration failed',
      message: error.message
    });
  }
});

// Email/Password Login (kept for backward compatibility) 
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user || user.authProvider !== 'email') {
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        email: user.email,
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
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({
      error: 'Login failed',
      message: error.message
    });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

export default router;