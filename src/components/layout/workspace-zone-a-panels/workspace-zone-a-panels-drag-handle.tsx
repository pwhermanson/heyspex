'use client';

import * as React from 'react';
import { cn } from '@/src/lib/lib/utils';
import { useResizablePanel } from './workspace-zone-a-panels-provider';

interface WorkspaceZoneAPanelsDragHandleProps {
   side: 'left' | 'right';
   className?: string;
}

export function WorkspaceZoneAPanelsDragHandle({
   side,
   className,
}: WorkspaceZoneAPanelsDragHandleProps) {
   const {
      leftPanel,
      rightPanel,
      setLeftPanelWidth,
      setWorkspaceZoneAPanelCWidth,
      setLeftPanelOpen,
      setWorkspaceZoneAPanelCOpen,
      isDragging,
      setIsDragging,
      dragSide,
      setDragSide,
   } = useResizablePanel();

   // Cleanup on unmount
   React.useEffect(() => {
      return () => {
         // Clean up any pending animation frames and both classes
         document.body.classList.remove('workspace-zone-a-panels-dragging');
         document.documentElement.classList.remove('workspace-zone-a-panels-dragging');
      };
   }, []);

   const handleMouseDown = React.useCallback(
      (e: React.MouseEvent) => {
         e.preventDefault();

         const currentSidebar = side === 'left' ? leftPanel : rightPanel;

         // If sidebar is closed, open it first before allowing drag
         if (!currentSidebar.isOpen) {
            if (side === 'left') {
               setLeftPanelOpen(true);
            } else {
               setWorkspaceZoneAPanelCOpen(true);
            }
            // Small delay to allow the sidebar to open before starting drag
            setTimeout(() => {
               setIsDragging(true);
               setDragSide(side);
            }, 50);
         } else {
            setIsDragging(true);
            setDragSide(side);
         }

         // Add dragging class to both body and root for comprehensive transition disabling
         document.body.classList.add('workspace-zone-a-panels-dragging');
         document.documentElement.classList.add('workspace-zone-a-panels-dragging');

         const startX = e.clientX;
         const startWidth = currentSidebar.width;

         // Use throttled updates for better performance
         let lastUpdateTime = 0;
         const THROTTLE_MS = 16; // ~60fps

         const handleMouseMove = (e: MouseEvent) => {
            const now = performance.now();
            if (now - lastUpdateTime < THROTTLE_MS) return;

            lastUpdateTime = now;

            const deltaX = e.clientX - startX;
            const newWidth = side === 'left' ? startWidth + deltaX : startWidth - deltaX;

            // Clamp width to prevent invalid values
            const clampedWidth = Math.max(200, Math.min(500, newWidth));

            // Update CSS custom properties directly for immediate visual feedback
            const leftWidth = side === 'left' ? clampedWidth : leftPanel.width;
            const rightWidth = side === 'right' ? clampedWidth : rightPanel.width;
            const COLLAPSED_SPACING = 8; // 8px spacing when collapsed
            const effectiveLeftWidth = leftPanel.isOpen ? leftWidth : COLLAPSED_SPACING;
            const effectiveRightWidth = rightPanel.isOpen ? rightWidth : COLLAPSED_SPACING;

            const rootStyle = document.documentElement.style;
            rootStyle.setProperty('--left-width', `${effectiveLeftWidth}px`);
            rootStyle.setProperty('--right-width', `${effectiveRightWidth}px`);
            rootStyle.setProperty('--sidebar-left-width', `${effectiveLeftWidth}px`);
            rootStyle.setProperty('--sidebar-right-width', `${effectiveRightWidth}px`);
            rootStyle.setProperty(
               '--grid-template-columns',
               `${effectiveLeftWidth}px 1fr ${effectiveRightWidth}px`
            );
         };

         const handleMouseUp = () => {
            setIsDragging(false);
            setDragSide(null);
            document.body.classList.remove('workspace-zone-a-panels-dragging');
            document.documentElement.classList.remove('workspace-zone-a-panels-dragging');

            // Get final width from CSS custom property and update state
            const rootStyle = document.documentElement.style;
            const computedStyles = getComputedStyle(document.documentElement);

            const readWidth = (primaryVar: string, legacyVar: string, fallback: number) => {
               const primary = computedStyles.getPropertyValue(primaryVar).trim();
               const legacy = computedStyles.getPropertyValue(legacyVar).trim();
               const target = primary || legacy;
               const parsed = parseInt(target.replace('px', ''), 10);
               return Number.isNaN(parsed) ? fallback : parsed;
            };

            const finalLeftWidth = readWidth(
               '--left-width',
               '--sidebar-left-width',
               leftPanel.width
            );
            const finalRightWidth = readWidth(
               '--right-width',
               '--sidebar-right-width',
               rightPanel.width
            );

            const COLLAPSED_SPACING = 8; // 8px spacing when collapsed
            const nextLeftWidth = leftPanel.isOpen ? finalLeftWidth : COLLAPSED_SPACING;
            const nextRightWidth = rightPanel.isOpen ? finalRightWidth : COLLAPSED_SPACING;

            rootStyle.setProperty('--left-width', `${nextLeftWidth}px`);
            rootStyle.setProperty('--right-width', `${nextRightWidth}px`);
            rootStyle.setProperty('--sidebar-left-width', `${nextLeftWidth}px`);
            rootStyle.setProperty('--sidebar-right-width', `${nextRightWidth}px`);
            rootStyle.setProperty(
               '--grid-template-columns',
               `${nextLeftWidth}px 1fr ${nextRightWidth}px`
            );

            if (side === 'left' && leftPanel.isOpen) {
               setLeftPanelWidth(nextLeftWidth);
            } else if (side === 'right' && rightPanel.isOpen) {
               setWorkspaceZoneAPanelCWidth(nextRightWidth);
            }

            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
         };

         document.addEventListener('mousemove', handleMouseMove);
         document.addEventListener('mouseup', handleMouseUp);
      },
      [
         side,
         leftPanel,
         rightPanel,
         setLeftPanelWidth,
         setWorkspaceZoneAPanelCWidth,
         setLeftPanelOpen,
         setWorkspaceZoneAPanelCOpen,
         setIsDragging,
         setDragSide,
      ]
   );

   const isActive = isDragging && dragSide === side;
   const currentSidebar = side === 'left' ? leftPanel : rightPanel;
   const isSidebarClosed = !currentSidebar.isOpen;

   return (
      <div
         className={cn(
            'w-full h-full cursor-grab active:cursor-grabbing group sidebar-drag-handle',
            'hover:bg-blue-500/30 transition-all layout-transition-short motion-reduce:transition-none',
            isActive && 'bg-blue-500/50',
            isSidebarClosed && 'bg-blue-500/20 hover:bg-blue-500/40', // More visible when closed
            isDragging && dragSide !== side && 'pointer-events-none',
            className
         )}
         onMouseDown={handleMouseDown}
      >
         {/* Visual indicator line - more prominent on hover and when closed */}
         <div
            className={cn(
               'absolute top-0 bottom-0 w-0.5 bg-transparent group-hover:bg-blue-500 transition-all layout-transition-short motion-reduce:transition-none',
               'left-1/2 transform -translate-x-1/2',
               isActive && 'bg-blue-500',
               isSidebarClosed && 'bg-blue-500/60 group-hover:bg-blue-500' // More visible when closed
            )}
         />

         {/* Wider invisible hit area for easier grabbing */}
         <div
            className={cn(
               'absolute top-0 bottom-0 w-4 cursor-grab active:cursor-grabbing',
               'left-1/2 transform -translate-x-1/2'
            )}
         />

         {/* Hover indicator - subtle background highlight */}
         <div
            className={cn(
               'absolute top-0 bottom-0 w-1 bg-transparent group-hover:bg-blue-500/10 transition-colors layout-transition-short motion-reduce:transition-none',
               'left-1/2 transform -translate-x-1/2'
            )}
         />
      </div>
   );
}
