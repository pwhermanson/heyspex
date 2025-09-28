'use client';

/**
 * App Shell Branded Simple Component
 *
 * A minimal, performance-optimized version of the branded component that displays
 * only the logo and help text on a black background. This version removes all
 * interactive effects, animations, and complex calculations for faster loading
 * and reduced resource usage.
 *
 * Perfect for:
 * - Development and testing
 * - Performance-critical scenarios
 * - Minimal UI requirements
 * - Server configurations where full effects aren't needed
 *
 * @component AppShellBrandedSimple
 * @param {AppShellBrandedSimpleProps} props - Component props
 * @returns {JSX.Element} Simple logo display with help text
 */

import React from 'react';
import Image from 'next/image';
import { cn } from '@/src/lib/lib/utils';
import { ZIndex } from '@/src/lib/z-index-management';

export interface AppShellBrandedSimpleProps {
   className?: string;
}

export const AppShellBrandedSimple = React.memo(function AppShellBrandedSimple({
   className,
}: AppShellBrandedSimpleProps) {
   console.log('🎨 AppShellBrandedSimple component rendering');
   return (
      <div
         className={cn(
            'flex flex-col items-center justify-center min-h-screen w-full bg-black text-white',
            className
         )}
         style={ZIndex.utils.getStyle('APP_SHELL')}
      >
         {/* Logo */}
         <div className="mb-6 group cursor-pointer relative">
            <Image
               src="/heyspex-logo-stacked.svg"
               alt="HeySpex Logo"
               width={300}
               height={273}
               priority
               className="w-[300px] h-[273px]"
            />
         </div>

         {/* Help Text */}
         <div className="text-center">
            <p className="text-lg text-gray-300 mb-4">
               Press{' '}
               <kbd className="px-2 py-1 text-sm font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
                  Ctrl
               </kbd>{' '}
               +{' '}
               <kbd className="px-2 py-1 text-sm font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
                  /
               </kbd>{' '}
               to get started
            </p>
         </div>
      </div>
   );
});
