'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useResizableSidebar } from './resizable-sidebar-provider';

interface SidebarDragHandleProps {
  side: 'left' | 'right';
  className?: string;
}

export function SidebarDragHandle({ side, className }: SidebarDragHandleProps) {
  const {
    leftSidebar,
    rightSidebar,
    setLeftSidebarWidth,
    setRightSidebarWidth,
    isDragging,
    setIsDragging,
    dragSide,
    setDragSide,
    updateGridLayout
  } = useResizableSidebar();

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      // Clean up any pending animation frames and body class
      document.body.classList.remove('sidebar-dragging');
    };
  }, []);

  const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();

    // Only allow dragging if the sidebar is open
    const currentSidebar = side === 'left' ? leftSidebar : rightSidebar;
    if (!currentSidebar.isOpen) return;

    setIsDragging(true);
    setDragSide(side);

    // Add dragging class to body to prevent text selection
    document.body.classList.add('sidebar-dragging');

    const startX = e.clientX;
    const startWidth = currentSidebar.width;
    const otherSidebar = side === 'left' ? rightSidebar : leftSidebar;

    // Use throttled updates for better performance
    let lastUpdateTime = 0;
    const THROTTLE_MS = 16; // ~60fps

    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastUpdateTime < THROTTLE_MS) return;

      lastUpdateTime = now;

      const deltaX = e.clientX - startX;
      const newWidth = side === 'left'
        ? startWidth + deltaX
        : startWidth - deltaX;

      // Clamp width to prevent invalid values
      const clampedWidth = Math.max(200, Math.min(500, newWidth));

      // Update CSS custom properties directly for immediate visual feedback
      const leftWidth = side === 'left' ? clampedWidth : leftSidebar.width;
      const rightWidth = side === 'right' ? clampedWidth : rightSidebar.width;
      const effectiveLeftWidth = leftSidebar.isOpen ? leftWidth : 0;
      const effectiveRightWidth = rightSidebar.isOpen ? rightWidth : 0;

      document.documentElement.style.setProperty('--sidebar-left-width', `${effectiveLeftWidth}px`);
      document.documentElement.style.setProperty('--sidebar-right-width', `${effectiveRightWidth}px`);
      document.documentElement.style.setProperty(
        '--grid-template-columns',
        `${effectiveLeftWidth}px 1fr ${effectiveRightWidth}px`
      );
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDragSide(null);
      document.body.classList.remove('sidebar-dragging');

      // Get final width from CSS custom property and update state
      const finalLeftWidth = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--sidebar-left-width').replace('px', ''),
        10
      );
      const finalRightWidth = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--sidebar-right-width').replace('px', ''),
        10
      );

      // Update the actual state with final width
      if (side === 'left' && !isNaN(finalLeftWidth) && leftSidebar.isOpen) {
        setLeftSidebarWidth(finalLeftWidth);
      } else if (side === 'right' && !isNaN(finalRightWidth) && rightSidebar.isOpen) {
        setRightSidebarWidth(finalRightWidth);
      }

      // Ensure grid layout is synced
      updateGridLayout();

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [
    side,
    leftSidebar,
    rightSidebar,
    setLeftSidebarWidth,
    setRightSidebarWidth,
    setIsDragging,
    setDragSide,
    updateGridLayout
  ]);

  const isActive = isDragging && dragSide === side;

  return (
    <div
      className={cn(
        'absolute top-0 bottom-0 w-1 cursor-col-resize group z-50 sidebar-drag-handle',
        side === 'left' ? 'right-0' : 'left-0',
        'hover:bg-blue-500/30 transition-all duration-200',
        isActive && 'bg-blue-500/50',
        isDragging && dragSide !== side && 'pointer-events-none',
        className
      )}
      onMouseDown={handleMouseDown}
    >
      {/* Visual indicator line - more prominent on hover */}
      <div
        className={cn(
          'absolute top-0 bottom-0 w-0.5 bg-transparent group-hover:bg-blue-500 transition-all duration-200',
          side === 'left' ? 'right-0' : 'left-0',
          isActive && 'bg-blue-500'
        )}
      />

      {/* Wider invisible hit area for easier grabbing */}
      <div
        className={cn(
          'absolute top-0 bottom-0 w-3 cursor-col-resize',
          side === 'left' ? '-right-1' : '-left-1'
        )}
      />

      {/* Hover indicator - subtle background highlight */}
      <div
        className={cn(
          'absolute top-0 bottom-0 w-1 bg-transparent group-hover:bg-blue-500/10 transition-colors duration-200',
          side === 'left' ? 'right-0' : 'left-0'
        )}
      />
    </div>
  );
}
