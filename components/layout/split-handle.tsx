'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SplitHandleProps {
   'className'?: string;
   'aria-label'?: string;
}

export function SplitHandle({
   className,
   'aria-label': ariaLabel = 'Bottom panel split handle',
}: SplitHandleProps) {
   return (
      <div
         className={cn(
            // Static split handle with accessible hit area
            'relative h-2 cursor-row-resize flex items-center justify-center group',
            // Background and border styling
            'bg-border/50 hover:bg-border transition-colors duration-200',
            'border-t border-b border-border/30',
            // Motion handling
            'motion-reduce:transition-none',
            className
         )}
         role="separator"
         aria-orientation="horizontal"
         aria-label={ariaLabel}
         tabIndex={0}
      >
         {/* Visual grip indicator */}
         <div
            className={cn(
               'w-12 h-1 rounded-full transition-colors duration-200',
               'bg-border/70 group-hover:bg-foreground/50 group-focus:bg-foreground/50',
               'motion-reduce:transition-none'
            )}
         />

         {/* Expanded hover/focus area for better accessibility */}
         <div className="absolute inset-x-0 -inset-y-2" aria-hidden="true" />
      </div>
   );
}
