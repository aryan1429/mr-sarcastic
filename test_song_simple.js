const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// Mock the songs data loading
function loadSongs() {
    try {
        const songsPath = path.join(__dirname, 'backend', 'data', 'songs.json');
        const songsData = fs.readFileSync(songsPath, 'utf8');
        return JSON.parse(songsData);
    } catch (error) {
        console.error('Error loading songs:', error);
        return [];
    }
}

function getSongsByMood(songs, mood, limit = 1) {
    const moodMapping = {
        'sad': ['Sad'],
        'happy': ['Happy'],
        'angry': ['Angry'], 
        'bored': ['Chill', 'Relaxed'],
        'sarcastic': ['Energetic', 'Happy'],
        'energetic': ['Energetic'],
        'chill': ['Chill', 'Relaxed'],
        'focus': ['Focus'],
        'relaxed': ['Relaxed']
    };

    const targetMoods = moodMapping[mood.toLowerCase()] || ['Happy', 'Energetic'];
    
    const matchingSongs = songs.filter(song => 
        targetMoods.includes(song.mood)
    );

    const shuffled = matchingSongs.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit);
}

function formatSongRecommendations(songs, mood) {
    if (!songs || songs.length === 0) {
        return {
            text: "I'd suggest some songs, but seems like my playlist is taking a break. Maybe try humming your own tune?",
            songData: null
        };
    }

    const song = songs[0];
    
    const recommendation = `Oh, you want music recommendations? How original! Let me consult my superior taste in music... I see you're feeling a bit down, so here's a song that might resonate with your soul (or make you cry more, your choice):

**${song.title}** by ${song.artist}
Duration: ${song.duration} | Mood: ${song.mood}

This is straight from our Songs page playlist - only the finest curated track for your sophisticated taste! 🎵`;
    
    return {
        text: recommendation,
        songData: {
            id: song.id,
            title: song.title,
            artist: song.artist,
            mood: song.mood,
            duration: song.duration,
            youtubeUrl: song.youtubeUrl,
            thumbnail: song.thumbnail
        }
    };
}

app.post('/test-song', (req, res) => {
    try {
        const songs = loadSongs();
        console.log(`Loaded ${songs.length} songs`);
        
        const sadSongs = getSongsByMood(songs, 'sad', 1);
        console.log(`Found ${sadSongs.length} sad songs`);
        
        if (sadSongs.length > 0) {
            console.log('Sample sad song:', sadSongs[0]);
        }
        
        const result = formatSongRecommendations(sadSongs, 'sad');
        console.log('Formatted result:', JSON.stringify(result, null, 2));
        
        res.json({
            success: true,
            totalSongs: songs.length,
            sadSongs: sadSongs.length,
            result: result
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(3002, () => {
    console.log('Test server running on port 3002');
    console.log('Test with: curl -X POST http://localhost:3002/test-song -H "Content-Type: application/json"');
});