'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface BottomDragHandleProps {
  onMouseDown?: (e: React.MouseEvent) => void;
  isDragging?: boolean;
  className?: string;
}

export function BottomDragHandle({
  onMouseDown,
  isDragging = false,
  className
}: BottomDragHandleProps) {
  const handleMouseDown = React.useCallback(
    (event: React.MouseEvent) => {
      onMouseDown?.(event);
    },
    [onMouseDown]
  );

  return (
    <div
      className={cn(
        'absolute inset-x-0 top-0 h-2 cursor-row-resize group z-50 select-none touch-none pointer-events-auto',
        'transition-all duration-200 ease-in-out hover:bg-blue-500/30',
        isDragging && 'bg-blue-500/30',
        className
      )}
      onMouseDown={handleMouseDown}
      role="separator"
      aria-orientation="horizontal"
      aria-label="Resize output panel"
    >
      <div
        className={cn(
          'absolute inset-x-0 top-0 h-0.5 bg-transparent transition-colors duration-200 ease-in-out',
          'group-hover:bg-blue-500',
          isDragging && 'bg-blue-500'
        )}
      />

      <div className="absolute inset-x-0 -top-2 h-4 cursor-row-resize" />

      <div
        className="absolute inset-x-0 top-0 h-full bg-transparent transition-colors duration-200 ease-in-out group-hover:bg-blue-500/10"
      />
    </div>
  );
}
