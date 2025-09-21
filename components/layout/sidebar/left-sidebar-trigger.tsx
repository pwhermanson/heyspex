'use client';

import { Button } from '@/components/ui/button';
import { SidebarClosedIcon, SidebarOpenIcon } from '@/components/ui/sidebar-icons';
import { useResizableSidebar } from './resizable-sidebar-provider';
import { cn } from '@/lib/utils';
import * as React from 'react';

export function LeftSidebarTrigger({ className, onClick, ...props }: React.ComponentProps<typeof Button>) {
  const { leftSidebar, toggleLeftSidebar } = useResizableSidebar();

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      className={cn('h-7 w-7', className)}
      onClick={(event) => {
        onClick?.(event);
        toggleLeftSidebar();
      }}
      {...props}
    >
      {!leftSidebar.isOpen ? (
        <SidebarClosedIcon size={16} color="currentColor" />
      ) : (
        <SidebarOpenIcon size={16} color="currentColor" />
      )}
      <span className="sr-only">Toggle Left Sidebar</span>
    </Button>
  );
}