"use client";
import { useEffect } from 'react';

export function PerformanceMonitor() {
  useEffect(() => {
    // Monitor navigation performance
    if (typeof window !== 'undefined' && 'performance' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            console.log(`Navigation timing:`, {
              'DOM Content Loaded': navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
              'Load Complete': navEntry.loadEventEnd - navEntry.loadEventStart,
              // 'First Paint' is not directly available; using domInteractive as an approximation
              'DOM Interactive': navEntry.domInteractive - navEntry.startTime,
            });
          }
        });
      });
      
      observer.observe({ entryTypes: ['navigation', 'measure'] });
      
      return () => observer.disconnect();
    }
  }, []);

  return null; // This component doesn't render anything
}
