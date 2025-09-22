'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useResizableSidebar } from './resizable-sidebar-provider';
import { SidebarDragHandle } from './sidebar-drag-handle';

interface ResizableSidebarProps {
  side: 'left' | 'right';
  children: React.ReactNode;
  className?: string;
}

export function ResizableSidebar({ side, children, className }: ResizableSidebarProps) {
  const {
    leftSidebar,
    rightSidebar,
  } = useResizableSidebar();

  const sidebarState = side === 'left' ? leftSidebar : rightSidebar;

  // Don't render if sidebar is closed
  if (!sidebarState.isOpen) {
    return null;
  }

  return (
    <div
      data-resizable-sidebar={side}
      className={cn(
        'relative h-full w-full hidden md:flex flex-col',
        className
      )}
    >
      <div
        className={cn(
          'bg-container flex h-full w-full flex-col border shadow-sm relative lg:rounded-md overflow-hidden',
          side === 'right' && 'border-l border-r-0'
        )}
      >
        {children}

        {/* Drag handle - positioned absolutely within the sidebar */}
        <SidebarDragHandle side={side} />
      </div>
    </div>
  );
}
