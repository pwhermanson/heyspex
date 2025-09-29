/**
 * Grid Background Component
 *
 * Isolated component for rendering the animated grid background.
 * Follows single responsibility principle by only handling grid rendering.
 */

import React, { memo } from 'react';

export interface GridBackgroundProps {
   style: React.CSSProperties;
   className?: string;
}

/**
 * Grid Background Component
 *
 * Features:
 * - Single responsibility: only renders grid background
 * - Optimized with React.memo to prevent unnecessary re-renders
 * - Pure component with no internal state
 */
export const GridBackground = memo<GridBackgroundProps>(function GridBackground({
   style,
   className = '',
}) {
   return (
      <div
         className={`absolute inset-0 ${className}`}
         style={style}
         data-testid="grid-background"
      />
   );
});

GridBackground.displayName = 'GridBackground';
