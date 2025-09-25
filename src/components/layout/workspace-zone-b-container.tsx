import React from 'react';
import { cn } from '@/src/lib/lib/utils';

export type BottomBarMode = 'push' | 'overlay';

interface WorkspaceZoneBContainerProps {
   mode: BottomBarMode;
   height: number;
   children: React.ReactNode;
   className?: string;
}

export function WorkspaceZoneBContainer({
   mode,
   height,
   children,
   className,
}: WorkspaceZoneBContainerProps) {
   const isOverlay = mode === 'overlay';

   if (isOverlay) {
      // Overlay mode - fixed positioning
      return (
         <div
            className={cn(
               'fixed left-0 right-0 z-[100] workspace-zone-b workspace-zone-b-overlay',
               className
            )}
            style={{
               bottom: '0px',
               height: `${height}px`,
               backgroundColor: 'var(--workspace-zone-b-bg)',
               background: 'var(--workspace-zone-b-bg)',
            }}
         >
            {children}
         </div>
      );
   }

   // Push mode - relative positioning in grid
   return (
      <div
         className={cn(
            'relative overflow-hidden z-[50] px-2 workspace-zone-b workspace-zone-b-push',
            className
         )}
      >
         {children}
      </div>
   );
}
