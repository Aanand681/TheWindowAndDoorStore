'use client';

import { useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

const INACTIVITY_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour
const CHECK_INTERVAL_MS = 15 * 1000; // Check every 15 seconds
const THROTTLE_MS = 5 * 1000; // Throttle activity updates to once per 5 seconds
const STORAGE_KEY = 'vwd_last_active_time';

export function SessionTimeoutWatcher() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const lastActivityRef = useRef<number>(Date.now());
  const isLoggingOutRef = useRef<boolean>(false);

  useEffect(() => {
    // Only monitor authenticated users who are not already on the login page
    if (status !== 'authenticated' || pathname === '/login') {
      return;
    }

    const now = Date.now();
    const existing = Number(localStorage.getItem(STORAGE_KEY));
    if (existing && !isNaN(existing) && existing > 0) {
      lastActivityRef.current = existing;
    } else {
      lastActivityRef.current = now;
      localStorage.setItem(STORAGE_KEY, String(now));
    }
    isLoggingOutRef.current = false;

    const triggerLogout = async () => {
      if (isLoggingOutRef.current) return;
      isLoggingOutRef.current = true;
      try {
        localStorage.removeItem(STORAGE_KEY);
        await signOut({ redirect: false });
      } catch (err) {
        console.warn('[SessionTimeoutWatcher] signOut error:', err);
      }
      window.location.href = '/login?expired=true';
    };

    const checkExpiration = () => {
      if (isLoggingOutRef.current) return;
      const stored = Number(localStorage.getItem(STORAGE_KEY) || lastActivityRef.current);
      const currentTime = Date.now();
      if (currentTime - stored >= INACTIVITY_TIMEOUT_MS) {
        triggerLogout();
      }
    };

    // Immediate check on mount
    checkExpiration();

    let lastRecord = 0;
    const handleUserActivity = () => {
      const currentTime = Date.now();
      const stored = Number(localStorage.getItem(STORAGE_KEY) || lastActivityRef.current);
      
      // If user acts AFTER 60 min of inactivity, log them out immediately rather than extending
      if (currentTime - stored >= INACTIVITY_TIMEOUT_MS) {
        triggerLogout();
        return;
      }

      if (currentTime - lastRecord > THROTTLE_MS) {
        lastRecord = currentTime;
        lastActivityRef.current = currentTime;
        localStorage.setItem(STORAGE_KEY, String(currentTime));
      }
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((evt) => {
      window.addEventListener(evt, handleUserActivity, { passive: true });
    });

    // Instant check when laptop wakes up or tab becomes visible / focused
    const handleVisibilityOrFocus = () => {
      if (!document.hidden) {
        checkExpiration();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    // Periodic check interval
    const interval = setInterval(checkExpiration, CHECK_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      events.forEach((evt) => {
        window.removeEventListener(evt, handleUserActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, [status, pathname]);

  return null;
}

export default SessionTimeoutWatcher;
