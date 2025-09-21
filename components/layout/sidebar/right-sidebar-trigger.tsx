'use client';

import { Button } from '@/components/ui/button';
import { SidebarClosedIcon, SidebarRightOpenIcon } from '@/components/ui/sidebar-icons';
import { useRightSidebar } from './right-sidebar-provider';

export function RightSidebarTrigger() {
   const { isOpen, toggleSidebar } = useRightSidebar();

   return (
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleSidebar}>
         {isOpen ? (
            <SidebarRightOpenIcon size={16} color="currentColor" />
         ) : (
            <SidebarClosedIcon size={16} color="currentColor" />
         )}
         <span className="sr-only">Toggle Right Sidebar</span>
      </Button>
   );
}
