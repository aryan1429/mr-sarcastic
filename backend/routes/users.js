import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth.js';
import User from '../models/User.js';
import File from '../models/File.js';
import fs from 'fs/promises';
import path from 'path';
import googleStorage from '../services/googleStorage.js';

const router = express.Router();

// Helper function to find user by any identifier
const findUserByToken = async (userToken) => {
  const { userId, googleId, firebaseUID } = userToken;
  
  // Try finding by MongoDB ObjectId first
  if (userId) {
    const userById = await User.findById(userId);
    if (userById) return userById;
  }
  
  // Try finding by Google ID
  if (googleId) {
    const userByGoogle = await User.findByGoogleId(googleId);
    if (userByGoogle) return userByGoogle;
  }
  
  // Try finding by Firebase UID
  if (firebaseUID) {
    const userByFirebase = await User.findByFirebaseUID(firebaseUID);
    if (userByFirebase) return userByFirebase;
  }
  
  // Fallback: try finding by userId as Google ID (legacy compatibility)
  if (userId) {
    const userByLegacyGoogle = await User.findByGoogleId(userId);
    if (userByLegacyGoogle) return userByLegacyGoogle;
  }
  
  return null;
};

// Configure multer for memory storage (for profile picture uploads)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for profile pictures
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files for profile pictures
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for profile pictures'), false);
    }
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await findUserByToken(req.user);
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

    const user = await findUserByToken(req.user);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user data
    if (name !== undefined) user.name = name;
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

// Update profile picture
router.put('/me/picture', authenticateToken, upload.single('picture'), async (req, res) => {
  try {
    const user = await findUserByToken(req.user);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    let pictureUrl;

    try {
      // Try to upload to Google Cloud Storage
      const uploadResult = await googleStorage.uploadFile(
        {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          buffer: req.file.buffer,
          size: req.file.size
        },
        user._id.toString(),
        'profile-pictures'
      );
      
      pictureUrl = uploadResult.publicUrl;
      console.log('Profile picture uploaded to Google Cloud Storage:', pictureUrl);
    } catch (storageError) {
      console.warn('Google Cloud Storage upload failed, falling back to local storage:', storageError.message);
      
      // Fallback to local storage
      const uploadsDir = path.join(process.cwd(), 'uploads', 'profile-pictures');
      await fs.mkdir(uploadsDir, { recursive: true });
      
      const fileExtension = path.extname(req.file.originalname);
      const fileName = `${user._id}_${Date.now()}${fileExtension}`;
      const filePath = path.join(uploadsDir, fileName);
      
      await fs.writeFile(filePath, req.file.buffer);
      pictureUrl = `/uploads/profile-pictures/${fileName}`;
      
      console.log('Profile picture saved locally:', pictureUrl);
    }

    // Update user's picture URL
    user.picture = pictureUrl;
    await user.save();

    res.json({
      success: true,
      user: user.getPublicProfile(),
      message: 'Profile picture updated successfully'
    });
  } catch (error) {
    console.error('Update profile picture error:', error);
    res.status(500).json({ error: 'Failed to update profile picture' });
  }
});

// Delete user account
router.delete('/me', authenticateToken, async (req, res) => {
  try {
    const user = await findUserByToken(req.user);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete all user files from database and disk
    const userFiles = await File.findByUserId(user._id.toString());
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

// Serve profile pictures (for local storage fallback)
router.get('/picture/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(process.cwd(), 'uploads', 'profile-pictures', filename);
    
    // Check if file exists and serve it
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Failed to serve profile picture:', err);
        res.status(404).json({ error: 'Profile picture not found' });
      }
    });
  } catch (error) {
    console.error('Serve profile picture error:', error);
    res.status(500).json({ error: 'Failed to serve profile picture' });
  }
});

export default router;
