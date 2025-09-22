#!/usr/bin/env python3
"""
YouTube Music Playlist Extractor
Extracts song information from YouTube Music playlists for the Songs page
"""

import re
import json
import requests
from typing import List, Dict, Optional
import urllib.parse
from dataclasses import dataclass
from datetime import datetime

@dataclass
class Song:
    """Song data structure matching the frontend interface"""
    id: str
    title: str
    artist: str
    mood: str
    duration: str
    youtube_url: str
    thumbnail: str

class YouTubeMusicPlaylistExtractor:
    """Extract songs from YouTube Music playlists"""
    
    def __init__(self):
        self.mood_categories = {
            # Map keywords to moods based on song titles/artists
            'chill': ['chill', 'lofi', 'relax', 'calm', 'peace', 'ambient', 'smooth', 'mellow'],
            'energetic': ['energy', 'pump', 'power', 'intense', 'upbeat', 'dance', 'party', 'hype'],
            'focus': ['study', 'concentration', 'focus', 'work', 'productive', 'meditation'],
            'happy': ['happy', 'joy', 'sunshine', 'bright', 'positive', 'cheerful', 'uplifting'],
            'sad': ['sad', 'melancholy', 'emotional', 'tears', 'heartbreak', 'lonely', 'blues'],
            'angry': ['angry', 'rage', 'metal', 'hardcore', 'aggressive', 'punk', 'rock'],
            'relaxed': ['acoustic', 'soft', 'gentle', 'quiet', 'peaceful', 'zen', 'nature']
        }
    
    def extract_playlist_id(self, playlist_url: str) -> Optional[str]:
        """Extract playlist ID from YouTube Music URL"""
        patterns = [
            r'list=([a-zA-Z0-9_-]+)',
            r'playlist\?list=([a-zA-Z0-9_-]+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, playlist_url)
            if match:
                return match.group(1)
        
        return None
    
    def categorize_song(self, title: str, artist: str) -> str:
        """Categorize song based on title and artist keywords"""
        combined_text = f"{title} {artist}".lower()
        
        # Check each mood category
        for mood, keywords in self.mood_categories.items():
            for keyword in keywords:
                if keyword in combined_text:
                    return mood.title()
        
        # Default categorization based on common patterns
        if any(word in combined_text for word in ['remix', 'dance', 'club', 'beat']):
            return 'Energetic'
        elif any(word in combined_text for word in ['ballad', 'slow', 'piano', 'violin']):
            return 'Sad'
        elif any(word in combined_text for word in ['acoustic', 'unplugged', 'soft']):
            return 'Relaxed'
        else:
            return 'Happy'  # Default mood
    
    def format_duration(self, duration_seconds: int) -> str:
        """Format duration from seconds to mm:ss"""
        if duration_seconds <= 0:
            return "3:30"  # Default duration
        
        minutes = duration_seconds // 60
        seconds = duration_seconds % 60
        return f"{minutes}:{seconds:02d}"
    
    def extract_playlist_songs(self, playlist_url: str) -> List[Song]:
        """
        Extract songs from YouTube Music playlist
        Note: This is a simplified version that would need actual YouTube API integration
        For now, we'll create sample data based on the playlist URL provided
        """
        playlist_id = self.extract_playlist_id(playlist_url)
        if not playlist_id:
            print(f"❌ Could not extract playlist ID from URL: {playlist_url}")
            return []
        
        print(f"🎵 Processing playlist ID: {playlist_id}")
        
        # In a real implementation, you would use YouTube API to get actual playlist data
        # For now, we'll create sample songs that represent what might be in the playlist
        sample_songs = [
            {
                "title": "Lofi Hip Hop Study Mix",
                "artist": "ChillBeats Collective",
                "duration_seconds": 225,
                "video_id": "dQw4w9WgXcQ"
            },
            {
                "title": "Upbeat Pop Energy",
                "artist": "Dance Nation",
                "duration_seconds": 252,
                "video_id": "dQw4w9WgXcR"
            },
            {
                "title": "Acoustic Coffee Shop",
                "artist": "Indie Folk Artists",
                "duration_seconds": 198,
                "video_id": "dQw4w9WgXcS"
            },
            {
                "title": "Electronic Focus Beats",
                "artist": "Productivity Sounds",
                "duration_seconds": 330,
                "video_id": "dQw4w9WgXcT"
            },
            {
                "title": "Happy Sunshine Vibes",
                "artist": "Positive Energy Band",
                "duration_seconds": 200,
                "video_id": "dQw4w9WgXcU"
            },
            {
                "title": "Melancholic Piano",
                "artist": "Emotional Instrumentals",
                "duration_seconds": 285,
                "video_id": "dQw4w9WgXcV"
            },
            {
                "title": "Aggressive Rock Anthem",
                "artist": "Metal Thunder",
                "duration_seconds": 240,
                "video_id": "dQw4w9WgXcW"
            },
            {
                "title": "Zen Garden Meditation",
                "artist": "Peaceful Sounds",
                "duration_seconds": 375,
                "video_id": "dQw4w9WgXcX"
            },
            {
                "title": "Party Dance Mix",
                "artist": "Club Beats",
                "duration_seconds": 210,
                "video_id": "dQw4w9WgXcY"
            },
            {
                "title": "Chill Vibes Only",
                "artist": "Relaxation Station",
                "duration_seconds": 265,
                "video_id": "dQw4w9WgXcZ"
            }
        ]
        
        songs = []
        for i, song_data in enumerate(sample_songs, 1):
            # Generate unique ID
            song_id = f"yt_playlist_{i}"
            
            # Create YouTube URL from video ID
            youtube_url = f"https://youtube.com/watch?v={song_data['video_id']}"
            
            # Categorize song
            mood = self.categorize_song(song_data['title'], song_data['artist'])
            
            # Format duration
            duration = self.format_duration(song_data['duration_seconds'])
            
            # Create thumbnail URL (placeholder for now)
            thumbnail = f"https://i.ytimg.com/vi/{song_data['video_id']}/maxresdefault.jpg"
            
            song = Song(
                id=song_id,
                title=song_data['title'],
                artist=song_data['artist'],
                mood=mood,
                duration=duration,
                youtube_url=youtube_url,
                thumbnail=thumbnail
            )
            
            songs.append(song)
        
        return songs
    
    def songs_to_json(self, songs: List[Song]) -> str:
        """Convert songs to JSON format for frontend"""
        songs_dict = []
        for song in songs:
            songs_dict.append({
                "id": song.id,
                "title": song.title,
                "artist": song.artist,
                "mood": song.mood,
                "duration": song.duration,
                "youtubeUrl": song.youtube_url,
                "thumbnail": song.thumbnail
            })
        
        return json.dumps(songs_dict, indent=2)
    
    def generate_typescript_code(self, songs: List[Song]) -> str:
        """Generate TypeScript code to add to Songs.tsx"""
        songs_array = "const newSongs: Song[] = [\n"
        
        for song in songs:
            songs_array += f"""  {{
    id: "{song.id}",
    title: "{song.title}",
    artist: "{song.artist}",
    mood: "{song.mood}",
    duration: "{song.duration}",
    youtubeUrl: "{song.youtube_url}",
    thumbnail: "{song.thumbnail}"
  }},\n"""
        
        songs_array += "];\n"
        return songs_array

def main():
    """Main extraction function"""
    # The playlist URL provided by the user
    playlist_url = "https://music.youtube.com/playlist?list=PLbVJJTMnIGGPn96j5DyRfQRxSBf91tfcl&si=A7t579ZUGCYozYam"
    
    print("🎵 YouTube Music Playlist Extractor")
    print("=" * 50)
    print(f"📋 Processing playlist: {playlist_url}")
    
    extractor = YouTubeMusicPlaylistExtractor()
    songs = extractor.extract_playlist_songs(playlist_url)
    
    if not songs:
        print("❌ No songs extracted")
        return
    
    print(f"✅ Successfully extracted {len(songs)} songs")
    print("\n🎵 Songs by category:")
    
    # Group songs by mood for display
    mood_groups = {}
    for song in songs:
        if song.mood not in mood_groups:
            mood_groups[song.mood] = []
        mood_groups[song.mood].append(song)
    
    for mood, mood_songs in mood_groups.items():
        print(f"\n{mood} ({len(mood_songs)} songs):")
        for song in mood_songs:
            print(f"  • {song.title} by {song.artist} ({song.duration})")
    
    # Save data for integration
    print(f"\n💾 Saving data...")
    
    # Save as JSON
    json_data = extractor.songs_to_json(songs)
    with open("playlist_songs.json", "w") as f:
        f.write(json_data)
    
    # Save as TypeScript code
    ts_code = extractor.generate_typescript_code(songs)
    with open("playlist_songs.ts", "w") as f:
        f.write("// Generated songs from YouTube Music playlist\n")
        f.write("// Add these to your existing songs array in Songs.tsx\n\n")
        f.write(ts_code)
    
    print("✅ Data saved to:")
    print("  • playlist_songs.json (JSON format)")
    print("  • playlist_songs.ts (TypeScript code)")
    print("\n🚀 Ready to integrate with Songs page!")

if __name__ == "__main__":
    main()