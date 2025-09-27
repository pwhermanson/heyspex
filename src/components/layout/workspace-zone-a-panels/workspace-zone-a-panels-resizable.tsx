'use client';

import * as React from 'react';
import { cn } from '@/src/lib/lib/utils';
import { useResizablePanel } from './workspace-zone-a-panels-provider';

interface WorkspaceZoneAPanelsResizableProps {
   side: 'left' | 'right';
   children: React.ReactNode;
   className?: string;
}

export function ResizablePanel({ side, children, className }: WorkspaceZoneAPanelsResizableProps) {
   // Always show the panel content, but make it responsive to width like Panel B
   // Instead of collapsing, adapt the content based on available space
   const content = (
      <div
         className={cn(
            'workspace-zone-a-panel flex h-full w-full flex-col border shadow-sm relative lg:rounded-md overflow-hidden',
            side === 'right' && 'border-l border-r-0'
         )}
      >
         {children}
      </div>
   );

   return (
      <div
         data-resizable-sidebar={side}
         className={cn('relative h-full w-full hidden md:flex flex-col', className)}
      >
         {content}
      </div>
   );
}
