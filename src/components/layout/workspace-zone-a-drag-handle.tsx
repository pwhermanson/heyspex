'use client';

import * as React from 'react';
import { cn } from '@/src/lib/lib/utils';
import { useResizablePanel } from './workspace-zone-a-panels/workspace-zone-a-panels-provider';
import { ZIndex } from '@/src/lib/z-index-management';

interface WorkspaceZoneADragHandleProps {
   onMouseDown?: (e: React.MouseEvent) => void;
   isDragging?: boolean;
   className?: string;
   side: 'left' | 'right';
}

export function WorkspaceZoneADragHandle({
   onMouseDown,
   className,
   side,
}: WorkspaceZoneADragHandleProps) {
   const { workspaceZoneA, setWorkspaceZoneA, dragState, setDragState } = useResizablePanel();

   const handleMouseDown = React.useCallback(
      (event: React.MouseEvent) => {
         // If external drag start handler is provided, use it instead of internal logic
         if (onMouseDown) {
            onMouseDown(event);
            return;
         }

         event.preventDefault();
         event.stopPropagation();

         setDragState((prev) => ({ ...prev, isDragging: true, dragSide: side }));

         // Add dragging class to body for transition disabling
         document.body.classList.add('sidebar-dragging');
         document.documentElement.classList.add('sidebar-dragging');

         const startX = event.clientX;
         const startLeftWidth = workspaceZoneA.leftPanel.width;
         const startRightWidth = workspaceZoneA.rightPanel.width;

         const minPanelWidth = 200;
         // No maximum width restriction - panels can be as wide as needed

         // Use throttled updates for better performance
         let lastUpdateTime = 0;
         const THROTTLE_MS = 16; // ~60fps

         const handleMouseMove = (e: MouseEvent) => {
            const now = performance.now();
            if (now - lastUpdateTime < THROTTLE_MS) return;

            lastUpdateTime = now;

            const deltaX = e.clientX - startX;
            let newLeftWidth = startLeftWidth;
            let newRightWidth = startRightWidth;

            if (side === 'left') {
               // Dragging left panel
               newLeftWidth = startLeftWidth + deltaX;
               newLeftWidth = Math.max(minPanelWidth, newLeftWidth); // Only minimum constraint
            } else {
               // Dragging right panel
               newRightWidth = startRightWidth - deltaX;
               newRightWidth = Math.max(minPanelWidth, newRightWidth); // Only minimum constraint
            }

            // Update panel widths
            setWorkspaceZoneA((prev) => ({
               ...prev,
               leftPanel: {
                  ...prev.leftPanel,
                  width: newLeftWidth,
                  preferredWidth: newLeftWidth,
               },
               rightPanel: {
                  ...prev.rightPanel,
                  width: newRightWidth,
                  preferredWidth: newRightWidth,
               },
            }));
         };

         const handleMouseUp = () => {
            setDragState((prev) => ({ ...prev, isDragging: false, dragSide: null }));
            document.body.classList.remove('sidebar-dragging');
            document.documentElement.classList.remove('sidebar-dragging');

            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
         };

         document.addEventListener('mousemove', handleMouseMove);
         document.addEventListener('mouseup', handleMouseUp);
      },
      [
         onMouseDown,
         workspaceZoneA.leftPanel.width,
         workspaceZoneA.rightPanel.width,
         setWorkspaceZoneA,
         setDragState,
         side,
      ]
   );

   return (
      <div
         className={cn(
            'absolute top-0 bottom-0 w-2 cursor-col-resize group select-none touch-none pointer-events-auto',
            'transition-all layout-transition-short motion-reduce:transition-none',
            side === 'left' ? 'left-0' : 'right-0',
            className
         )}
         style={{
            ...ZIndex.utils.getStyle('DRAG_HANDLES'),
            [side === 'left' ? 'left' : 'right']:
               side === 'left'
                  ? `${workspaceZoneA.leftPanel.width}px`
                  : `${workspaceZoneA.rightPanel.width}px`,
            transform: side === 'left' ? 'translateX(-50%)' : 'translateX(50%)',
         }}
         onMouseDown={handleMouseDown}
         role="separator"
         aria-orientation="vertical"
         aria-label={`Resize ${side} panel`}
      >
         {/* Drag bar - faint white vertical line that appears on hover */}
         <div
            className={cn(
               'absolute top-0 bottom-0 w-px bg-transparent transition-colors layout-transition-short motion-reduce:transition-none',
               'group-hover:bg-white/30',
               dragState.isDragging && dragState.dragSide === side && 'bg-white/30'
            )}
            style={{
               left: side === 'left' ? '50%' : '50%',
               transform: 'translateX(-50%)',
            }}
         />

         {/* Drag icon - appears on hover */}
         <div
            className={cn(
               'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
               'w-4 h-4 rounded-full bg-white/20 border border-white/30',
               'opacity-0 group-hover:opacity-100 transition-opacity layout-transition-short motion-reduce:transition-none',
               'flex items-center justify-center',
               dragState.isDragging && dragState.dragSide === side && 'opacity-100'
            )}
         >
            <svg
               width="8"
               height="8"
               viewBox="0 0 8 8"
               fill="none"
               xmlns="http://www.w3.org/2000/svg"
               className="text-white/70"
            >
               <path
                  d="M2 1H6M2 3H6M2 5H6M2 7H6"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
               />
            </svg>
         </div>

         {/* Invisible hit area for easier dragging */}
         <div className="absolute inset-0 cursor-col-resize" />
      </div>
   );
}
