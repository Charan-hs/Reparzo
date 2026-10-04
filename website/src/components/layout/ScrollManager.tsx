import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const SCROLL_STORAGE_KEY = 'reparzo_scroll_positions';

function getStoredPositions(): Record<string, number> {
  try {
    const raw = sessionStorage.getItem(SCROLL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredPosition(key: string, y: number) {
  try {
    const positions = getStoredPositions();
    positions[key] = Math.max(0, y);
    sessionStorage.setItem(SCROLL_STORAGE_KEY, JSON.stringify(positions));
  } catch {}
}

/**
 * ScrollManager guarantees:
 * 1. Forward / New Navigation (PUSH): Always starts cleanly from the top (y: 0).
 * 2. Back / History Navigation (POP): Accurately restores scroll position where the user left off.
 */
export const ScrollManager: React.FC = () => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const currentKeyRef = useRef<string>(location.key || location.pathname);

  // Disable native browser auto-scroll restoration to prevent race conditions with React DOM rendering
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // Continuously record scroll position for the current history entry
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
          saveStoredPosition(currentKeyRef.current, scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      // Save last known position on route exit
      const lastY = window.scrollY || document.documentElement.scrollTop || 0;
      saveStoredPosition(currentKeyRef.current, lastY);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location.key]);

  // Handle scroll positioning before browser paint
  useLayoutEffect(() => {
    const entryKey = location.key || location.pathname;
    const isHistoryBackForward = navigationType === 'POP';

    if (!isHistoryBackForward) {
      // ── 1. Forward Navigation (PUSH / REPLACE to new page) ──
      // Always scroll immediately to the very top
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant',
      });
    } else {
      // ── 2. Backward / History Navigation (POP) ──
      // Restore to exact position where user was previously
      const positions = getStoredPositions();
      const targetY = positions[entryKey] ?? positions[location.pathname] ?? 0;

      window.scrollTo({
        top: targetY,
        left: 0,
        behavior: 'instant',
      });

      // Compensate for async catalog rendering / DOM height expansion
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        const currentHeight = document.documentElement.scrollHeight;
        if (currentHeight >= targetY || attempts >= 8) {
          window.scrollTo({
            top: targetY,
            left: 0,
            behavior: 'instant',
          });
          if (attempts >= 8) clearInterval(interval);
        }
      }, 50);

      return () => clearInterval(interval);
    }

    currentKeyRef.current = entryKey;
  }, [location.key, location.pathname, location.search, navigationType]);

  return null;
};
