'use client';

import * as React from 'react';
import { BottomBarModeToggle, type BottomBarMode } from './bottom-bar-mode-toggle';
import { Button } from '@/components/ui/button';
import { X, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomBarProps {
  mode: BottomBarMode;
  onModeChange: (mode: BottomBarMode) => void;
  height: number;
  isOverlay?: boolean;
  onClose?: () => void;
  onMinimize?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function BottomBar({
  mode,
  onModeChange,
  height,
  isOverlay = false,
  onClose,
  onMinimize,
  className,
  children
}: BottomBarProps) {
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
          <span className="text-sm font-medium text-foreground">
            Output Panel
          </span>

          <BottomBarModeToggle
            mode={mode}
            onChange={onModeChange}
            className="scale-75"
          />
        </div>

        <div className="flex items-center gap-1">
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

      {/* Bottom Bar Content */}
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
    </div>
  );
}