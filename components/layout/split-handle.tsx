'use client';

import * as React from 'react';
import { useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';

interface SplitHandleProps {
  onHeightChange: (height: number) => void;
  currentHeight: number;
  minHeight?: number;
  maxHeight?: number;
  className?: string;
}

export function SplitHandle({
  onHeightChange,
  currentHeight,
  minHeight = 0,
  maxHeight = 300,
  className
}: SplitHandleProps) {
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    startHeightRef.current = currentHeight;

    // Capture pointer to ensure we get all pointer events
    (e.target as Element).setPointerCapture(e.pointerId);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!isDraggingRef.current) return;

      // Calculate new height based on upward drag (negative delta increases height)
      const deltaY = startYRef.current - moveEvent.clientY;
      const newHeight = Math.max(minHeight, Math.min(maxHeight, startHeightRef.current + deltaY));

      onHeightChange(newHeight);
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      isDraggingRef.current = false;
      (e.target as Element).releasePointerCapture(upEvent.pointerId);
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  }, [currentHeight, minHeight, maxHeight, onHeightChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 40 : 10;
    let newHeight = currentHeight;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        newHeight = Math.min(maxHeight, currentHeight + step);
        break;
      case 'ArrowDown':
        e.preventDefault();
        newHeight = Math.max(minHeight, currentHeight - step);
        break;
      case 'PageUp':
        e.preventDefault();
        newHeight = Math.min(maxHeight, currentHeight + 40);
        break;
      case 'PageDown':
        e.preventDefault();
        newHeight = Math.max(minHeight, currentHeight - 40);
        break;
      case 'Home':
        e.preventDefault();
        newHeight = minHeight;
        break;
      case 'End':
        e.preventDefault();
        newHeight = maxHeight;
        break;
      default:
        return;
    }

    onHeightChange(newHeight);
  }, [currentHeight, minHeight, maxHeight, onHeightChange]);

  return (
    <div
      className={cn(
        'h-2 cursor-row-resize flex items-center justify-center bg-border hover:bg-border/80 transition-colors',
        'border-t border-b border-border/50',
        'group relative',
        className
      )}
      role="separator"
      aria-orientation="horizontal"
      aria-valuenow={currentHeight}
      aria-valuemin={minHeight}
      aria-valuemax={maxHeight}
      aria-label={`Adjust bottom panel height: ${currentHeight}px`}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
    >
      {/* Visual drag indicator */}
      <div className="w-12 h-1 bg-border rounded-full group-hover:bg-foreground/40 transition-colors" />

      {/* Expanded hover area for easier grabbing */}
      <div className="absolute inset-x-0 -inset-y-2" />
    </div>
  );
}