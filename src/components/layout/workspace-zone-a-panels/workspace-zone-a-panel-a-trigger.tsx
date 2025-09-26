'use client';

import { Button } from '@/src/components/ui/button';
import { SidebarClosedIcon, SidebarOpenIcon } from '@/src/components/ui/sidebar-icons';
import { useResizableSidebar } from './workspace-zone-a-panels-provider';
import { cn } from '@/src/lib/lib/utils';
import { useFeatureFlag } from '@/src/lib/hooks/use-feature-flag';
import * as React from 'react';

export function WorkspaceZoneAPanelATrigger({
   className,
   onClick,
   ...props
}: React.ComponentProps<typeof Button>) {
   const { leftSidebar, leftState, toggleLeftSidebar } = useResizableSidebar();
   const enableLeftRail = useFeatureFlag('enableLeftRail');

   // Determine icon state based on rail feature flag
   const isCollapsed = enableLeftRail ? leftState === 'collapsed' : !leftSidebar.isOpen;

   return (
      <Button
         data-workspace-zone-a-panel-a="trigger"
         data-slot="workspace-zone-a-panel-a-trigger"
         variant="ghost"
         size="icon"
         className={cn('h-7 w-7 text-muted-foreground hover:!text-icon-hover', className)}
         onClick={(event) => {
            onClick?.(event);
            toggleLeftSidebar();
         }}
         {...props}
      >
         {isCollapsed ? (
            <SidebarClosedIcon size={16} color="currentColor" />
         ) : (
            <SidebarOpenIcon size={16} color="currentColor" />
         )}
         <span className="sr-only">Toggle Workspace Zone A Panel A</span>
      </Button>
   );
}
