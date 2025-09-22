'use client';

import { Button } from '@/components/ui/button';
import { SidebarClosedIcon, SidebarOpenIcon } from '@/components/ui/sidebar-icons';
import { useResizableSidebar } from './resizable-sidebar-provider';
import { cn } from '@/lib/utils';
import { useFeatureFlag } from '@/hooks/use-feature-flag';
import * as React from 'react';

export function LeftSidebarTrigger({ className, onClick, ...props }: React.ComponentProps<typeof Button>) {
  const { leftSidebar, leftState, toggleLeftSidebar } = useResizableSidebar();
  const enableLeftRail = useFeatureFlag('enableLeftRail');

  // Determine icon state based on rail feature flag
  const isCollapsed = enableLeftRail ? leftState === 'collapsed' : !leftSidebar.isOpen;

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
      {isCollapsed ? (
        <SidebarClosedIcon size={16} color="currentColor" />
      ) : (
        <SidebarOpenIcon size={16} color="currentColor" />
      )}
      <span className="sr-only">Toggle Left Sidebar</span>
    </Button>
  );
}