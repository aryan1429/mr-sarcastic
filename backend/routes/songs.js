import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// GET /api/songs - Get all songs
router.get('/', async (req, res) => {
    try {
        const songsPath = path.join(process.cwd(), 'data', 'songs.json');
        const songsData = fs.readFileSync(songsPath, 'utf8');
        const songs = JSON.parse(songsData);
        
        res.json({
            success: true,
            data: songs,
            count: songs.length
        });
    } catch (error) {
        console.error('Error loading songs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load songs',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

export default router;