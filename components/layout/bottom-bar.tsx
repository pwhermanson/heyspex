'use client';

import * as React from 'react';
import { BottomBarModeToggle, type BottomBarMode } from './bottom-bar-mode-toggle';
import { Button } from '@/components/ui/button';
import { X, Minus, GripHorizontal, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useResizableSidebar } from '@/components/layout/sidebar/resizable-sidebar-provider';

interface BottomBarProps {
  mode: BottomBarMode;
  onModeChange: (mode: BottomBarMode) => void;
  height: number;
  isOverlay?: boolean;
  onClose?: () => void;
  onMinimize?: () => void;
  className?: string;
  children?: React.ReactNode;
  // Drag functionality props
  onDragStart?: (e: React.MouseEvent) => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
  dragHandleRef?: React.RefObject<HTMLDivElement>;
}

export function BottomBar({
  mode,
  onModeChange,
  height,
  isOverlay = false,
  onClose,
  onMinimize,
  className,
  children,
  onDragStart,
  onDragEnd,
  isDragging = false,
  dragHandleRef
}: BottomBarProps) {
  const isCollapsed = height <= 40; // Consider collapsed if height is 40px or less
  const { bottomBar: layoutBottomBar, setBottomBarHeight, setBottomBarMode } = useResizableSidebar();

  const isClient = typeof window !== 'undefined';
  const getMainTop = () => {
    if (!isClient) return 56;
    const el = document.querySelector('[data-main-container]') as HTMLElement | null;
    return el ? Math.round(el.getBoundingClientRect().top) : 56;
  };
  const maxHeight = layoutBottomBar.mode === 'overlay'
    ? (isClient ? Math.max(40, window.innerHeight - getMainTop()) : height)
    : 300;
  const isFull = height >= (maxHeight - 1);

  const handleToggleFull = () => {
    const target = isFull ? 40 : maxHeight;
    if (!isFull && layoutBottomBar.mode === 'push') {
      setBottomBarMode('overlay');
    }
    setBottomBarHeight(target);
  };

  return (
    <div
      className={cn(
        'bg-background border-t flex flex-col w-full',
        isOverlay && 'shadow-lg border-x rounded-t-lg',
        className
      )}
      style={{ height: `${height}px` }}
      role="contentinfo"
    >
      {/* Bottom Bar Header with Controls */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30 min-h-[40px]">
        <div className="flex items-center gap-3">
          {/* Drag Handle - only show in overlay mode */}
          {isOverlay && (
            <div
              ref={dragHandleRef}
              className={cn(
                "p-1 rounded hover:bg-muted/50 transition-colors select-none",
                isDragging ? "cursor-grabbing bg-muted/70" : "cursor-grab"
              )}
              onMouseDown={(e) => {
                console.log('Drag handle clicked', { isOverlay, onDragStart: !!onDragStart, mode });
                onDragStart?.(e);
              }}
              onMouseUp={() => onDragEnd?.()}
              title="Drag to resize panel"
            >
              <GripHorizontal
                className="h-3 w-3 text-muted-foreground"
                onMouseDown={(e) => {
                  // Ensure the icon itself also initiates dragging
                  e.preventDefault();
                  onDragStart?.(e);
                }}
                onMouseUp={() => onDragEnd?.()}
                draggable={false}
              />
            </div>
          )}
          
          <span className="text-sm font-medium text-foreground">
            Output Panel {isOverlay && '(OVERLAY MODE)'}
          </span>
          {isOverlay && (
            <span className="text-xs text-muted-foreground">
              Pos: {layoutBottomBar?.overlayPosition || 0}px
            </span>
          )}

          <BottomBarModeToggle
            mode={mode}
            onChange={onModeChange}
            className="scale-75"
          />
        </div>

        <div className="flex items-center gap-1">
          {/* Fullscreen / Collapse Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleFull}
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            aria-label={isFull ? 'Collapse panel' : 'Fullscreen panel'}
            title={isFull ? 'Collapse' : 'Fullscreen'}
          >
            {isFull ? (
              <Minimize2 className="h-3 w-3" />
            ) : (
              <Maximize2 className="h-3 w-3" />
            )}
          </Button>

          {/* Minimize Button */}
          {onMinimize && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMinimize}
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              aria-label="Minimize panel"
            >
              <Minus className="h-3 w-3" />
            </Button>
          )}

          {/* Close Button */}
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              aria-label="Close panel"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Bottom Bar Content - only show if not collapsed */}
      {!isCollapsed && (
        <div className="flex-1 overflow-auto p-4">
          {children || (
            <div className="text-sm text-muted-foreground">
              <p>Output panel content area</p>
              <p className="mt-2">
                Mode: <strong className="capitalize">{mode}</strong> | Height: <strong>{height}px</strong>
              </p>
              <p className="mt-1 text-xs">
                This area can be used for logs, terminal output, debugging info, or other developer tools.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}