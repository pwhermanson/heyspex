'use client';

import { Button } from '@/src/components/ui/button';
import { SidebarClosedIcon, SidebarRightOpenIcon } from '@/src/components/ui/sidebar-icons';
import { useResizableSidebar } from './workspace-zone-a-panels-provider';

export function WorkspaceZoneAPanelCTrigger() {
   const { rightSidebar, setWorkspaceZoneAPanelCOpen } = useResizableSidebar();

   return (
      <Button
         variant="ghost"
         size="icon"
         className="h-7 w-7 text-muted-foreground hover:!text-icon-hover"
         onClick={() => setWorkspaceZoneAPanelCOpen(!rightSidebar.isOpen)}
         title={
            rightSidebar.isOpen ? 'Hide Workspace Zone A Panel C' : 'Show Workspace Zone A Panel C'
         }
         aria-label={
            rightSidebar.isOpen ? 'Hide Workspace Zone A Panel C' : 'Show Workspace Zone A Panel C'
         }
      >
         {rightSidebar.isOpen ? (
            <SidebarRightOpenIcon size={16} color="currentColor" />
         ) : (
            <SidebarClosedIcon size={16} color="currentColor" />
         )}
         <span className="sr-only">Toggle Workspace Zone A Panel C</span>
      </Button>
   );
}
