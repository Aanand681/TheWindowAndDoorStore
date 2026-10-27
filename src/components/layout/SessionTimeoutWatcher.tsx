'use client';

import { useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

const INACTIVITY_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour
const CHECK_INTERVAL_MS = 30 * 1000; // Check every 30 seconds
const THROTTLE_MS = 5 * 1000; // Throttle activity updates to once per 5 seconds

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

    lastActivityRef.current = Date.now();
    isLoggingOutRef.current = false;

    let lastRecord = 0;
    const handleUserActivity = () => {
      const now = Date.now();
      if (now - lastRecord > THROTTLE_MS) {
        lastRecord = now;
        lastActivityRef.current = now;
      }
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((evt) => {
      window.addEventListener(evt, handleUserActivity, { passive: true });
    });

    const interval = setInterval(async () => {
      if (isLoggingOutRef.current) return;

      const idleTime = Date.now() - lastActivityRef.current;
      if (idleTime >= INACTIVITY_TIMEOUT_MS) {
        isLoggingOutRef.current = true;
        try {
          await signOut({ redirect: false });
        } catch (err) {
          console.warn('[SessionTimeoutWatcher] signOut error:', err);
        }
        window.location.href = '/login?expired=true';
      }
    }, CHECK_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      events.forEach((evt) => {
        window.removeEventListener(evt, handleUserActivity);
      });
    };
  }, [status, pathname]);

  return null;
}

export default SessionTimeoutWatcher;
