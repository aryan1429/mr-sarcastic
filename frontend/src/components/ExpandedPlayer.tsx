import { memo, useState } from "react";
import { useMusicPlayer } from "@/context/MusicPlayerContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Volume1,
  Shuffle,
  Repeat,
  Repeat1,
  ChevronDown,
  Heart,
  ListMusic,
  Music,
  ExternalLink,
  Trash2,
  GripVertical,
} from "lucide-react";

const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

type TabView = "nowPlaying" | "queue";

const ExpandedPlayer = memo(() => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    queue,
    queueIndex,
    shuffle,
    repeat,
    isPlayerExpanded,
    togglePlay,
    playNext,
    playPrevious,
    seekTo,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    toggleFavorite,
    isFavorite,
    toggleExpanded,
    playSong,
    removeFromQueue,
  } = useMusicPlayer();

  const [activeTab, setActiveTab] = useState<TabView>("nowPlaying");

  if (!isPlayerExpanded || !currentSong) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const extractVideoId = (url: string): string | null => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const videoId = extractVideoId(currentSong.youtubeUrl);
  const thumbnailUrl = currentSong.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;

  const getRepeatIcon = () => {
    if (repeat === "one") return <Repeat1 className="w-4 h-4" />;
    return <Repeat className="w-4 h-4" />;
  };

  return (
    <div className="fixed inset-0 z-[60] bg-background/98 backdrop-blur-2xl flex flex-col animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border/50">
        <Button variant="ghost" size="icon" onClick={toggleExpanded} className="h-9 w-9">
          <ChevronDown className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-1">
          <Music className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Now Playing</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => window.open(currentSong.youtubeUrl, "_blank")}
        >
          <ExternalLink className="w-4 h-4" />
        </Button>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-border/50">
        <button
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "nowPlaying"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("nowPlaying")}
        >
          Now Playing
        </button>
        <button
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "queue"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("queue")}
        >
          Queue ({queue.length})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "nowPlaying" ? (
          <div className="h-full flex flex-col items-center justify-center px-6 sm:px-12 gap-6 sm:gap-8">
            {/* Album Art */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-2xl overflow-hidden shadow-2xl shadow-primary/20">
              <img
                src={thumbnailUrl}
                alt={currentSong.title}
                className={`w-full h-full object-cover transition-transform duration-700 ${
                  isPlaying ? "scale-105" : "scale-100"
                }`}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://i.ytimg.com/vi/${videoId}/default.jpg`;
                }}
              />
              {isPlaying && (
                <div className="absolute bottom-3 right-3">
                  <div className="flex items-end gap-[3px] h-5">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-[3px] bg-primary rounded-full animate-bounce"
                        style={{
                          animationDelay: `${i * 0.15}s`,
                          animationDuration: "0.6s",
                          height: `${8 + Math.random() * 12}px`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Song Info */}
            <div className="text-center max-w-md space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold truncate">{currentSong.title}</h2>
              <p className="text-muted-foreground">{currentSong.artist}</p>
              <Badge variant="secondary" className="mt-2">
                {currentSong.mood}
              </Badge>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-md space-y-2">
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={0.5}
                onValueChange={(v) => seekTo(v[0])}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 sm:gap-6">
              <Button
                variant="ghost"
                size="icon"
                className={`h-9 w-9 ${shuffle ? "text-primary" : "text-muted-foreground"}`}
                onClick={toggleShuffle}
              >
                <Shuffle className="w-4 h-4" />
              </Button>

              <Button variant="ghost" size="icon" className="h-10 w-10" onClick={playPrevious}>
                <SkipBack className="w-5 h-5" />
              </Button>

              <Button
                variant="default"
                size="icon"
                className="h-14 w-14 rounded-full shadow-lg shadow-primary/30"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-1" />
                )}
              </Button>

              <Button variant="ghost" size="icon" className="h-10 w-10" onClick={playNext}>
                <SkipForward className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className={`h-9 w-9 ${repeat !== "off" ? "text-primary" : "text-muted-foreground"}`}
                onClick={cycleRepeat}
              >
                {getRepeatIcon()}
              </Button>
            </div>

            {/* Volume + Favorite */}
            <div className="flex items-center gap-4 w-full max-w-md">
              <Button
                variant="ghost"
                size="icon"
                className={`h-9 w-9 ${isFavorite(currentSong.id) ? "text-red-500" : ""}`}
                onClick={() => toggleFavorite(currentSong.id)}
              >
                <Heart
                  className={`w-5 h-5 ${isFavorite(currentSong.id) ? "fill-red-500" : ""}`}
                />
              </Button>

              <div className="flex items-center gap-2 flex-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleMute}>
                  <VolumeIcon className="w-4 h-4" />
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={100}
                  step={1}
                  onValueChange={(v) => setVolume(v[0])}
                  className="flex-1"
                />
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setActiveTab("queue")}
              >
                <ListMusic className="w-5 h-5" />
              </Button>
            </div>
          </div>
        ) : (
          /* Queue View */
          <ScrollArea className="h-full">
            <div className="p-4 space-y-1">
              {queue.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ListMusic className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Queue is empty</p>
                  <p className="text-sm mt-1">Play a song to get started</p>
                </div>
              ) : (
                queue.map((song, index) => {
                  const isCurrentlyPlaying = index === queueIndex;
                  const songVideoId = extractVideoId(song.youtubeUrl);

                  return (
                    <div
                      key={`${song.id}-${index}`}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
                        isCurrentlyPlaying
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => playSong(song, queue)}
                    >
                      <div className="text-xs text-muted-foreground w-6 text-center shrink-0">
                        {isCurrentlyPlaying && isPlaying ? (
                          <div className="flex items-end justify-center gap-[2px] h-4">
                            {[1, 2, 3].map((i) => (
                              <div
                                key={i}
                                className="w-[2px] bg-primary rounded-full animate-bounce"
                                style={{
                                  animationDelay: `${i * 0.15}s`,
                                  animationDuration: "0.6s",
                                  height: `${4 + Math.random() * 8}px`,
                                }}
                              />
                            ))}
                          </div>
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>

                      <div className="w-10 h-10 rounded overflow-hidden shrink-0">
                        <img
                          src={song.thumbnail || `https://i.ytimg.com/vi/${songVideoId}/default.jpg`}
                          alt={song.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium truncate ${
                            isCurrentlyPlaying ? "text-primary" : ""
                          }`}
                        >
                          {song.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                      </div>

                      <Badge variant="outline" className="text-[10px] shrink-0 hidden sm:flex">
                        {song.mood}
                      </Badge>

                      <span className="text-xs text-muted-foreground shrink-0">{song.duration}</span>

                      {!isCurrentlyPlaying && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromQueue(index);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
});

ExpandedPlayer.displayName = "ExpandedPlayer";

export default ExpandedPlayer;
