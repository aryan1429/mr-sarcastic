import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// GET /api/songs - Get all songs with pagination
router.get('/', async (req, res) => {
    try {
        const songsPath = path.join(process.cwd(), 'data', 'songs.json');
        const songsData = fs.readFileSync(songsPath, 'utf8');
        const allSongs = JSON.parse(songsData);
        
        // Pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        
        // Apply search and mood filters if provided
        let filteredSongs = allSongs;
        
        // Search filter
        if (req.query.search) {
            const searchTerm = req.query.search.toLowerCase();
            filteredSongs = filteredSongs.filter(song => 
                song.title.toLowerCase().includes(searchTerm) ||
                song.artist.toLowerCase().includes(searchTerm)
            );
        }
        
        // Mood filter
        if (req.query.mood && req.query.mood !== 'All') {
            filteredSongs = filteredSongs.filter(song => 
                song.mood.toLowerCase() === req.query.mood.toLowerCase()
            );
        }
        
        // Calculate pagination info
        const totalSongs = filteredSongs.length;
        const totalPages = Math.ceil(totalSongs / limit);
        const paginatedSongs = filteredSongs.slice(offset, offset + limit);
        
        res.json({
            success: true,
            data: paginatedSongs,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalSongs: totalSongs,
                songsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
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