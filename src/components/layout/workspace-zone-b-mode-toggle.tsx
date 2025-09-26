import React from 'react';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/lib/utils';

export type WorkspaceZoneBMode = 'push' | 'overlay';

interface WorkspaceZoneBModeToggleProps {
   mode: WorkspaceZoneBMode;
   onChange: (mode: WorkspaceZoneBMode) => void;
   className?: string;
}

export function WorkspaceZoneBModeToggle({
   mode,
   onChange,
   className = '',
}: WorkspaceZoneBModeToggleProps) {
   const isOverlay = mode === 'overlay';

   const toggleOverlay = () => {
      onChange(isOverlay ? 'push' : 'overlay');
   };

   return (
      <div
         aria-label="Overlay mode toggle"
         className={cn('inline-flex items-center text-xs select-none', className)}
      >
         <Button
            type="button"
            aria-pressed={isOverlay}
            onClick={toggleOverlay}
            variant="ghost"
            size="xs"
            className={cn(
               'px-1.5 py-0.5 h-6',
               isOverlay
                  ? 'bg-muted/20 text-foreground border border-border'
                  : 'text-muted-foreground hover:bg-muted/40 hover:!text-icon-hover'
            )}
            title={isOverlay ? 'Disable overlay mode' : 'Enable overlay mode'}
            aria-label={isOverlay ? 'Disable overlay mode' : 'Enable overlay mode'}
         >
            Overlay Mode
         </Button>
      </div>
   );
}
