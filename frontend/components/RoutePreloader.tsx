"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const CRITICAL_ROUTES = [
  '/',
  '/packages',
  '/destinations',
  '/blogs',
  '/auth/login',
  '/auth/register',
  '/user/bookings',
  '/user/profile',
  '/faq',
  '/offers'
];

// Dynamic routes that need warming
const DYNAMIC_ROUTES = [
  '/packages/1', // Sample package ID
  '/destinations/1', // Sample destination ID
  '/blogs/1', // Sample blog ID
];

export function RoutePreloader() {
  const router = useRouter();

  useEffect(() => {
    const warmupRoutes = async () => {
      console.log('🔥 Starting route warmup...');
      
      // Preload critical static routes immediately
      const criticalPromises = CRITICAL_ROUTES.map(async (route) => {
        try {
          console.log(`🔥 Warming up route: ${route}`);
          router.prefetch(route);
          
          // Force compilation by making a background fetch
          if (typeof window !== 'undefined') {
            fetch(route, { 
              method: 'HEAD',
              cache: 'no-cache'
            }).catch(() => {
              // Ignore errors - this is just to trigger compilation
            });
          }
        } catch (error) {
          console.warn(`Failed to prefetch route: ${route}`, error);
        }
      });

      // Wait a bit, then preload dynamic routes
      setTimeout(async () => {
        const dynamicPromises = DYNAMIC_ROUTES.map(async (route) => {
          try {
            console.log(`🔥 Warming up dynamic route: ${route}`);
            router.prefetch(route);
          } catch (error) {
            console.warn(`Failed to prefetch dynamic route: ${route}`, error);
          }
        });
        
        await Promise.allSettled(dynamicPromises);
        console.log('🔥 Route warmup complete!');
      }, 2000);

      await Promise.allSettled(criticalPromises);
    };

    // Start warmup after initial render
    const timeoutId = setTimeout(warmupRoutes, 500);

    return () => clearTimeout(timeoutId);
  }, [router]);

  // Also prefetch on hover for navigation links
  useEffect(() => {
    const handleMouseEnter = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (link && link.href && link.href.startsWith(window.location.origin)) {
        const path = new URL(link.href).pathname;
        console.log(`🔥 Hover prefetch: ${path}`);
        router.prefetch(path);
      }
    };

    document.addEventListener('mouseenter', handleMouseEnter, true);
    
    return () => {
      document.removeEventListener('mouseenter', handleMouseEnter, true);
    };
  }, [router]);

  return null;
}
