import express from 'express';
import jwt from 'jsonwebtoken';
import googleAuthService from '../services/googleAuth.js';
import User from '../models/User.js';

const router = express.Router();

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
      // Create new user
      user = new User({
        googleId,
        email: userProfile.email,
        name: userProfile.name,
        picture: userProfile.picture,
        emailVerified: userProfile.emailVerified || userProfile.verified_email,
        lastLogin: new Date()
      });
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.googleId,
        email: user.email,
        name: user.name
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
    const user = await User.findByGoogleId(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Generate new token
    const newToken = jwt.sign(
      {
        userId: user.googleId,
        email: user.email,
        name: user.name
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
