import { useState, useEffect, useCallback, useRef } from 'react';

type ConnectionQuality = 'good' | 'slow' | 'offline';

interface ConnectionStatus {
  isOnline: boolean;
  isServerReachable: boolean;
  connectionQuality: ConnectionQuality;
  lastChecked: Date | null;
  checkNow: () => Promise<void>;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
const PING_INTERVAL = 30000; // 30 seconds
const PING_TIMEOUT = 10000; // 10 seconds
const SLOW_THRESHOLD = 3000; // 3 seconds = "slow"
const FAILURE_THRESHOLD = 2; // Require 2 consecutive failures before marking unreachable

export function useConnectionStatus(): ConnectionStatus {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isServerReachable, setIsServerReachable] = useState<boolean>(true);
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality>('good');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMounted = useRef(true);
  const failureCount = useRef(0);
  const isInitializing = useRef(true); // Grace period: don't show banner during first ping cycle

  const pingServer = useCallback(async () => {
    if (!navigator.onLine) {
      if (isMounted.current) {
        failureCount.current = FAILURE_THRESHOLD; // Immediately mark offline
        setIsOnline(false);
        setIsServerReachable(false);
        setConnectionQuality('offline');
        setLastChecked(new Date());
      }
      return;
    }

    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), PING_TIMEOUT);

    try {
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/api/ping`, {
        method: 'GET',
        signal: controller.signal,
        cache: 'no-store',
      });

      clearTimeout(timeoutId);
      const elapsed = Date.now() - startTime;

      if (isMounted.current) {
        failureCount.current = 0; // Reset on success
        isInitializing.current = false; // First successful ping ends grace period
        setIsOnline(true);
        setIsServerReachable(response.ok);
        setConnectionQuality(elapsed > SLOW_THRESHOLD ? 'slow' : 'good');
        setLastChecked(new Date());
      }
    } catch {
      clearTimeout(timeoutId);
      if (isMounted.current) {
        failureCount.current += 1;
        setIsOnline(navigator.onLine);
        // During initial grace period, don't mark unreachable (server may be waking up)
        // After grace period, require FAILURE_THRESHOLD consecutive failures
        if (!isInitializing.current && failureCount.current >= FAILURE_THRESHOLD) {
          setIsServerReachable(false);
        }
        // End grace period after 2 attempts regardless
        if (failureCount.current >= FAILURE_THRESHOLD) {
          isInitializing.current = false;
        }
        setConnectionQuality(navigator.onLine ? 'slow' : 'offline');
        setLastChecked(new Date());
      }
    }
  }, []);

  const checkNow = useCallback(async () => {
    await pingServer();
  }, [pingServer]);

  // Listen to browser online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Immediately check server when we come back online
      pingServer();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsServerReachable(false);
      setConnectionQuality('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pingServer]);

  // Periodic health check
  useEffect(() => {
    isMounted.current = true;

    // Initial check
    pingServer();

    // Set up interval
    intervalRef.current = setInterval(pingServer, PING_INTERVAL);

    return () => {
      isMounted.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [pingServer]);

  return {
    isOnline,
    isServerReachable,
    connectionQuality,
    lastChecked,
    checkNow,
  };
}
