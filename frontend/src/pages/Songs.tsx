import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play, Heart, ExternalLink, Search, Pause, X } from "lucide-react";
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
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  const moods = ["All", "Chill", "Energetic", "Focus", "Happy", "Sad", "Angry", "Relaxed"];

  const extractVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const playVideo = (song: Song) => {
    setCurrentSong(song);
    setIsPlayerOpen(true);
  };

  const closePlayer = () => {
    setIsPlayerOpen(false);
    setCurrentSong(null);
  };

  // Songs from your actual YouTube playlist with exact matching titles
  const songs: Song[] = [
    {
      id: "1",
      title: "I Want It That Way",
      artist: "Backstreet Boys",
      mood: "Happy",
      duration: "3:30",
      youtubeUrl: "https://youtube.com/watch?v=LwkrXybZ1uo",
      thumbnail: "https://i.ytimg.com/vi/LwkrXybZ1uo/maxresdefault.jpg"
    },
    {
      id: "2",
      title: "Memory Reboot",
      artist: "VØJ & Narvent",
      mood: "Chill",
      duration: "3:34",
      youtubeUrl: "https://youtube.com/watch?v=EASIaOpeSTY",
      thumbnail: "https://i.ytimg.com/vi/EASIaOpeSTY/maxresdefault.jpg"
    },
    {
      id: "3",
      title: "Attention",
      artist: "Charlie Puth",
      mood: "Happy",
      duration: "3:59",
      youtubeUrl: "https://youtube.com/watch?v=vxUBYHz_q1I",
      thumbnail: "https://i.ytimg.com/vi/vxUBYHz_q1I/maxresdefault.jpg"
    },
    {
      id: "4",
      title: "Rather Be (feat. Jess Glynne)",
      artist: "Clean Bandit",
      mood: "Energetic",
      duration: "4:57",
      youtubeUrl: "https://youtube.com/watch?v=dHdMAdh4Xgc",
      thumbnail: "https://i.ytimg.com/vi/dHdMAdh4Xgc/maxresdefault.jpg"
    },
    {
      id: "5",
      title: "A Thousand Miles",
      artist: "Vanessa Carlton",
      mood: "Relaxed",
      duration: "5:16",
      youtubeUrl: "https://youtube.com/watch?v=PNoIn1WKiEc",
      thumbnail: "https://i.ytimg.com/vi/PNoIn1WKiEc/maxresdefault.jpg"
    },
    {
      id: "6",
      title: "Hall of Fame (feat. will.i.am)",
      artist: "The Script",
      mood: "Energetic",
      duration: "3:21",
      youtubeUrl: "https://youtube.com/watch?v=snx5qGUtVi8",
      thumbnail: "https://i.ytimg.com/vi/snx5qGUtVi8/maxresdefault.jpg"
    },
    {
      id: "7",
      title: "Yellow",
      artist: "Coldplay",
      mood: "Chill",
      duration: "3:37",
      youtubeUrl: "https://youtube.com/watch?v=9qnqYL0eNNI",
      thumbnail: "https://i.ytimg.com/vi/9qnqYL0eNNI/maxresdefault.jpg"
    },
    {
      id: "8",
      title: "In the End",
      artist: "Linkin Park",
      mood: "Angry",
      duration: "3:49",
      youtubeUrl: "https://youtube.com/watch?v=BLZWkjBXfN8",
      thumbnail: "https://i.ytimg.com/vi/BLZWkjBXfN8/maxresdefault.jpg"
    },
    {
      id: "9",
      title: "Call Me Maybe",
      artist: "Carly Rae Jepsen",
      mood: "Happy",
      duration: "2:46",
      youtubeUrl: "https://youtube.com/watch?v=dlObDivWgx8",
      thumbnail: "https://i.ytimg.com/vi/dlObDivWgx8/maxresdefault.jpg"
    },
    {
      id: "10",
      title: "Treasure",
      artist: "Bruno Mars",
      mood: "Energetic",
      duration: "4:34",
      youtubeUrl: "https://youtube.com/watch?v=cy6Arnjp-hQ",
      thumbnail: "https://i.ytimg.com/vi/cy6Arnjp-hQ/maxresdefault.jpg"
    },
    {
      id: "11",
      title: "Skyfall",
      artist: "Adele",
      mood: "Sad",
      duration: "4:47",
      youtubeUrl: "https://youtube.com/watch?v=LJzp_mDxaT0",
      thumbnail: "https://i.ytimg.com/vi/LJzp_mDxaT0/maxresdefault.jpg"
    },
    {
      id: "12",
      title: "Lose Yourself",
      artist: "Eminem",
      mood: "Focus",
      duration: "5:23",
      youtubeUrl: "https://youtube.com/watch?v=4wOLVrGHiIU",
      thumbnail: "https://i.ytimg.com/vi/4wOLVrGHiIU/maxresdefault.jpg"
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
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://i.ytimg.com/vi/${extractVideoId(song.youtubeUrl)}/hqdefault.jpg`;
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button 
                        size="icon" 
                        variant="secondary" 
                        className="rounded-full"
                        onClick={() => playVideo(song)}
                      >
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
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => playVideo(song)}
                      >
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

        {/* YouTube Player Modal */}
        <Dialog open={isPlayerOpen} onOpenChange={setIsPlayerOpen}>
          <DialogContent className="max-w-4xl w-full">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-xl">
                    {currentSong?.title}
                  </DialogTitle>
                  <p className="text-muted-foreground">
                    by {currentSong?.artist}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{currentSong?.mood}</Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={closePlayer}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </DialogHeader>
            
            {currentSong && (
              <div className="aspect-video w-full">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${extractVideoId(currentSong.youtubeUrl)}?autoplay=1&rel=0`}
                  title={currentSong.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-lg"
                ></iframe>
              </div>
            )}
            
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" asChild>
                  <a 
                    href={currentSong?.youtubeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Open in YouTube
                  </a>
                </Button>
                <Button variant="outline" size="sm">
                  <Heart className="w-3 h-3 mr-1" />
                  Add to Favorites
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                Duration: {currentSong?.duration}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
};

export default Songs;