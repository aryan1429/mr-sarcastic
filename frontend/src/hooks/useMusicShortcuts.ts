import { useEffect } from "react";
import { useMusicPlayer } from "@/context/MusicPlayerContext";

/**
 * Hook that adds keyboard shortcuts for music player controls.
 * 
 * Keyboard shortcuts:
 * - Space: Play/Pause (when not focused on input)
 * - ArrowRight (with Shift): Skip to next song
 * - ArrowLeft (with Shift): Skip to previous song
 * - M: Toggle mute
 * - ArrowUp (with Shift): Volume up
 * - ArrowDown (with Shift): Volume down
 * - Escape: Close expanded player
 */
export function useKeyboardShortcuts() {
  const {
    currentSong,
    isPlaying,
    isPlayerExpanded,
    volume,
    togglePlay,
    playNext,
    playPrevious,
    toggleMute,
    setVolume,
    toggleExpanded,
  } = useMusicPlayer();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs, textareas, or contenteditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable ||
        target.closest("[role='textbox']")
      ) {
        return;
      }

      // Only activate shortcuts when a song is loaded
      if (!currentSong) return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowRight":
          if (e.shiftKey) {
            e.preventDefault();
            playNext();
          }
          break;
        case "ArrowLeft":
          if (e.shiftKey) {
            e.preventDefault();
            playPrevious();
          }
          break;
        case "m":
        case "M":
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            toggleMute();
          }
          break;
        case "ArrowUp":
          if (e.shiftKey) {
            e.preventDefault();
            setVolume(Math.min(100, volume + 5));
          }
          break;
        case "ArrowDown":
          if (e.shiftKey) {
            e.preventDefault();
            setVolume(Math.max(0, volume - 5));
          }
          break;
        case "Escape":
          if (isPlayerExpanded) {
            e.preventDefault();
            toggleExpanded();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    currentSong,
    isPlaying,
    isPlayerExpanded,
    volume,
    togglePlay,
    playNext,
    playPrevious,
    toggleMute,
    setVolume,
    toggleExpanded,
  ]);
}

/**
 * Hook that integrates with the browser's Media Session API
 * for OS-level media controls (lock screen, notification center, etc.)
 */
export function useMediaSession() {
  const {
    currentSong,
    isPlaying,
    togglePlay,
    playNext,
    playPrevious,
  } = useMusicPlayer();

  useEffect(() => {
    if (!("mediaSession" in navigator) || !currentSong) return;

    const extractVideoId = (url: string): string | null => {
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
      return match ? match[1] : null;
    };

    const videoId = extractVideoId(currentSong.youtubeUrl);
    const artworkUrl = currentSong.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    // Set metadata
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentSong.title,
      artist: currentSong.artist,
      album: `Mr Sarcastic - ${currentSong.mood}`,
      artwork: [
        { src: artworkUrl, sizes: "96x96", type: "image/jpeg" },
        { src: artworkUrl, sizes: "128x128", type: "image/jpeg" },
        { src: artworkUrl, sizes: "192x192", type: "image/jpeg" },
        { src: artworkUrl, sizes: "256x256", type: "image/jpeg" },
        { src: artworkUrl, sizes: "384x384", type: "image/jpeg" },
        { src: artworkUrl, sizes: "512x512", type: "image/jpeg" },
      ],
    });

    // Set playback state
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";

    // Set action handlers
    navigator.mediaSession.setActionHandler("play", () => togglePlay());
    navigator.mediaSession.setActionHandler("pause", () => togglePlay());
    navigator.mediaSession.setActionHandler("previoustrack", () => playPrevious());
    navigator.mediaSession.setActionHandler("nexttrack", () => playNext());

    return () => {
      // Clean up handlers
      try {
        navigator.mediaSession.setActionHandler("play", null);
        navigator.mediaSession.setActionHandler("pause", null);
        navigator.mediaSession.setActionHandler("previoustrack", null);
        navigator.mediaSession.setActionHandler("nexttrack", null);
      } catch {
        // Some browsers don't support null handlers
      }
    };
  }, [currentSong, isPlaying, togglePlay, playNext, playPrevious]);
}
