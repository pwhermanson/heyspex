import React from 'react';

export type BottomBarMode = 'push' | 'overlay';

interface BottomBarModeToggleProps {
  mode: BottomBarMode;
  onChange: (mode: BottomBarMode) => void;
  className?: string;
}

export function BottomBarModeToggle({ mode, onChange, className = '' }: BottomBarModeToggleProps) {
  const handleToggle = () => {
    const newMode = mode === 'push' ? 'overlay' : 'push';
    onChange(newMode);
  };

  const PushIcon = ({ isActive }: { isActive: boolean }) => (
    <svg
      width="24"
      height="20"
      viewBox="0 0 24 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-all duration-200 ${isActive ? 'scale-110' : 'scale-100'}`}
    >
      {/* Large rounded rectangle on top */}
      <rect
        x="1"
        y="1"
        width="22"
        height="10"
        rx="3"
        ry="3"
        fill="currentColor"
      />
      {/* Full-width rounded rectangle below with gap */}
      <rect
        x="1"
        y="14"
        width="22"
        height="5"
        rx="2.5"
        ry="2.5"
        fill="currentColor"
      />
    </svg>
  );

  const OverlayIcon = ({ isActive }: { isActive: boolean }) => (
    <svg
      width="24"
      height="20"
      viewBox="0 0 24 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-all duration-200 ${isActive ? 'scale-110' : 'scale-100'}`}
    >
      {/* Large rounded rectangle on top */}
      <rect
        x="1"
        y="1"
        width="22"
        height="10"
        rx="3"
        ry="3"
        fill="currentColor"
      />
      {/* Smaller centered rounded rectangle below */}
      <rect
        x="6"
        y="14"
        width="12"
        height="5"
        rx="2.5"
        ry="2.5"
        fill="currentColor"
      />
    </svg>
  );

  return (
    <button
      onClick={handleToggle}
      className={`relative inline-flex items-center bg-muted rounded-full p-1 transition-all duration-300 hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}
      aria-pressed={mode === 'push' ? 'true' : 'false'}
      aria-label={`Bottom panel mode: ${mode === 'push' ? 'Push content up' : 'Overlay on content'}`}
      title={mode === 'push' ? 'Push Mode: Panel pushes content up' : 'Overlay Mode: Panel floats over content'}
    >
      {/* Push Mode Button */}
      <div
        className={`
          relative flex items-center justify-center p-2 rounded-full transition-all duration-300 cursor-pointer
          ${mode === 'push'
            ? 'bg-primary text-primary-foreground shadow-lg transform'
            : 'text-muted-foreground hover:text-foreground'
          }
        `}
      >
        <PushIcon isActive={mode === 'push'} />
      </div>

      {/* Overlay Mode Button */}
      <div
        className={`
          relative flex items-center justify-center p-2 rounded-full transition-all duration-300 cursor-pointer
          ${mode === 'overlay'
            ? 'bg-primary text-primary-foreground shadow-lg transform'
            : 'text-muted-foreground hover:text-foreground'
          }
        `}
      >
        <OverlayIcon isActive={mode === 'overlay'} />
      </div>
    </button>
  );
}