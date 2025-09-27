import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
   // Disable dev indicators for cleaner console
   devIndicators: false,

   // Optimize development performance
   onDemandEntries: {
      maxInactiveAge: 25 * 1000,
      pagesBufferLength: 2,
   },

   // Use stable build ID for better caching
   generateBuildId: async () => {
      return 'build-' + Date.now();
   },

   // Performance optimizations
   experimental: {
      // Enable Turbopack for faster builds (when available)
      turbo: {
         rules: {
            '*.svg': {
               loaders: ['@svgr/webpack'],
               as: '*.js',
            },
         },
      },

      // Optimize package imports for better tree shaking
      optimizePackageImports: [
         '@radix-ui/react-alert-dialog',
         '@radix-ui/react-avatar',
         '@radix-ui/react-checkbox',
         '@radix-ui/react-collapsible',
         '@radix-ui/react-context-menu',
         '@radix-ui/react-dialog',
         '@radix-ui/react-dropdown-menu',
         '@radix-ui/react-label',
         '@radix-ui/react-popover',
         '@radix-ui/react-progress',
         '@radix-ui/react-select',
         '@radix-ui/react-separator',
         '@radix-ui/react-slot',
         '@radix-ui/react-switch',
         '@radix-ui/react-tabs',
         '@radix-ui/react-toggle',
         '@radix-ui/react-tooltip',
         'lucide-react',
         'react-icons',
      ],

      // Enable faster refresh
      optimizeCss: true,

      // Disable webpackBuildWorker - causes build hangs on Windows
      // webpackBuildWorker: true,
   },

   // Compiler optimizations
   compiler: {
      removeConsole: process.env.NODE_ENV === 'production',
   },

   // Image optimization
   images: {
      formats: ['image/webp', 'image/avif'],
      minimumCacheTTL: 60,
      dangerouslyAllowSVG: true,
      contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
   },

   // Webpack optimizations
   webpack: (config, { dev, isServer }) => {
      // Optimize for development
      if (dev) {
         // Use memory cache instead of filesystem to avoid path resolution issues
         config.cache = {
            type: 'memory',
         };

         // Reduce bundle analysis overhead
         config.optimization = {
            ...config.optimization,
            splitChunks: {
               chunks: 'all',
               cacheGroups: {
                  vendor: {
                     test: /[\\/]node_modules[\\/]/,
                     name: 'vendors',
                     chunks: 'all',
                  },
               },
            },
         };
      }

      return config;
   },
};

export default nextConfig;
