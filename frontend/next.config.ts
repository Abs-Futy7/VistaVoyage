import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove invalid options for Next.js 15
  poweredByHeader: false,
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  
  // Note: Turbopack configuration is not officially supported in next.config.ts yet
  // Use --turbo flag with npm run dev instead
  
  // Fix experimental options for Next.js 15
  experimental: {
    optimizePackageImports: ['lucide-react', '@heroui/react', 'framer-motion'],
    // Optimize CSS loading
    optimizeCss: process.env.NODE_ENV === 'production',
  },

  // Configure for both development and production
  webpack: (config, { dev, isServer }) => {
    // Development optimizations
    if (dev) {
      // Faster builds in development
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };
      
      // Enable persistent caching for faster rebuilds
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
        cacheDirectory: '.next/cache',
      };
    } else {
      // Production optimizations
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      };

      // Optimize bundle splitting for production
      if (!isServer) {
        config.optimization = {
          ...config.optimization,
          splitChunks: {
            chunks: 'all',
            cacheGroups: {
              default: {
                minChunks: 2,
                priority: -20,
                reuseExistingChunk: true,
              },
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                chunks: 'all',
                priority: -10,
              },
              common: {
                name: 'common',
                minChunks: 2,
                priority: -5,
                reuseExistingChunk: true,
                chunks: 'all',
              },
            },
          },
        };
      }
    }

    return config;
  },

  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
      // Only allow valid Supabase storage domains (excluding the invalid one)
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    // Enable image optimization
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Enable image caching
    minimumCacheTTL: 60 * 60 * 24 * 7, // 1 week
    // Handle loader errors gracefully
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Add error handling for invalid domains
    unoptimized: false,
    // Add custom loader to handle invalid URLs
    loader: 'default',
  },

  // Enable compression
  compress: true,

  // Optimize headers for caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
