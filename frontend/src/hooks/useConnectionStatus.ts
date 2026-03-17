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
const PING_INTERVAL_IDLE = 45000; // 45 seconds (stable connection)
const PING_INTERVAL_ACTIVE = 15000; // 15 seconds (poor/offline connection)
const PING_TIMEOUT = 15000; // 15 seconds (tolerates Render cold starts)
const SLOW_THRESHOLD = 3000; // 3 seconds = "slow"
const FAILURE_THRESHOLD = 2; // Require 2 consecutive failures before marking unreachable
const RETRY_DELAY = 5000; // 5 seconds — quick retry after a failure

export function useConnectionStatus(): ConnectionStatus {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isServerReachable, setIsServerReachable] = useState<boolean>(true);
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality>('good');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

        // Schedule a quick retry instead of waiting for the full interval
        if (navigator.onLine && retryTimeoutRef.current === null) {
          retryTimeoutRef.current = setTimeout(() => {
            retryTimeoutRef.current = null;
            if (isMounted.current) pingServer();
          }, RETRY_DELAY);
        }
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

    // Initial check only if we don't have an interval yet
    if (intervalRef.current === null) {
        pingServer();
    }

    const interval = (!isOnline || !isServerReachable || connectionQuality !== 'good') 
      ? PING_INTERVAL_ACTIVE 
      : PING_INTERVAL_IDLE;

    // Set up interval
    intervalRef.current = setInterval(pingServer, interval);

    return () => {
      isMounted.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, [pingServer, isOnline, isServerReachable, connectionQuality]);

  return {
    isOnline,
    isServerReachable,
    connectionQuality,
    lastChecked,
    checkNow,
  };
}
