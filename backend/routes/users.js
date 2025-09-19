import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import User from '../models/User.js';
import File from '../models/File.js';
import fs from 'fs/promises';
import path from 'path';

const router = express.Router();

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByGoogleId(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

// Update user profile
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const { name, preferences } = req.body;

    const user = await User.findByGoogleId(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user data
    if (name) user.name = name;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    await user.save();

    res.json({
      success: true,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user data' });
  }
});

// Delete user account
router.delete('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByGoogleId(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete all user files from database and disk
    const userFiles = await File.findByUserId(req.user.userId);
    for (const file of userFiles) {
      try {
        await fs.unlink(file.path);
      } catch (diskError) {
        console.warn('Failed to delete file from disk:', diskError);
      }
      await file.deleteOne();
    }

    // Delete user from database
    await user.deleteOne();

    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;
