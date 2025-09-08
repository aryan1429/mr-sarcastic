import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { authenticateToken } from '../middleware/auth.js';
import File from '../models/File.js';
import User from '../models/User.js';

const router = express.Router();

// Ensure upload directory exists
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const ensureUploadDir = async (userId, folder = 'uploads') => {
  const userDir = path.join(UPLOAD_DIR, userId, folder);
  await fs.mkdir(userDir, { recursive: true });
  return userDir;
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const { folder = 'uploads' } = req.body;
      const userDir = await ensureUploadDir(req.user.userId, folder);
      cb(null, userDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and common file types
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'text/plain',
      'application/pdf',
      'application/json'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  }
});

// Upload file
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const { folder = 'uploads' } = req.body;

    // Create file record in database
    const fileRecord = new File({
      userId: req.user.userId,
      originalName: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      folder
    });

    await fileRecord.save();

    res.json({
      success: true,
      file: fileRecord.getFileInfo()
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: error.message
    });
  }
});

// Get user files
router.get('/files', authenticateToken, async (req, res) => {
  try {
    const { folder = 'uploads' } = req.query;

    const files = await File.findByUserId(req.user.userId, folder);

    res.json({
      success: true,
      files: files.map(file => file.getFileInfo())
    });
  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

// Get file by ID
router.get('/files/:fileId', authenticateToken, async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await File.findOne({ _id: fileId, userId: req.user.userId });
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json({
      success: true,
      file: file.getFileInfo()
    });
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({ error: 'Failed to get file' });
  }
});

// Download file
router.get('/files/:fileId/download', authenticateToken, async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await File.findOne({ _id: fileId, userId: req.user.userId });
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check if file exists on disk
    try {
      await fs.access(file.path);
    } catch {
      return res.status(404).json({ error: 'File not found on disk' });
    }

    res.download(file.path, file.originalName);
  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

// Delete file
router.delete('/files/:fileId', authenticateToken, async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await File.findOneAndDelete({ _id: fileId, userId: req.user.userId });
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Delete file from disk
    try {
      await fs.unlink(file.path);
    } catch (diskError) {
      console.warn('Failed to delete file from disk:', diskError);
      // Don't fail the request if disk deletion fails
    }

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Save custom user data
router.post('/data/:key', authenticateToken, async (req, res) => {
  try {
    const { key } = req.params;
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({ error: 'Data is required' });
    }

    // Update user data in database
    const updateData = {};
    updateData[`customData.${key}`] = data;

    await User.findOneAndUpdate(
      { userId: req.user.userId },
      { $set: updateData },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'Data saved successfully'
    });
  } catch (error) {
    console.error('Save data error:', error);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

// Get custom user data
router.get('/data/:key', authenticateToken, async (req, res) => {
  try {
    const { key } = req.params;

    const user = await User.findOne({ userId: req.user.userId });
    const data = user?.customData?.[key] || null;

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Get data error:', error);
    res.status(500).json({ error: 'Failed to get data' });
  }
});

// Get all custom user data
router.get('/data', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.userId });
    const data = user?.customData || {};

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Get all data error:', error);
    res.status(500).json({ error: 'Failed to get data' });
  }
});

export default router;
