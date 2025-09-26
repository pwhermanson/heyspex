'use client';

import * as React from 'react';
import { cn } from '@/src/lib/lib/utils';
import { useResizableSidebar } from './workspace-zone-a-panels/workspace-zone-a-panels-provider';

interface WorkspaceZoneBDragHandleProps {
   onMouseDown?: (e: React.MouseEvent) => void;
   isDragging?: boolean;
   className?: string;
   mode?: 'push' | 'overlay';
}

export function WorkspaceZoneBDragHandle({
   onMouseDown,
   isDragging = false,
   className,
   mode = 'push',
}: WorkspaceZoneBDragHandleProps) {
   const { workspaceZoneB, setWorkspaceZoneBHeight, setIsDragging } = useResizableSidebar();

   const handleMouseDown = React.useCallback(
      (event: React.MouseEvent) => {
         // If external drag start handler is provided, use it instead of internal logic
         if (onMouseDown) {
            onMouseDown(event);
            return;
         }

         event.preventDefault();
         event.stopPropagation();

         setIsDragging(true);

         // Add dragging class to body for transition disabling
         document.body.classList.add('sidebar-dragging');
         document.documentElement.classList.add('sidebar-dragging');

         const startY = event.clientY;
         const startHeight = workspaceZoneB.height;

         // Helper function to get main container top position (same logic as WorkspaceZoneB component)
         const getMainTop = () => {
            if (typeof window === 'undefined') return 56;
            const el = document.querySelector('[data-main-container]') as HTMLElement | null;
            return el ? Math.round(el.getBoundingClientRect().top) : 56;
         };

         // Calculate max height based on mode
         const getMaxHeight = () => {
            const viewportHeight = window.innerHeight;
            if (mode === 'overlay') {
               return Math.max(40, viewportHeight - getMainTop());
            } else {
               return Math.max(40, Math.round(viewportHeight * 0.5));
            }
         };

         // Use throttled updates for better performance
         let lastUpdateTime = 0;
         const THROTTLE_MS = 16; // ~60fps

         const handleMouseMove = (e: MouseEvent) => {
            const now = performance.now();
            if (now - lastUpdateTime < THROTTLE_MS) return;

            lastUpdateTime = now;

            const deltaY = startY - e.clientY; // Inverted because dragging up should increase height
            const newHeight = startHeight + deltaY;
            const maxHeight = getMaxHeight();
            const clampedHeight = Math.max(40, Math.min(maxHeight, newHeight));

            // Update height immediately for visual feedback
            setWorkspaceZoneBHeight(clampedHeight);
         };

         const handleMouseUp = () => {
            setIsDragging(false);
            document.body.classList.remove('sidebar-dragging');
            document.documentElement.classList.remove('sidebar-dragging');

            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
         };

         document.addEventListener('mousemove', handleMouseMove);
         document.addEventListener('mouseup', handleMouseUp);
      },
      [onMouseDown, workspaceZoneB.height, setWorkspaceZoneBHeight, setIsDragging, mode]
   );

   return (
      <div
         className={cn(
            'absolute inset-x-0 top-0 h-2 cursor-grab active:cursor-grabbing group z-50 select-none touch-none pointer-events-auto',
            'transition-all layout-transition-short motion-reduce:transition-none',
            mode === 'overlay' && 'hover:bg-blue-500/30',
            mode === 'overlay' && isDragging && 'bg-blue-500/30',
            className
         )}
         onMouseDown={handleMouseDown}
         role="separator"
         aria-orientation="horizontal"
         aria-label="Resize output panel"
      >
         <div
            className={cn(
               'absolute inset-x-0 top-0 h-0.5 bg-transparent transition-colors layout-transition-short motion-reduce:transition-none',
               'group-hover:bg-blue-500',
               isDragging && 'bg-blue-500'
            )}
         />

         <div className="absolute inset-x-0 -top-2 h-4 cursor-grab active:cursor-grabbing" />

         <div className="absolute inset-x-0 top-0 h-full bg-transparent transition-colors layout-transition-short motion-reduce:transition-none group-hover:bg-blue-500/10" />
      </div>
   );
}
