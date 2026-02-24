import { useState, useEffect, useCallback, useRef, memo, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Play, Pause, Heart, ExternalLink, Search, X, Loader2, RefreshCw, ChevronLeft, ChevronRight, ListPlus, Shuffle, Music } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { songsService, type Song } from "@/services/songsService";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import PageTransition from "@/components/PageTransition";
import { SongsGridSkeleton } from "@/components/ui/skeleton";
import { useMusicPlayer } from "@/context/MusicPlayerContext";

const Songs = () => {
  const [activeTab, setActiveTab] = useState<'library' | 'favorites'>('library');
  const [selectedMood, setSelectedMood] = useState("All");
  const [searchInput, setSearchInput] = useState(""); // controlled input value
  const [searchTerm, setSearchTerm] = useState("");   // debounced — triggers API
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [highlightedSongId, setHighlightedSongId] = useState<string | null>(null);
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const songRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const { playSong, addToQueue, toggleFavorite, isFavorite, currentSong, isPlaying, togglePlay, setQueue, favorites } = useMusicPlayer();

  const moods = [
    { label: "All", emoji: "🎵" },
    { label: "Chill", emoji: "😌" },
    { label: "Energetic", emoji: "⚡" },
    { label: "Focus", emoji: "🎯" },
    { label: "Happy", emoji: "😊" },
    { label: "Sad", emoji: "😢" },
    { label: "Angry", emoji: "🔥" },
    { label: "Relaxed", emoji: "🍃" },
  ];
  const songsPerPage = 20;

  // Debounce searchInput → searchTerm so the API only fires after typing stops
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

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

  // Handle search — only update the input display value; debounce handles searchTerm
  const handleSearchChange = (search: string) => {
    setSearchInput(search);
    setCurrentPage(1);
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

  const handlePlaySong = (song: Song) => {
    playSong(song, songs);
  };

  const handlePlayAll = () => {
    if (songs.length > 0) {
      setQueue(songs, 0);
      toast({ title: `▶️ Playing ${songs.length} songs`, description: "Enjoy the music!" });
    }
  };

  const handleShuffleAll = () => {
    if (songs.length > 0) {
      const shuffled = [...songs].sort(() => Math.random() - 0.5);
      setQueue(shuffled, 0);
      toast({ title: "🔀 Shuffle play", description: `Playing ${songs.length} songs in random order` });
    }
  };

  const handleAddToQueue = (song: Song, e: React.MouseEvent) => {
    e.stopPropagation();
    addToQueue(song);
    toast({ title: "➕ Added to queue", description: `${song.title} by ${song.artist}` });
  };

  const isCurrentlyPlaying = (song: Song) => {
    return currentSong?.id === song.id && isPlaying;
  };

  // Get favorite songs from loaded songs
  const favoriteSongs = songs.filter(s => favorites.includes(s.id));

  // Render a song card (shared between library and favorites)
  const renderSongCard = (song: Song, index: number) => (
    <Card
      key={song.id}
      ref={(el) => (songRefs.current[song.id] = el)}
      className={`group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-primary/20 hover:border-primary/40 ${highlightedSongId === song.id ? 'ring-2 ring-primary ring-offset-2 bg-primary/5 animate-pulse-glow' : ''
        }`}
      style={{
        animation: `slideUp 0.4s ease-out ${Math.min(index * 0.05, 0.5)}s both`,
      }}
    >
      <div className="p-3 sm:p-4">
        <div className="aspect-video bg-muted rounded-lg mb-3 sm:mb-4 relative overflow-hidden">
          <img
            src={song.thumbnail}
            alt={song.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://i.ytimg.com/vi/${extractVideoId(song.youtubeUrl)}/hqdefault.jpg`;
            }}
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[2px] gap-2">
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full scale-75 group-hover:scale-100 transition-transform duration-300 shadow-lg"
              onClick={() => handlePlaySong(song)}
            >
              {isCurrentlyPlaying(song) ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full scale-75 group-hover:scale-100 transition-transform duration-300 shadow-lg h-8 w-8"
              onClick={(e) => handleAddToQueue(song, e)}
              title="Add to queue"
            >
              <ListPlus className="w-3.5 h-3.5" />
            </Button>
          </div>
          {isCurrentlyPlaying(song) && (
            <div className="absolute bottom-2 left-2">
              <div className="flex items-end gap-[2px] h-4 bg-black/60 rounded px-1.5 py-0.5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-[2px] bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.6s", height: `${4 + Math.random() * 8}px` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate" title={song.title}>{song.title}</h3>
              <p className="text-xs text-muted-foreground" title={song.artist}>{song.artist}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className={`shrink-0 h-8 w-8 transition-colors duration-200 ${isFavorite(song.id) ? 'text-red-500' : 'hover:text-red-500'}`}
              onClick={() => toggleFavorite(song.id)}
            >
              <Heart className={`w-3 h-3 ${isFavorite(song.id) ? 'fill-red-500' : ''}`} />
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
              onClick={() => isCurrentlyPlaying(song) ? togglePlay() : handlePlaySong(song)}
            >
              {isCurrentlyPlaying(song) ? (
                <><Pause className="w-3 h-3 mr-1" /> Pause</>
              ) : (
                <><Play className="w-3 h-3 mr-1" /> Play</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <div className="space-y-3">
                <h2 className="text-xl font-semibold gradient-text animate-pulse">Loading Your Playlist...</h2>
                <p className="text-muted-foreground text-sm">Preparing 698 curated tracks ✨</p>
              </div>
            </div>
            <SongsGridSkeleton />
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
                <Music className="w-8 h-8 mx-auto" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Oops! Couldn't Load Songs</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={loadSongs} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
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
      <PageTransition>
        <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-3 sm:mb-4">Mood-Based Music</h1>
              <p className="text-base sm:text-lg text-muted-foreground mb-2">
                Let Mr Sarcastic set the vibe — curated tracks for every mood 🎧
              </p>
              {pagination && (
                <p className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * songsPerPage) + 1} - {Math.min(currentPage * songsPerPage, pagination.totalSongs)} of {pagination.totalSongs} songs
                  {selectedMood !== "All" && ` (filtered by ${selectedMood})`}
                  {searchTerm && ` (search: "${searchTerm}")`}
                </p>
              )}
              <div className="flex justify-center gap-2 mt-3">
                <Button size="sm" onClick={handlePlayAll} disabled={songs.length === 0}>
                  <Play className="w-3.5 h-3.5 mr-1.5" />
                  Play All
                </Button>
                <Button size="sm" variant="outline" onClick={handleShuffleAll} disabled={songs.length === 0}>
                  <Shuffle className="w-3.5 h-3.5 mr-1.5" />
                  Shuffle All
                </Button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex rounded-lg border border-border p-1 bg-muted/30">
                <button
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'library' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={() => setActiveTab('library')}
                >
                  <Music className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                  Library ({pagination?.totalSongs || songs.length})
                </button>
                <button
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'favorites' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={() => setActiveTab('favorites')}
                >
                  <Heart className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                  Favorites ({favorites.length})
                </button>
              </div>
            </div>

            {activeTab === 'library' ? (
              <>
                {/* Search and Filters */}
                <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
                  <div className="relative max-w-md mx-auto">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search songs or artists..."
                      value={searchInput}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-10 h-11 text-base touch-manipulation"
                    />
                  </div>

                  <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
                    {moods.map(({ label, emoji }) => (
                      <Button
                        key={label}
                        variant={selectedMood === label ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleMoodChange(label)}
                        className="text-xs touch-manipulation h-9"
                      >
                        {emoji} {label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Songs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {songs.map((song, index) => renderSongCard(song, index))}
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
              </>
            ) : (
              /* Favorites Tab */
              <div>
                {favoriteSongs.length === 0 ? (
                  <div className="text-center py-16">
                    <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                    <h3 className="text-lg font-semibold mb-2">No Favorites Yet</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Click the heart icon on any song to add it to your favorites
                    </p>
                    <Button variant="outline" onClick={() => setActiveTab('library')}>
                      Browse Library
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-center gap-2 mb-6">
                      <Button size="sm" onClick={() => { if (favoriteSongs.length > 0) { setQueue(favoriteSongs, 0); toast({ title: `Playing ${favoriteSongs.length} favorites` }); } }}>
                        <Play className="w-3.5 h-3.5 mr-1.5" />
                        Play Favorites
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { if (favoriteSongs.length > 0) { const shuffled = [...favoriteSongs].sort(() => Math.random() - 0.5); setQueue(shuffled, 0); toast({ title: "Shuffle favorites" }); } }}>
                        <Shuffle className="w-3.5 h-3.5 mr-1.5" />
                        Shuffle Favorites
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {favoriteSongs.map((song, index) => renderSongCard(song, index))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Bottom spacer for MiniPlayer */}
          <div className="h-24" />
        </main>
      </PageTransition>
      <Footer />
    </div >
  );
};

export default Songs;