import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from "react";
import type { Song } from "@/services/songsService";

export type RepeatMode = "off" | "all" | "one";

interface MusicPlayerState {
  // Current playback
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;

  // Queue
  queue: Song[];
  queueIndex: number;

  // Modes
  shuffle: boolean;
  repeat: RepeatMode;

  // Favorites
  favorites: string[];

  // UI state
  isMiniPlayerVisible: boolean;
  isPlayerExpanded: boolean;
}

interface MusicPlayerActions {
  // Playback controls
  playSong: (song: Song, playlist?: Song[]) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  seekTo: (time: number) => void;

  // Queue controls
  playNext: () => void;
  playPrevious: () => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  setQueue: (songs: Song[], startIndex?: number) => void;

  // Volume
  setVolume: (volume: number) => void;
  toggleMute: () => void;

  // Modes
  toggleShuffle: () => void;
  setRepeatMode: (mode: RepeatMode) => void;
  cycleRepeat: () => void;

  // Favorites
  toggleFavorite: (songId: string) => void;
  isFavorite: (songId: string) => boolean;

  // UI
  toggleMiniPlayer: () => void;
  toggleExpanded: () => void;
  closeMiniPlayer: () => void;
}

type MusicPlayerContextType = MusicPlayerState & MusicPlayerActions;

const MusicPlayerContext = createContext<MusicPlayerContextType | null>(null);

