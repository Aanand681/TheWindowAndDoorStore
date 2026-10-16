'use client';

import { useState, useEffect } from 'react';

export type ScreenBucket = 'compact' | 'medium' | 'expanded' | 'wide';

export interface ViewportInfo {
  width: number;
  height: number;
  isCompact: boolean;   // < 640px (Phones, split-view 1/3)
  isMedium: boolean;    // 640px - 1024px (Tablets, iPad Portrait, split-view 1/2)
  isExpanded: boolean;  // 1024px - 1440px (iPad Pro Landscape, Laptops)
  isWide: boolean;      // > 1440px (Desktop monitors, ultra-wide)
  isLandscape: boolean;
  isPortrait: boolean;
  screenBucket: ScreenBucket;
  isMounted: boolean;
}

const defaultViewport: ViewportInfo = {
  width: 1200,
  height: 800,
  isCompact: false,
  isMedium: false,
  isExpanded: true,
  isWide: false,
  isLandscape: true,
  isPortrait: false,
  screenBucket: 'expanded',
  isMounted: false,
};

export function useViewport(): ViewportInfo {
  const [viewport, setViewport] = useState<ViewportInfo>(defaultViewport);

  useEffect(() => {
    function updateViewport() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const isCompact = w < 640;
      const isMedium = w >= 640 && w < 1024;
      const isExpanded = w >= 1024 && w < 1440;
      const isWide = w >= 1440;
      const isLandscape = w > h;
      const isPortrait = h >= w;

      let screenBucket: ScreenBucket = 'expanded';
      if (isCompact) screenBucket = 'compact';
      else if (isMedium) screenBucket = 'medium';
      else if (isWide) screenBucket = 'wide';

      setViewport({
        width: w,
        height: h,
        isCompact,
        isMedium,
        isExpanded,
        isWide,
        isLandscape,
        isPortrait,
        screenBucket,
        isMounted: true,
      });
    }

    updateViewport();
    window.addEventListener('resize', updateViewport, { passive: true });
    window.addEventListener('orientationchange', updateViewport, { passive: true });

    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
    };
  }, []);

  return viewport;
}
