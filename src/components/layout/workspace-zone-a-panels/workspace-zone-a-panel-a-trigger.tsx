'use client';

import { Button } from '@/src/components/ui/button';
import { PanelClosedIcon, PanelOpenIcon } from '@/src/components/ui/sidebar-icons';
import { useResizablePanel } from './workspace-zone-a-panels-provider';
import { cn } from '@/src/lib/lib/utils';
import { useFeatureFlag } from '@/src/lib/hooks/use-feature-flag';
import * as React from 'react';

export function WorkspaceZoneAPanelATrigger({
   className,
   onClick,
   ...props
}: React.ComponentProps<typeof Button>) {
   const { leftPanel, leftState, toggleLeftPanel } = useResizablePanel();
   const enableLeftRail = useFeatureFlag('enableLeftRail');

   // Determine icon state based on rail feature flag
   const isCollapsed = enableLeftRail ? leftState === 'collapsed' : !leftPanel.isOpen;

   return (
      <Button
         data-workspace-zone-a-panel-a="trigger"
         data-slot="workspace-zone-a-panel-a-trigger"
         variant="ghost"
         size="icon"
         className={cn('h-7 w-7 text-muted-foreground hover:!text-icon-hover', className)}
         onClick={(event) => {
            onClick?.(event);
            toggleLeftPanel();
         }}
         {...props}
      >
         {isCollapsed ? (
            <PanelClosedIcon size={16} color="currentColor" />
         ) : (
            <PanelOpenIcon size={16} color="currentColor" />
         )}
         <span className="sr-only">Toggle Workspace Zone A Panel A</span>
      </Button>
   );
}
