import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import crypto from 'crypto';

const withNextIntl = createNextIntlPlugin(
  // This is the default (also the `src` folder is supported out of the box)
  './src/i18n/request.ts'
);

const nextConfig: NextConfig = {
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react', '@tsparticles/react', '@tsparticles/engine', '@tsparticles/slim'],
    // Enable better code splitting
    optimizeCss: true,
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Add redirects to handle domain redirects at build time
  async redirects() {
    return [
      // Redirect root domain to www with locale in one step
      {
        source: '/',
        destination: 'https://www.navixagency.tech/en',
        permanent: true,
        has: [
          {
            type: 'host',
            value: 'navixagency.tech',
          },
        ],
      },
      // Redirect any path from root domain to www
      {
        source: '/:path*',
        destination: 'https://www.navixagency.tech/:path*',
        permanent: true,
        has: [
          {
            type: 'host',
            value: 'navixagency.tech',
          },
        ],
      },
    ];
  },

  typescript: {
    ignoreBuildErrors: true, // Ignore TypeScript errors
  },
  eslint: {
    ignoreDuringBuilds: true, // Ignore ESLint errors
  },

  // Compression
  compress: true,
  
  // Headers for better caching and security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Enhanced webpack optimizations for better code splitting
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle size in production
    if (!dev && !isServer) {
      // Enhanced code splitting configuration
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          // Separate React framework
          framework: {
            chunks: 'all',
            name: 'framework',
            test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            priority: 40,
            enforce: true,
          },
          
          // Separate animation libraries (heavy)
          animations: {
            name: 'animations',
            test: /[\\/]node_modules[\\/](framer-motion|gsap|@tsparticles)[\\/]/,
            priority: 35,
            enforce: true,
          },
          
          // Separate utility libraries
          lib: {
            test(module: any) {
              return module.size() > 160000 && /node_modules[/\\]/.test(module.identifier());
            },
            name(module: any) {
              const hash = crypto.createHash('sha1');
              hash.update(module.libIdent ? module.libIdent({ context: __dirname }) : module.identifier());
              return hash.digest('hex').substring(0, 8);
            },
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
          
          // Common chunks
          commons: {
            name: 'commons',
            minChunks: 2,
            priority: 20,
          },
          
          // Default chunk
          default: {
            minChunks: 2,
            priority: 10,
            reuseExistingChunk: true,
          },
        },
      };
      
      // Tree shaking optimization
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }
    
    return config;
  },
};

export default withNextIntl(nextConfig);