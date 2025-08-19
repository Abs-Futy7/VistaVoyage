"use client";
import { useEffect, useState } from 'react';

interface CompilationWarmerProps {
  enabled?: boolean;
}

export function CompilationWarmer({ enabled = process.env.NODE_ENV === 'development' }: CompilationWarmerProps) {
  const [warmupStatus, setWarmupStatus] = useState<'idle' | 'warming' | 'complete'>('idle');

  useEffect(() => {
    if (!enabled) return;

    const warmupRoutes = async () => {
      setWarmupStatus('warming');
      console.log('🔥 Starting compilation warmup...');

      const routes = [
        '/packages',
        '/destinations', 
        '/blogs',
        '/auth/login',
        '/auth/register',
        '/faq',
        '/offers'
      ];

      // Create invisible iframe to trigger route compilation
      const warmupPromises = routes.map((route) => {
        return new Promise<void>((resolve) => {
          const iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          iframe.style.position = 'absolute';
          iframe.style.left = '-9999px';
          iframe.style.width = '1px';
          iframe.style.height = '1px';
          
          const timeoutId = setTimeout(() => {
            if (iframe.parentNode) {
              iframe.parentNode.removeChild(iframe);
            }
            console.log(`🔥 Warmup complete: ${route}`);
            resolve();
          }, 3000); // 3 second timeout per route

          iframe.onload = () => {
            clearTimeout(timeoutId);
            setTimeout(() => {
              if (iframe.parentNode) {
                iframe.parentNode.removeChild(iframe);
              }
              console.log(`🔥 Warmup complete: ${route}`);
              resolve();
            }, 500);
          };

          iframe.onerror = () => {
            clearTimeout(timeoutId);
            if (iframe.parentNode) {
              iframe.parentNode.removeChild(iframe);
            }
            console.log(`🔥 Warmup failed: ${route}`);
            resolve();
          };

          document.body.appendChild(iframe);
          iframe.src = route;
        });
      });

      try {
        await Promise.allSettled(warmupPromises);
        console.log('🔥 All routes warmed up!');
        setWarmupStatus('complete');
      } catch (error) {
        console.error('Warmup error:', error);
        setWarmupStatus('complete');
      }
    };

    // Start warmup after a short delay
    const timeoutId = setTimeout(warmupRoutes, 2000);

    return () => clearTimeout(timeoutId);
  }, [enabled]);

  // Show warmup status in development
  if (!enabled || process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        background: warmupStatus === 'warming' ? '#fbbf24' : warmupStatus === 'complete' ? '#10b981' : '#6b7280',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 9999,
        opacity: warmupStatus === 'idle' ? 0 : warmupStatus === 'complete' ? 0.7 : 1,
        transition: 'all 0.3s ease',
        pointerEvents: 'none'
      }}
    >
      {warmupStatus === 'warming' && '🔥 Warming routes...'}
      {warmupStatus === 'complete' && '✅ Routes ready'}
      {warmupStatus === 'idle' && '⏳ Pending'}
    </div>
  );
}
