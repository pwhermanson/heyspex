/**
 * Glow Effect Component
 *
 * Isolated component for rendering the mouse-following glow effect.
 * Follows single responsibility principle by only handling glow rendering.
 */

import React, { memo } from 'react';
import { COMPONENT_STYLES, STYLE_GENERATORS } from '../style-generators';
import { VISUAL_CONSTANTS } from '../visual-constants';

export interface GlowEffectProps {
   mousePosition: { x: number; y: number };
   glowIntensity: number;
   isFading: boolean;
   isMouseMoving: boolean;
   className?: string;
}

/**
 * Glow Effect Component
 *
 * Features:
 * - Single responsibility: only renders glow effect
 * - Optimized with React.memo to prevent unnecessary re-renders
 * - Pure component with no internal state
 * - Follows mouse position for dynamic positioning
 */
export const GlowEffect = memo<GlowEffectProps>(function GlowEffect({
   mousePosition,
   glowIntensity,
   isFading,
   isMouseMoving,
   className = '',
}) {
   return (
      <div
         className={`absolute inset-0 pointer-events-none ${className}`}
         style={{
            ...COMPONENT_STYLES.glowEffect,
            background: STYLE_GENERATORS.getGlowRadialGradient(
               mousePosition.x,
               mousePosition.y,
               glowIntensity
            ),
            transition: isFading
               ? `opacity ${VISUAL_CONSTANTS.FADE_TRANSITION_DURATION} ease-out`
               : `background ${VISUAL_CONSTANTS.FILTER_TRANSITION_DURATION} ease-out, opacity ${VISUAL_CONSTANTS.QUICK_TRANSITION_DURATION} ease-out`,
            opacity: isFading ? 0 : isMouseMoving ? 0.7 : 0.4,
         }}
         data-testid="glow-effect"
      />
   );
});

GlowEffect.displayName = 'GlowEffect';
