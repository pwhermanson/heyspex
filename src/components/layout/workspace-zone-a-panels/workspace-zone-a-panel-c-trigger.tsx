'use client';

import { Button } from '@/src/components/ui/button';
import { PanelClosedIcon, PanelRightOpenIcon } from '@/src/components/ui/sidebar-icons';
import { useResizablePanel } from './workspace-zone-a-panels-provider';

export function WorkspaceZoneAPanelCTrigger() {
   const { rightPanel, setWorkspaceZoneAPanelCOpen } = useResizablePanel();

   return (
      <Button
         variant="ghost"
         size="icon"
         className="h-7 w-7 text-muted-foreground hover:!text-icon-hover"
         onClick={() => setWorkspaceZoneAPanelCOpen(!rightPanel.isOpen)}
         title={
            rightPanel.isOpen ? 'Hide Workspace Zone A Panel C' : 'Show Workspace Zone A Panel C'
         }
         aria-label={
            rightPanel.isOpen ? 'Hide Workspace Zone A Panel C' : 'Show Workspace Zone A Panel C'
         }
      >
         {rightPanel.isOpen ? (
            <PanelRightOpenIcon size={16} color="currentColor" />
         ) : (
            <PanelClosedIcon size={16} color="currentColor" />
         )}
         <span className="sr-only">Toggle Workspace Zone A Panel C</span>
      </Button>
   );
}