// Load favorites from localStorage
const loadFavorites = (): string[] => {
  try {
    const stored = localStorage.getItem("mr-sarcastic-favorites");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save favorites to localStorage
const saveFavorites = (favorites: string[]) => {
  try {
    localStorage.setItem("mr-sarcastic-favorites", JSON.stringify(favorites));
  } catch {
    console.error("Failed to save favorites");
  }
};

// Load volume from localStorage
const loadVolume = (): number => {
  try {
    const stored = localStorage.getItem("mr-sarcastic-volume");
    return stored ? parseFloat(stored) : 80;
  } catch {
    return 80;
  }
};

export const MusicPlayerProvider = ({ children }: { children: ReactNode }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(loadVolume);
  const [isMuted, setIsMuted] = useState(false);
  const [queue, setQueueState] = useState<Song[]>([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>("off");
  const [favorites, setFavorites] = useState<string[]>(loadFavorites);
  const [isMiniPlayerVisible, setIsMiniPlayerVisible] = useState(false);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);

  // YouTube IFrame API reference
  const playerRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const apiLoadedRef = useRef(false);
  const timeUpdateInterval = useRef<NodeJS.Timeout | null>(null);
  const shuffleHistoryRef = useRef<number[]>([]);

  // Load YouTube IFrame API
  useEffect(() => {
    if (apiLoadedRef.current) return;

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);

    (window as any).onYouTubeIframeAPIReady = () => {
      apiLoadedRef.current = true;
      console.log("✅ YouTube IFrame API ready");
    };

    return () => {
      if (timeUpdateInterval.current) {
        clearInterval(timeUpdateInterval.current);
      }
    };
  }, []);

  // Extract YouTube video ID
  const extractVideoId = useCallback((url: string): string | null => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  }, []);

  // Create or load YouTube player
  const loadVideo = useCallback(
    (song: Song) => {
      const videoId = extractVideoId(song.youtubeUrl);
      if (!videoId) return;

      const YT = (window as any).YT;
      if (!YT?.Player) {
        // API not ready yet, retry in 500ms
        setTimeout(() => loadVideo(song), 500);
        return;
      }

      if (playerRef.current) {
        try {
          playerRef.current.loadVideoById(videoId);
          playerRef.current.setVolume(isMuted ? 0 : volume);
        } catch {
          // Player destroyed, recreate
          playerRef.current = null;
          loadVideo(song);
        }
        return;
      }

      // Create hidden player container if not exists
      if (!playerContainerRef.current) {
        const container = document.createElement("div");
        container.id = "yt-music-player";
        container.style.position = "fixed";
        container.style.top = "-9999px";
        container.style.left = "-9999px";
        container.style.width = "1px";
        container.style.height = "1px";
        container.style.opacity = "0";
        container.style.pointerEvents = "none";
        document.body.appendChild(container);
        playerContainerRef.current = container;
      }

      playerRef.current = new YT.Player("yt-music-player", {
        height: "1",
        width: "1",
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          onReady: (event: any) => {
            event.target.setVolume(isMuted ? 0 : volume);
            event.target.playVideo();
            const dur = event.target.getDuration();
            if (dur) setDuration(dur);
          },
          onStateChange: (event: any) => {
            const state = event.data;
            // YT.PlayerState: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
            if (state === 1) {
              setIsPlaying(true);
              const dur = event.target.getDuration();
              if (dur) setDuration(dur);
              startTimeTracking();
            } else if (state === 2) {
              setIsPlaying(false);
              stopTimeTracking();
            } else if (state === 0) {
              // Video ended
              setIsPlaying(false);
              stopTimeTracking();
              handleSongEnd();
            }
          },
          onError: (event: any) => {
            console.error("YouTube Player Error:", event.data);
            // Auto-skip to next on error
            setTimeout(() => playNextInternal(), 1000);
          },
        },
      });
    },
    [volume, isMuted]
  );

  // Time tracking
  const startTimeTracking = useCallback(() => {
    if (timeUpdateInterval.current) clearInterval(timeUpdateInterval.current);
    timeUpdateInterval.current = setInterval(() => {
      if (playerRef.current?.getCurrentTime) {
        try {
          const time = playerRef.current.getCurrentTime();
          setCurrentTime(time || 0);
        } catch {
          // Player might be destroyed
        }
      }
    }, 250);
  }, []);

  const stopTimeTracking = useCallback(() => {
    if (timeUpdateInterval.current) {
      clearInterval(timeUpdateInterval.current);
      timeUpdateInterval.current = null;
    }
  }, []);

  // Get next index considering shuffle
  const getNextIndex = useCallback((): number => {
    if (queue.length === 0) return -1;

    if (shuffle) {
      // Get unplayed indices
      const unplayed = queue
        .map((_, i) => i)
        .filter((i) => !shuffleHistoryRef.current.includes(i) && i !== queueIndex);

      if (unplayed.length === 0) {
        // All played, reset history
        shuffleHistoryRef.current = [queueIndex];
        const remaining = queue.map((_, i) => i).filter((i) => i !== queueIndex);
        if (remaining.length === 0) return queueIndex;
        return remaining[Math.floor(Math.random() * remaining.length)];
      }

      return unplayed[Math.floor(Math.random() * unplayed.length)];
    }

    return (queueIndex + 1) % queue.length;
  }, [queue, queueIndex, shuffle]);

  // Handle song end
  const handleSongEnd = useCallback(() => {
    if (repeat === "one") {
      // Replay current
      if (playerRef.current?.seekTo) {
        playerRef.current.seekTo(0);
        playerRef.current.playVideo();
      }
      return;
    }

    const nextIdx = getNextIndex();
    if (nextIdx === -1) return;

    if (repeat === "off" && nextIdx <= queueIndex && !shuffle) {
      // Reached end of queue, stop
      setIsPlaying(false);
      return;
    }

    setQueueIndex(nextIdx);
    shuffleHistoryRef.current.push(nextIdx);
    const nextSong = queue[nextIdx];
    if (nextSong) {
      setCurrentSong(nextSong);
      setCurrentTime(0);
      loadVideo(nextSong);
    }
  }, [repeat, getNextIndex, queue, queueIndex, loadVideo]);

  const playNextInternal = useCallback(() => {
    const nextIdx = getNextIndex();
    if (nextIdx === -1 || queue.length === 0) return;

    setQueueIndex(nextIdx);
    shuffleHistoryRef.current.push(nextIdx);
    const nextSong = queue[nextIdx];
    if (nextSong) {
      setCurrentSong(nextSong);
      setCurrentTime(0);
      loadVideo(nextSong);
    }
  }, [getNextIndex, queue, loadVideo]);

  // === Public Actions ===

  const playSong = useCallback(
    (song: Song, playlist?: Song[]) => {
      if (playlist && playlist.length > 0) {
        setQueueState(playlist);
        const idx = playlist.findIndex((s) => s.id === song.id);
        setQueueIndex(idx >= 0 ? idx : 0);
        shuffleHistoryRef.current = [idx >= 0 ? idx : 0];
      } else if (queue.length === 0) {
        setQueueState([song]);
        setQueueIndex(0);
        shuffleHistoryRef.current = [0];
      } else {
        const existingIdx = queue.findIndex((s) => s.id === song.id);
        if (existingIdx >= 0) {
          setQueueIndex(existingIdx);
        } else {
          const newQueue = [...queue, song];
          setQueueState(newQueue);
          setQueueIndex(newQueue.length - 1);
        }
      }

      setCurrentSong(song);
      setCurrentTime(0);
      setIsMiniPlayerVisible(true);
      loadVideo(song);
    },
    [queue, loadVideo]
  );

  const togglePlay = useCallback(() => {
    if (!playerRef.current) return;
    try {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    } catch {
      console.error("Failed to toggle playback");
    }
  }, [isPlaying]);

  const pause = useCallback(() => {
    if (playerRef.current?.pauseVideo) {
      playerRef.current.pauseVideo();
    }
  }, []);

  const resume = useCallback(() => {
    if (playerRef.current?.playVideo) {
      playerRef.current.playVideo();
    }
  }, []);

  const stop = useCallback(() => {
    if (playerRef.current?.stopVideo) {
      playerRef.current.stopVideo();
    }
    setIsPlaying(false);
    setCurrentTime(0);
    stopTimeTracking();
  }, [stopTimeTracking]);

  const seekTo = useCallback((time: number) => {
    if (playerRef.current?.seekTo) {
      playerRef.current.seekTo(time, true);
      setCurrentTime(time);
    }
  }, []);

  const playNext = useCallback(() => {
    playNextInternal();
  }, [playNextInternal]);

  const playPrevious = useCallback(() => {
    // If more than 3 seconds in, restart current song
    if (currentTime > 3 && playerRef.current?.seekTo) {
      playerRef.current.seekTo(0);
      setCurrentTime(0);
      return;
    }

    if (queue.length === 0) return;

    const prevIdx = shuffle
      ? shuffleHistoryRef.current.length > 1
        ? shuffleHistoryRef.current[shuffleHistoryRef.current.length - 2]
        : queueIndex
      : (queueIndex - 1 + queue.length) % queue.length;

    if (shuffle && shuffleHistoryRef.current.length > 1) {
      shuffleHistoryRef.current.pop();
    }

    setQueueIndex(prevIdx);
    const prevSong = queue[prevIdx];
    if (prevSong) {
      setCurrentSong(prevSong);
      setCurrentTime(0);
      loadVideo(prevSong);
    }
  }, [currentTime, queue, queueIndex, shuffle, loadVideo]);

  const addToQueue = useCallback(
    (song: Song) => {
      setQueueState((prev) => [...prev, song]);
    },
    []
  );

  const removeFromQueue = useCallback(
    (index: number) => {
      setQueueState((prev) => prev.filter((_, i) => i !== index));
      if (index < queueIndex) {
        setQueueIndex((prev) => prev - 1);
      } else if (index === queueIndex) {
        // If removing currently playing song
        playNextInternal();
      }
    },
    [queueIndex, playNextInternal]
  );

  const clearQueue = useCallback(() => {
    stop();
    setQueueState([]);
    setQueueIndex(-1);
    setCurrentSong(null);
    setIsMiniPlayerVisible(false);
    shuffleHistoryRef.current = [];
  }, [stop]);

  const setQueue = useCallback(
    (songs: Song[], startIndex: number = 0) => {
      setQueueState(songs);
      setQueueIndex(startIndex);
      shuffleHistoryRef.current = [startIndex];
      if (songs[startIndex]) {
        setCurrentSong(songs[startIndex]);
        setCurrentTime(0);
        setIsMiniPlayerVisible(true);
        loadVideo(songs[startIndex]);
      }
    },
    [loadVideo]
  );

  const setVolume = useCallback(
    (vol: number) => {
      const clamped = Math.max(0, Math.min(100, vol));
      setVolumeState(clamped);
      localStorage.setItem("mr-sarcastic-volume", String(clamped));
      if (playerRef.current?.setVolume) {
        playerRef.current.setVolume(isMuted ? 0 : clamped);
      }
      if (clamped > 0 && isMuted) {
        setIsMuted(false);
      }
    },
    [isMuted]
  );

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const newMuted = !prev;
      if (playerRef.current?.setVolume) {
        playerRef.current.setVolume(newMuted ? 0 : volume);
      }
      return newMuted;
    });
  }, [volume]);

  const toggleShuffle = useCallback(() => {
    setShuffle((prev) => !prev);
    shuffleHistoryRef.current = queueIndex >= 0 ? [queueIndex] : [];
  }, [queueIndex]);

  const setRepeatMode = useCallback((mode: RepeatMode) => {
    setRepeat(mode);
  }, []);

  const cycleRepeat = useCallback(() => {
    setRepeat((prev) => {
      if (prev === "off") return "all";
      if (prev === "all") return "one";
      return "off";
    });
  }, []);

  const toggleFavorite = useCallback((songId: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(songId) ? prev.filter((id) => id !== songId) : [...prev, songId];
      saveFavorites(updated);
      return updated;
    });
  }, []);

  const isFavorite = useCallback(
    (songId: string) => {
      return favorites.includes(songId);
    },
    [favorites]
  );

  const toggleMiniPlayer = useCallback(() => {
    setIsMiniPlayerVisible((prev) => !prev);
  }, []);

  const toggleExpanded = useCallback(() => {
    setIsPlayerExpanded((prev) => !prev);
  }, []);

  const closeMiniPlayer = useCallback(() => {
    stop();
    setIsMiniPlayerVisible(false);
    setIsPlayerExpanded(false);
  }, [stop]);

  const contextValue: MusicPlayerContextType = {
    // State
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
    favorites,
    isMiniPlayerVisible,
    isPlayerExpanded,
    // Actions
    playSong,
    togglePlay,
    pause,
    resume,
    stop,
    seekTo,
    playNext,
    playPrevious,
    addToQueue,
    removeFromQueue,
    clearQueue,
    setQueue,
    setVolume,
    toggleMute,
    toggleShuffle,
    setRepeatMode,
    cycleRepeat,
    toggleFavorite,
    isFavorite,
    toggleMiniPlayer,
    toggleExpanded,
    closeMiniPlayer,
  };

  return <MusicPlayerContext.Provider value={contextValue}>{children}</MusicPlayerContext.Provider>;
};

export const useMusicPlayer = (): MusicPlayerContextType => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error("useMusicPlayer must be used within a MusicPlayerProvider");
  }
  return context;
};
