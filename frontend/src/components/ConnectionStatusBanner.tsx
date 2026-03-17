import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Loader2, X } from 'lucide-react';

export function ConnectionStatusBanner() {
  const { isOnline, isServerReachable, connectionQuality } = useConnectionStatus();
  const [showRestored, setShowRestored] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Track when we come back online to show a brief success flash
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (!isOnline || !isServerReachable) {
      setWasOffline(true);
      setShowRestored(false);
      // Add 3-second delay before showing offline/reconnecting banner
      timer = setTimeout(() => {
        setVisible(true);
      }, 3000);
    } else if (wasOffline && isOnline && isServerReachable) {
      setShowRestored(true);
      setWasOffline(false);
      setIsDismissed(false); // Reset dismiss state when connection restores
      // Hide restored banner after 3 seconds
      timer = setTimeout(() => {
        setShowRestored(false);
        setVisible(false);
      }, 3000);
    }

    return () => clearTimeout(timer);
  }, [isOnline, isServerReachable, wasOffline]);

  if ((!visible && !showRestored) || (isDismissed && !showRestored)) return null;

  // Determine banner state
  const isOffline = !isOnline;
  const isReconnecting = isOnline && !isServerReachable;
  const isRestored = showRestored;

  const bannerConfig = isOffline
    ? {
      bgColor: 'bg-red-500/90',
      icon: <WifiOff className="w-4 h-4" />,
      text: "You're offline — messages will be queued",
      showDismiss: true,
    }
    : isReconnecting
      ? {
        bgColor: 'bg-yellow-500/90',
        icon: <Loader2 className="w-4 h-4 animate-spin" />,
        text: 'Reconnecting to server...',
        showDismiss: true,
      }
      : isRestored
        ? {
          bgColor: 'bg-green-500/90',
          icon: <Wifi className="w-4 h-4" />,
          text: 'Connection restored!',
          showDismiss: false,
        }
        : null;

  if (!bannerConfig) return null;

  return (
    <div
      className={`${bannerConfig.bgColor} text-white px-4 py-2 flex items-center justify-between gap-2 text-sm font-medium rounded-lg mx-2 mt-2 shadow-lg`}
      style={{
        animation: isRestored
          ? 'smoothFadeIn 0.3s ease-out'
          : 'smoothSlideDown 0.3s ease-out',
      }}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 flex-1 justify-center">
        {bannerConfig.icon}
        <span>{bannerConfig.text}</span>
        {connectionQuality === 'slow' && !isOffline && !isRestored && (
          <span className="text-xs opacity-80 ml-1">(slow connection)</span>
        )}
      </div>
      {bannerConfig.showDismiss && (
        <button
          onClick={() => setIsDismissed(true)}
          className="p-1 hover:bg-black/10 rounded-md transition-colors shrink-0"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
