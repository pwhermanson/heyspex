'use client';

import { Button } from '@/src/components/ui/button';
import { SidebarClosedIcon, SidebarRightOpenIcon } from '@/src/components/ui/sidebar-icons';
import { useResizableSidebar } from './resizable-sidebar-provider';

export function RightSidebarTrigger() {
   const { rightSidebar, setRightSidebarOpen } = useResizableSidebar();

   return (
      <Button
         variant="ghost"
         size="icon"
         className="h-7 w-7"
         onClick={() => setRightSidebarOpen(!rightSidebar.isOpen)}
         title={rightSidebar.isOpen ? 'Hide right sidebar' : 'Show right sidebar'}
         aria-label={rightSidebar.isOpen ? 'Hide right sidebar' : 'Show right sidebar'}
      >
         {rightSidebar.isOpen ? (
            <SidebarRightOpenIcon size={16} color="currentColor" />
         ) : (
            <SidebarClosedIcon size={16} color="currentColor" />
         )}
         <span className="sr-only">Toggle Right Sidebar</span>
      </Button>
   );
}
