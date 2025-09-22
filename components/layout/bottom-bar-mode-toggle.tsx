import React from 'react';

export type BottomBarMode = 'push' | 'overlay';

interface BottomBarModeToggleProps {
  mode: BottomBarMode;
  onChange: (mode: BottomBarMode) => void;
  className?: string;
}

export function BottomBarModeToggle({ mode, onChange, className = '' }: BottomBarModeToggleProps) {
  const handleSelect = (next: BottomBarMode) => {
    if (next !== mode) onChange(next);
  };

  return (
    <div
      role="radiogroup"
      aria-label="Bottom panel mode"
      className={`inline-flex items-center text-xs select-none ${className}`}
    >
      <button
        type="button"
        role="radio"
        aria-checked={mode === 'push'}
        onClick={() => handleSelect('push')}
        className={`px-1.5 py-0.5 rounded-sm transition-colors ${
          mode === 'push'
            ? 'text-foreground font-medium'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        title="Push mode: panel pushes content up"
      >
        Push
      </button>
      <span className="px-1 text-muted-foreground">|</span>
      <button
        type="button"
        role="radio"
        aria-checked={mode === 'overlay'}
        onClick={() => handleSelect('overlay')}
        className={`px-1.5 py-0.5 rounded-sm transition-colors ${
          mode === 'overlay'
            ? 'text-foreground font-medium'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        title="Overlay mode: panel floats over content"
      >
        Overlay
      </button>
    </div>
  );
}