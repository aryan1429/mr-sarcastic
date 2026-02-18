import { memo } from "react";
import { useMusicPlayer } from "@/context/MusicPlayerContext";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  X,
  Volume2,
  VolumeX,
  ChevronUp,
  Music,
} from "lucide-react";

const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const MiniPlayer = memo(() => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isMiniPlayerVisible,
    togglePlay,
    playNext,
    playPrevious,
    seekTo,
    setVolume,
    toggleMute,
    closeMiniPlayer,
    toggleExpanded,
    isPlayerExpanded,
  } = useMusicPlayer();

  if (!isMiniPlayerVisible || !currentSong) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const extractVideoId = (url: string): string | null => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const videoId = extractVideoId(currentSong.youtubeUrl);
  const thumbnailUrl = currentSong.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 transition-all duration-300">
      {/* Progress bar (thin line at top) */}
      <div className="h-1 bg-muted w-full cursor-pointer group" onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        seekTo(pct * duration);
      }}>
        <div
          className="h-full bg-primary transition-all duration-200 group-hover:h-1.5"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Player bar */}
      <div className="bg-background/95 backdrop-blur-xl border-t border-border shadow-2xl">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center h-16 sm:h-[72px] gap-2 sm:gap-4">
            {/* Song Info */}
            <div className="flex items-center gap-3 min-w-0 flex-1 sm:flex-[0.3]">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden shrink-0 shadow-md">
                <img
                  src={thumbnailUrl}
                  alt={currentSong.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://i.ytimg.com/vi/${videoId}/default.jpg`;
                  }}
                />
                {isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Music className="w-4 h-4 text-white animate-pulse" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{currentSong.title}</p>
                <p className="text-xs text-muted-foreground truncate">{currentSong.artist}</p>
              </div>
            </div>

            {/* Main Controls */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hidden sm:flex"
                onClick={playPrevious}
              >
                <SkipBack className="w-4 h-4" />
              </Button>

              <Button
                variant="default"
                size="icon"
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-full shadow-lg"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={playNext}
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>

            {/* Time + Progress (desktop) */}
            <div className="hidden md:flex items-center gap-2 flex-1">
              <span className="text-xs text-muted-foreground w-10 text-right tabular-nums">
                {formatTime(currentTime)}
              </span>
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                className="flex-1"
                onValueChange={(v) => seekTo(v[0])}
              />
              <span className="text-xs text-muted-foreground w-10 tabular-nums">
                {formatTime(duration)}
              </span>
            </div>

            {/* Volume (desktop) */}
            <div className="hidden lg:flex items-center gap-2 flex-[0.2]">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleMute}>
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                max={100}
                step={1}
                className="w-24"
                onValueChange={(v) => setVolume(v[0])}
              />
            </div>

            {/* Expand / Close */}
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hidden sm:flex"
                onClick={toggleExpanded}
              >
                <ChevronUp
                  className={`w-4 h-4 transition-transform ${isPlayerExpanded ? "rotate-180" : ""}`}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={closeMiniPlayer}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Mobile time display */}
          <div className="flex sm:hidden items-center gap-2 pb-2 -mt-1">
            <span className="text-[10px] text-muted-foreground tabular-nums">
              {formatTime(currentTime)}
            </span>
            <div className="flex-1 h-0.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-[10px] text-muted-foreground tabular-nums">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

MiniPlayer.displayName = "MiniPlayer";

export default MiniPlayer;
