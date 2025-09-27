import React from 'react';
import { cn } from '@/src/lib/lib/utils';

// Import the 3-way toggle mode type from the provider
export type WorkspaceZoneAMode = 'normal' | 'fullscreen' | 'hidden';

interface WorkspaceZoneAContainerProps {
   isVisible: boolean;
   mode?: WorkspaceZoneAMode;
   children: React.ReactNode;
   className?: string;
}

export function WorkspaceZoneAContainer({
   isVisible,
   mode = 'normal',
   children,
   className,
}: WorkspaceZoneAContainerProps) {
   return (
      <div
         className={cn(
            'workspace-zone-a',
            isVisible ? 'workspace-zone-a-visible' : 'workspace-zone-a-hidden',
            mode === 'fullscreen' && 'workspace-zone-a-fullscreen',
            className
         )}
      >
         {children}
      </div>
   );
}
