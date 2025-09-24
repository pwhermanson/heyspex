'use client';

import * as React from 'react';
import { cn } from '@/src/lib/lib/utils';

interface SplitHandleProps {
   'className'?: string;
   'aria-label'?: string;
   'currentHeight'?: number;
   'minHeight'?: number;
   'maxHeight'?: number;
   'onHeightChange'?: (height: number) => void;
   'onDragStart'?: (event: React.MouseEvent) => void;
   'onDragEnd'?: () => void;
   'isDragging'?: boolean;
}

export function SplitHandle({
   className,
   'aria-label': ariaLabel = 'Bottom panel split handle',
   currentHeight = 0,
   minHeight = 0,
   maxHeight = 500,
   onHeightChange,
   onDragStart,
   onDragEnd,
   isDragging = false,
}: SplitHandleProps) {
   const [isInternalDragging, setIsInternalDragging] = React.useState(false);
   const dragStartYRef = React.useRef(0);
   const dragStartHeightRef = React.useRef(0);
   const isDraggingRef = React.useRef(false);

   // Handle mouse drag
   const handleDragMove = React.useCallback(
      (event: MouseEvent) => {
         if (!isDraggingRef.current || !onHeightChange) return;

         event.preventDefault();

         // Dragging up (smaller clientY) increases height; dragging down (larger clientY) decreases height
         const deltaY = dragStartYRef.current - event.clientY; // Positive when dragging up
         const proposedHeight = Math.max(minHeight, dragStartHeightRef.current + deltaY);
         const clampedHeight = Math.min(maxHeight, proposedHeight);

         onHeightChange(clampedHeight);
      },
      [minHeight, maxHeight, onHeightChange]
   );

   const handleDragEndInternal = React.useCallback(() => {
      if (!isDraggingRef.current) return;

      isDraggingRef.current = false;
      setIsInternalDragging(false);
      document.body.classList.remove('select-none', 'sidebar-dragging');

      // Remove global mouse event listeners
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEndInternal);
      document.removeEventListener('mouseleave', handleDragEndInternal);

      // Call external drag end handler
      onDragEnd?.();
   }, [handleDragMove, onDragEnd]);

   const handleDragStartInternal = React.useCallback(
      (event: React.MouseEvent) => {
         // If external drag start handler is provided, use it instead of internal logic
         if (onDragStart) {
            onDragStart(event);
            return;
         }

         event.preventDefault();
         event.stopPropagation();

         isDraggingRef.current = true;
         setIsInternalDragging(true);
         dragStartYRef.current = event.clientY;
         dragStartHeightRef.current = currentHeight;

         // Prevent text selection and add dragging class
         document.body.classList.add('select-none', 'sidebar-dragging');

         // Add global mouse event listeners
         document.addEventListener('mousemove', handleDragMove, { passive: false });
         document.addEventListener('mouseup', handleDragEndInternal);
         document.addEventListener('mouseleave', handleDragEndInternal);
      },
      [currentHeight, handleDragMove, handleDragEndInternal, onDragStart]
   );

   // Handle keyboard navigation
   const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent) => {
         if (!onHeightChange) return;

         const step = event.shiftKey ? 40 : 10;
         let newHeight = currentHeight;

         switch (event.key) {
            case 'ArrowUp':
               event.preventDefault();
               newHeight = Math.min(maxHeight, currentHeight + step);
               break;
            case 'ArrowDown':
               event.preventDefault();
               newHeight = Math.max(minHeight, currentHeight - step);
               break;
            case 'PageUp':
               event.preventDefault();
               newHeight = Math.min(maxHeight, currentHeight + 40);
               break;
            case 'PageDown':
               event.preventDefault();
               newHeight = Math.max(minHeight, currentHeight - 40);
               break;
            case 'Home':
               event.preventDefault();
               newHeight = minHeight;
               break;
            case 'End':
               event.preventDefault();
               newHeight = maxHeight;
               break;
            case 'Escape':
               event.preventDefault();
               // Blur the handle on escape
               (event.target as HTMLElement)?.blur();
               return;
            default:
               return;
         }

         onHeightChange(newHeight);
      },
      [currentHeight, minHeight, maxHeight, onHeightChange]
   );

   // Cleanup on unmount
   React.useEffect(() => {
      return () => {
         if (isDraggingRef.current) {
            document.removeEventListener('mousemove', handleDragMove);
            document.removeEventListener('mouseup', handleDragEndInternal);
            document.removeEventListener('mouseleave', handleDragEndInternal);
            document.body.classList.remove('select-none', 'sidebar-dragging');
         }
      };
   }, [handleDragMove, handleDragEndInternal]);

   const activeDragging = isDragging || isInternalDragging;

   return (
      <div
         className={cn(
            // Split handle with accessible hit area
            'relative h-2 cursor-grab active:cursor-grabbing flex items-center justify-center group',
            'select-none touch-none', // Prevent text selection and touch scrolling
            // Background and border styling with drag states
            activeDragging
               ? 'bg-blue-500/30 border-blue-500/50'
               : 'bg-border/50 hover:bg-border transition-colors duration-200',
            'border-t border-b border-gray-200 dark:border-gray-700/30',
            // Motion handling - disable transitions during drag
            activeDragging
               ? 'motion-reduce:transition-none'
               : 'motion-reduce:transition-none transition-colors',
            className
         )}
         role="separator"
         aria-orientation="horizontal"
         aria-label={`${ariaLabel}: ${currentHeight}px`}
         aria-valuenow={currentHeight}
         aria-valuemin={minHeight}
         aria-valuemax={maxHeight}
         tabIndex={0}
         onMouseDown={handleDragStartInternal}
         onKeyDown={handleKeyDown}
      >
         {/* Visual grip indicator */}
         <div
            className={cn(
               'w-12 h-1 rounded-full transition-colors duration-200',
               activeDragging
                  ? 'bg-blue-500'
                  : 'bg-border/70 group-hover:bg-foreground/50 group-focus:bg-foreground/50',
               'motion-reduce:transition-none'
            )}
         />

         {/* Expanded hover/focus area for better accessibility */}
         <div className="absolute inset-x-0 -inset-y-2" aria-hidden="true" />
      </div>
   );
}
