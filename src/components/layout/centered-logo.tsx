'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/src/lib/lib/utils';

interface CenteredLogoProps {
   className?: string;
}

export function CenteredLogo({ className }: CenteredLogoProps) {
   return (
      <div
         className={cn(
            'flex flex-col items-center justify-center h-full w-full',
            'bg-background text-foreground',
            className
         )}
      >
         {/* Logo */}
         <div className="mb-6">
            <Image
               src="/heyspex-logo-stacked.png"
               alt="HeySpex"
               width={300}
               height={273}
               className="h-auto w-auto max-w-[300px]"
               priority
            />
         </div>

         {/* Instruction text */}
         <div className="text-center">
            <p className="text-lg text-muted-foreground">
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
}
