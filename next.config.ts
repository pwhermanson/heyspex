import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
   devIndicators: false,

   // Simple performance optimizations
   experimental: {
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
   },

   // Compiler optimizations
   compiler: {
      removeConsole: process.env.NODE_ENV === 'production',
   },

   // Image optimization
   images: {
      formats: ['image/webp', 'image/avif'],
      minimumCacheTTL: 60,
   },
};

export default nextConfig;
