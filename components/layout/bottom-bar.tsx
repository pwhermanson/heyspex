'use client';

import * as React from 'react';
import { BottomBarToggleButton } from './bottom-bar-toggle-button';
import { cn } from '@/lib/utils';

export type BottomBarMode = 'push' | 'overlay';

interface BottomBarProps {
  mode: BottomBarMode;
  onModeChange: (mode: BottomBarMode) => void;
  height: number;
  isOverlay?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function BottomBar({
  mode,
  onModeChange,
  height,
  isOverlay = false,
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
      {/* Bottom Bar Header with Toggle */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30 min-h-[40px]">
        <div className="flex items-center gap-2">
          <BottomBarToggleButton
            mode={mode}
            onToggle={onModeChange}
            size={28}
            className="border-border bg-background hover:bg-muted"
          />
          <span className="text-sm font-medium text-muted-foreground">
            Console
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Future: Add minimize, maximize buttons here */}
          <span className="text-xs text-muted-foreground">
            {mode === 'push' ? 'Docked' : 'Overlay'}
          </span>
        </div>
      </div>

      {/* Bottom Bar Content */}
      <div className="flex-1 overflow-auto p-4">
        {children || (
          <div className="text-sm text-muted-foreground">
            <p>Bottom bar content area</p>
            <p className="mt-2">
              Mode: <strong>{mode}</strong> | Height: <strong>{height}px</strong>
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