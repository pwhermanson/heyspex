import React from 'react';
import { cn } from '@/src/lib/lib/utils';
import { ZIndex } from '@/src/lib/z-index-management';

export type WorkspaceZoneBMode = 'push' | 'overlay';

interface WorkspaceZoneBContainerProps {
   mode: WorkspaceZoneBMode;
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
               'fixed left-0 right-0 workspace-zone-b workspace-zone-b-overlay',
               ZIndex.utils.getTailwindClass('WORKSPACE_ZONE_B_OVERLAY'),
               className
            )}
            style={{
               bottom: '0px',
               height: `${height}px`,
               backgroundColor: 'var(--workspace-zone-b-bg) !important',
               background: 'var(--workspace-zone-b-bg) !important',
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
            'relative overflow-hidden px-2 workspace-zone-b workspace-zone-b-push',
            ZIndex.utils.getTailwindClass('WORKSPACE_ZONE_B_PUSH'),
            className
         )}
         style={{
            backgroundColor: 'var(--workspace-zone-b-bg) !important',
            background: 'var(--workspace-zone-b-bg) !important',
         }}
      >
         {children}
      </div>
   );
}
