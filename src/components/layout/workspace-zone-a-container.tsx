import React from 'react';
import { cn } from '@/src/lib/lib/utils';

export type WorkspaceZoneAMode = 'visible' | 'hidden';

interface WorkspaceZoneAContainerProps {
   isVisible: boolean;
   children: React.ReactNode;
   className?: string;
}

export function WorkspaceZoneAContainer({
   isVisible,
   children,
   className,
}: WorkspaceZoneAContainerProps) {
   return (
      <div
         className={cn(
            'workspace-zone-a',
            isVisible ? 'workspace-zone-a-visible' : 'workspace-zone-a-hidden',
            className
         )}
      >
         {children}
      </div>
   );
}
