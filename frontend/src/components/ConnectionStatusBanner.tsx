import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

export function ConnectionStatusBanner() {
  const { isOnline, isServerReachable, connectionQuality } = useConnectionStatus();
  const [showRestored, setShowRestored] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  const [visible, setVisible] = useState(false);

  // Track when we come back online to show a brief success flash
  useEffect(() => {
    if (!isOnline || !isServerReachable) {
      setWasOffline(true);
      setVisible(true);
      setShowRestored(false);
    } else if (wasOffline && isOnline && isServerReachable) {
      setShowRestored(true);
      setWasOffline(false);
      // Hide restored banner after 3 seconds
      const timer = setTimeout(() => {
        setShowRestored(false);
        setVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, isServerReachable, wasOffline]);

  if (!visible && !showRestored) return null;

  // Determine banner state
  const isOffline = !isOnline;
  const isReconnecting = isOnline && !isServerReachable;
  const isRestored = showRestored;

  const bannerConfig = isOffline
    ? {
      bgColor: 'bg-red-500/90',
      icon: <WifiOff className="w-4 h-4" />,
      text: "You're offline — messages will be queued",
    }
    : isReconnecting
      ? {
        bgColor: 'bg-yellow-500/90',
        icon: <Loader2 className="w-4 h-4 animate-spin" />,
        text: 'Reconnecting to server...',
      }
      : isRestored
        ? {
          bgColor: 'bg-green-500/90',
          icon: <Wifi className="w-4 h-4" />,
          text: 'Connection restored!',
        }
        : null;

  if (!bannerConfig) return null;

  return (
    <div
      className={`${bannerConfig.bgColor} text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium rounded-lg mx-2 mt-2 shadow-lg`}
      style={{
        animation: isRestored
          ? 'smoothFadeIn 0.3s ease-out'
          : 'smoothSlideDown 0.3s ease-out',
      }}
      role="alert"
      aria-live="polite"
    >
      {bannerConfig.icon}
      <span>{bannerConfig.text}</span>
      {connectionQuality === 'slow' && !isOffline && !isRestored && (
        <span className="text-xs opacity-80 ml-1">(slow connection)</span>
      )}
    </div>
  );
}
