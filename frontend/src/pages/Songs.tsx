import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play, Heart, ExternalLink, Search, X, Loader2, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { songsService, type Song } from "@/services/songsService";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";

const Songs = () => {
  const [selectedMood, setSelectedMood] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [highlightedSongId, setHighlightedSongId] = useState<string | null>(null);
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const songRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const moods = ["All", "Chill", "Energetic", "Focus", "Happy", "Sad", "Angry", "Relaxed"];
  const songsPerPage = 20;

  // Load songs from API
  useEffect(() => {
    loadSongs();
  }, [currentPage, selectedMood, searchTerm]);

  // Handle songId from URL parameters
  useEffect(() => {
    const songId = searchParams.get('songId');
    if (songId) {
      setHighlightedSongId(songId);
      // Clear the search params after handling
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('songId');
      setSearchParams(newSearchParams, { replace: true });
      
      // Scroll to song when songs are loaded
      setTimeout(() => {
        const songElement = songRefs.current[songId];
        if (songElement) {
          songElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Remove highlight after 3 seconds
          setTimeout(() => setHighlightedSongId(null), 3000);
        }
      }, 500);
    }
  }, [searchParams, setSearchParams, songs]);

  const loadSongs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await songsService.getAllSongs(currentPage, songsPerPage, searchTerm || undefined, selectedMood);
      setSongs(result.songs);
      setPagination(result.pagination);
      console.log(`✅ Loaded ${result.songs.length} songs from backend (Page ${currentPage})`);
    } catch (err) {
      console.error('Failed to load songs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load songs');
      toast({
        title: "Error loading songs",
        description: "Failed to load the song library. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedMood, searchTerm, toast]);

  // Handle mood change
  const handleMoodChange = (mood: string) => {
    setSelectedMood(mood);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Handle search
  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Loading Songs...</h2>
              <p className="text-muted-foreground">Fetching the latest tracks from our playlist</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-12">
              <div className="text-destructive mb-4">
                <X className="w-8 h-8 mx-auto" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Failed to Load Songs</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={loadSongs} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-4">Mood-Based Music</h1>
            <p className="text-lg text-muted-foreground mb-2">
              Let Mr Sarcastic suggest the perfect soundtrack for your current vibe
            </p>
            {pagination && (
              <p className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * songsPerPage) + 1} - {Math.min(currentPage * songsPerPage, pagination.totalSongs)} of {pagination.totalSongs} songs
                {selectedMood !== "All" && ` (filtered by ${selectedMood})`}
                {searchTerm && ` (search: "${searchTerm}")`}
              </p>
            )}
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search songs or artists..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap justify-center gap-2">
              {moods.map((mood) => (
                <Button
                  key={mood}
                  variant={selectedMood === mood ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleMoodChange(mood)}
                  className="text-xs"
                >
                  {mood}
                </Button>
              ))}
            </div>
          </div>

          {/* Songs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {songs.map((song) => (
              <Card 
                key={song.id} 
                ref={(el) => (songRefs.current[song.id] = el)}
                className={`group hover:shadow-lg transition-all duration-300 border-primary/20 hover:border-primary/40 ${
                  highlightedSongId === song.id ? 'ring-2 ring-primary ring-offset-2 bg-primary/5' : ''
                }`}
              >
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
                        <h3 className="font-semibold text-sm truncate" title={song.title}>{song.title}</h3>
                        <p className="text-xs text-muted-foreground" title={song.artist}>{song.artist}</p>
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

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8 space-y-4">
              <div className="text-center text-sm text-muted-foreground">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
              
              <div className="flex justify-center items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPreviousPage}
                  className="flex items-center"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                
                <div className="flex items-center space-x-1">
                  {/* Show page numbers */}
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(pagination.totalPages - 4, currentPage - 2)) + i;
                    if (pageNum > pagination.totalPages) return null;
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="min-w-[40px]"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  
                  {pagination.totalPages > 5 && currentPage < pagination.totalPages - 2 && (
                    <>
                      <span className="px-2 text-muted-foreground">...</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.totalPages)}
                        className="min-w-[40px]"
                      >
                        {pagination.totalPages}
                      </Button>
                    </>
                  )}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="flex items-center"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* No results message */}
          {songs.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchTerm || selectedMood !== "All" 
                  ? "No songs found matching your criteria." 
                  : "No songs available."}
              </p>
              {(searchTerm || selectedMood !== "All") && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    handleMoodChange("All");
                    handleSearchChange("");
                  }}
                >
                  Clear Filters
                </Button>
              )}
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
                  src={`https://www.youtube.com/embed/${extractVideoId(currentSong.youtubeUrl)}?autoplay=1`}
                  title={currentSong.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-lg"
                ></iframe>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-4 text-sm text-muted-foreground">
              <div>
                Artist: {currentSong?.artist}
              </div>
              <div>
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