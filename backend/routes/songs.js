import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Helper to load songs data
const loadSongs = () => {
    const songsPath = path.join(process.cwd(), 'data', 'songs.json');
    const songsData = fs.readFileSync(songsPath, 'utf8');
    return JSON.parse(songsData);
};

// GET /api/songs - Get all songs with pagination
router.get('/', async (req, res) => {
    try {
        const allSongs = loadSongs();
        
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

// GET /api/songs/mood/:mood - Get songs filtered by mood
router.get('/mood/:mood', async (req, res) => {
    try {
        const allSongs = loadSongs();
        const mood = req.params.mood.toLowerCase();
        const limit = parseInt(req.query.limit) || 10;
        
        const filtered = allSongs.filter(song => 
            song.mood.toLowerCase() === mood
        ).slice(0, limit);
        
        res.json({
            success: true,
            data: filtered,
            count: filtered.length,
            mood: req.params.mood
        });
    } catch (error) {
        console.error('Error loading songs by mood:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load songs by mood'
        });
    }
});

// GET /api/songs/search - Search songs
router.get('/search', async (req, res) => {
    try {
        const allSongs = loadSongs();
        const query = (req.query.q || '').toLowerCase();
        const mood = req.query.mood;
        const limit = parseInt(req.query.limit) || 20;
        
        let results = allSongs.filter(song =>
            song.title.toLowerCase().includes(query) ||
            song.artist.toLowerCase().includes(query)
        );
        
        if (mood && mood !== 'All') {
            results = results.filter(song => 
                song.mood.toLowerCase() === mood.toLowerCase()
            );
        }
        
        res.json({
            success: true,
            data: results.slice(0, limit),
            count: results.length,
            query: req.query.q
        });
    } catch (error) {
        console.error('Error searching songs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search songs'
        });
    }
});

// GET /api/songs/random - Get random songs for auto-playlist
router.get('/random', async (req, res) => {
    try {
        const allSongs = loadSongs();
        const count = Math.min(parseInt(req.query.count) || 5, 30);
        const mood = req.query.mood;
        
        let pool = allSongs;
        if (mood && mood !== 'All') {
            pool = pool.filter(song => 
                song.mood.toLowerCase() === mood.toLowerCase()
            );
        }
        
        // Fisher-Yates shuffle
        const shuffled = [...pool];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        res.json({
            success: true,
            data: shuffled.slice(0, count),
            count: Math.min(count, shuffled.length)
        });
    } catch (error) {
        console.error('Error getting random songs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get random songs'
        });
    }
});

// GET /api/songs/:id - Get a single song by ID
router.get('/:id', async (req, res) => {
    try {
        const allSongs = loadSongs();
        const song = allSongs.find(s => s.id === req.params.id);
        
        if (!song) {
            return res.status(404).json({
                success: false,
                message: 'Song not found'
            });
        }
        
        res.json({
            success: true,
            data: song
        });
    } catch (error) {
        console.error('Error loading song:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load song'
        });
    }
});

export default router;