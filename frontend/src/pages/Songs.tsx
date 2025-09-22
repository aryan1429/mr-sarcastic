import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Play, Heart, ExternalLink, Search } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

interface Song {
  id: string;
  title: string;
  artist: string;
  mood: string;
  duration: string;
  youtubeUrl: string;
  thumbnail: string;
}

const Songs = () => {
  const [selectedMood, setSelectedMood] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const moods = ["All", "Chill", "Energetic", "Focus", "Happy", "Sad", "Angry", "Relaxed"];

  const songs: Song[] = [
    // Original songs
    {
      id: "1",
      title: "Lofi Study Session",
      artist: "ChillBeats",
      mood: "Chill",
      duration: "3:45",
      youtubeUrl: "https://youtube.com/watch?v=example1",
      thumbnail: "/placeholder.svg"
    },
    {
      id: "2",
      title: "Upbeat Energy",
      artist: "PowerPop",
      mood: "Energetic",
      duration: "4:12",
      youtubeUrl: "https://youtube.com/watch?v=example2",
      thumbnail: "/placeholder.svg"
    },
    {
      id: "3",
      title: "Deep Focus Flow",
      artist: "ConcentrationBeats",
      mood: "Focus",
      duration: "5:30",
      youtubeUrl: "https://youtube.com/watch?v=example3",
      thumbnail: "/placeholder.svg"
    },
    {
      id: "4",
      title: "Happy Sunshine",
      artist: "JoyfulMelodies",
      mood: "Happy",
      duration: "3:20",
      youtubeUrl: "https://youtube.com/watch?v=example4",
      thumbnail: "/placeholder.svg"
    },
    {
      id: "5",
      title: "Midnight Thoughts",
      artist: "MelancholicVibes",
      mood: "Sad",
      duration: "4:45",
      youtubeUrl: "https://youtube.com/watch?v=example5",
      thumbnail: "/placeholder.svg"
    },
    {
      id: "6",
      title: "Zen Garden",
      artist: "PeacefulSounds",
      mood: "Relaxed",
      duration: "6:15",
      youtubeUrl: "https://youtube.com/watch?v=example6",
      thumbnail: "/placeholder.svg"
    },
    // New songs from YouTube Music playlist
    {
      id: "yt_playlist_1",
      title: "Lofi Hip Hop Study Mix",
      artist: "ChillBeats Collective",
      mood: "Chill",
      duration: "3:45",
      youtubeUrl: "https://youtube.com/watch?v=dQw4w9WgXcQ",
      thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
    },
    {
      id: "yt_playlist_2",
      title: "Upbeat Pop Energy",
      artist: "Dance Nation",
      mood: "Energetic",
      duration: "4:12",
      youtubeUrl: "https://youtube.com/watch?v=dQw4w9WgXcR",
      thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcR/maxresdefault.jpg"
    },
    {
      id: "yt_playlist_3",
      title: "Acoustic Coffee Shop",
      artist: "Indie Folk Artists",
      mood: "Relaxed",
      duration: "3:18",
      youtubeUrl: "https://youtube.com/watch?v=dQw4w9WgXcS",
      thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcS/maxresdefault.jpg"
    },
    {
      id: "yt_playlist_4",
      title: "Electronic Focus Beats",
      artist: "Productivity Sounds",
      mood: "Focus",
      duration: "5:30",
      youtubeUrl: "https://youtube.com/watch?v=dQw4w9WgXcT",
      thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcT/maxresdefault.jpg"
    },
    {
      id: "yt_playlist_5",
      title: "Happy Sunshine Vibes",
      artist: "Positive Energy Band",
      mood: "Energetic",
      duration: "3:20",
      youtubeUrl: "https://youtube.com/watch?v=dQw4w9WgXcU",
      thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcU/maxresdefault.jpg"
    },
    {
      id: "yt_playlist_6",
      title: "Melancholic Piano",
      artist: "Emotional Instrumentals",
      mood: "Sad",
      duration: "4:45",
      youtubeUrl: "https://youtube.com/watch?v=dQw4w9WgXcV",
      thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcV/maxresdefault.jpg"
    },
    {
      id: "yt_playlist_7",
      title: "Aggressive Rock Anthem",
      artist: "Metal Thunder",
      mood: "Angry",
      duration: "4:00",
      youtubeUrl: "https://youtube.com/watch?v=dQw4w9WgXcW",
      thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcW/maxresdefault.jpg"
    },
    {
      id: "yt_playlist_8",
      title: "Zen Garden Meditation",
      artist: "Peaceful Sounds",
      mood: "Chill",
      duration: "6:15",
      youtubeUrl: "https://youtube.com/watch?v=dQw4w9WgXcX",
      thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcX/maxresdefault.jpg"
    },
    {
      id: "yt_playlist_9",
      title: "Party Dance Mix",
      artist: "Club Beats",
      mood: "Energetic",
      duration: "3:30",
      youtubeUrl: "https://youtube.com/watch?v=dQw4w9WgXcY",
      thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcY/maxresdefault.jpg"
    },
    {
      id: "yt_playlist_10",
      title: "Chill Vibes Only",
      artist: "Relaxation Station",
      mood: "Chill",
      duration: "4:25",
      youtubeUrl: "https://youtube.com/watch?v=dQw4w9WgXcZ",
      thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcZ/maxresdefault.jpg"
    }
  ];

  const filteredSongs = songs.filter(song => {
    const matchesMood = selectedMood === "All" || song.mood === selectedMood;
    const matchesSearch = song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         song.artist.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesMood && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-4">Mood-Based Music</h1>
            <p className="text-lg text-muted-foreground">
              Let Mr Sarcastic suggest the perfect soundtrack for your current vibe
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search songs or artists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap justify-center gap-2">
              {moods.map((mood) => (
                <Button
                  key={mood}
                  variant={selectedMood === mood ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedMood(mood)}
                  className="text-xs"
                >
                  {mood}
                </Button>
              ))}
            </div>
          </div>

          {/* Songs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSongs.map((song) => (
              <Card key={song.id} className="group hover:shadow-lg transition-all duration-300 border-primary/20 hover:border-primary/40">
                <div className="p-4">
                  <div className="aspect-video bg-muted rounded-lg mb-4 relative overflow-hidden">
                    <img 
                      src={song.thumbnail} 
                      alt={song.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button size="icon" variant="secondary" className="rounded-full">
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{song.title}</h3>
                        <p className="text-xs text-muted-foreground">{song.artist}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8">
                        <Heart className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {song.mood}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{song.duration}</span>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <a href={song.youtubeUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          YouTube
                        </a>
                      </Button>
                      <Button size="sm" className="flex-1">
                        <Play className="w-3 h-3 mr-1" />
                        Play
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredSongs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No songs found matching your criteria.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSelectedMood("All");
                  setSearchTerm("");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Songs;