import React from 'react';

export type BottomBarMode = 'push' | 'overlay';

interface BottomBarModeToggleProps {
  mode: BottomBarMode;
  onChange: (mode: BottomBarMode) => void;
  className?: string;
}

export function BottomBarModeToggle({ mode, onChange, className = '' }: BottomBarModeToggleProps) {
  const isOverlay = mode === 'overlay';

  const toggleOverlay = () => {
    onChange(isOverlay ? 'push' : 'overlay');
  };

  return (
    <div
      aria-label="Overlay mode toggle"
      className={`inline-flex items-center text-xs select-none ${className}`}
    >
      <button
        type="button"
        aria-pressed={isOverlay}
        onClick={toggleOverlay}
        className={`px-1.5 py-0.5 rounded-sm transition-colors ${
          isOverlay
            ? 'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80'
            : 'text-muted-foreground hover:bg-muted/20 hover:text-foreground'
        }`}
        title={isOverlay ? 'Disable overlay mode' : 'Enable overlay mode'}
        aria-label={isOverlay ? 'Disable overlay mode' : 'Enable overlay mode'}
      >
        Overlay Mode
      </button>
    </div>
  );
}