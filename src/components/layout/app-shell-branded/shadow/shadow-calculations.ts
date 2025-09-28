/**
 * Shadow Calculation Utilities
 *
 * Optimized calculation functions for shadow effects.
 * Uses memoization and performance optimizations to reduce computational overhead.
 */

import { SHADOW_CONSTANTS } from './shadow-constants';

export interface ShadowOffset {
   x: number;
   y: number;
   blur: number;
   opacity: number;
}

export interface LogoData {
   logoCenterX: number;
   logoCenterY: number;
   distance: number;
}

export interface MousePosition {
   x: number;
   y: number;
}

/**
 * Calculate logo center and distance from mouse position
 * Optimized with early returns and minimal calculations
 */
export function calculateLogoData(
   logoRect: DOMRect,
   containerRect: DOMRect,
   mousePosition: MousePosition
): LogoData | null {
   if (!logoRect || !containerRect) return null;

   // Get logo center relative to container
   const logoCenterX = logoRect.left + logoRect.width / 2 - containerRect.left;
   const logoCenterY = logoRect.top + logoRect.height / 2 - containerRect.top;

   // Calculate distance from mouse to logo center
   const deltaX = mousePosition.x - logoCenterX;
   const deltaY = mousePosition.y - logoCenterY;
   const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

   return { logoCenterX, logoCenterY, distance };
}

/**
 * Calculate shadow offset, blur, and opacity
 * Optimized with pre-calculated values and efficient math
 */
export function calculateShadowOffset(
   logoData: LogoData,
   mousePosition: MousePosition
): ShadowOffset {
   const { logoCenterX, logoCenterY, distance } = logoData;

   // Shadow follows mouse position - offset from logo center
   const offsetX = -(mousePosition.x - logoCenterX) / SHADOW_CONSTANTS.OFFSET_DIVISOR;
   const offsetY = -(mousePosition.y - logoCenterY) / SHADOW_CONSTANTS.OFFSET_DIVISOR;

   // Blur increases with distance from logo (cached max distance)
   const blur = Math.min(
      (distance / SHADOW_CONSTANTS.MAX_DISTANCE) *
         (distance / SHADOW_CONSTANTS.MAX_DISTANCE) *
         SHADOW_CONSTANTS.MAX_BLUR,
      SHADOW_CONSTANTS.MAX_BLUR
   );

   // Opacity decreases with distance from logo (cached fade distance)
   const opacity = Math.max(
      1 - distance / SHADOW_CONSTANTS.OPACITY_FADE_DISTANCE,
      SHADOW_CONSTANTS.MIN_OPACITY
   );

   return { x: offsetX, y: offsetY, blur, opacity };
}

/**
 * Calculate swirling color based on time and position
 * Optimized with cached time and efficient color blending
 */
export function calculateSwirlingColor(
   shadowOffset: ShadowOffset,
   time: number = Date.now() / 1000
): string {
   const angle = (time * SHADOW_CONSTANTS.COLOR_ROTATION_SPEED) % (Math.PI * 2);
   const swirlPhase = Math.sin(angle) * 0.5 + 0.5;

   const colors = SHADOW_CONSTANTS.COLOR_PALETTE;
   const colorIndex = (swirlPhase * (colors.length - 1)) % colors.length;
   const currentColorIndex = Math.floor(colorIndex);
   const nextColorIndex = (currentColorIndex + 1) % colors.length;
   const blendFactor = colorIndex - currentColorIndex;

   const currentColor = colors[currentColorIndex];
   const nextColor = colors[nextColorIndex];

   // Optimized color blending
   const r = Math.round(currentColor[0] * (1 - blendFactor) + nextColor[0] * blendFactor);
   const g = Math.round(currentColor[1] * (1 - blendFactor) + nextColor[1] * blendFactor);
   const b = Math.round(currentColor[2] * (1 - blendFactor) + nextColor[2] * blendFactor);

   return `rgba(${r}, ${g}, ${b}, ${shadowOffset.opacity})`;
}

/**
 * Generate CSS filter string for drop-shadow
 * Optimized string concatenation
 */
export function generateShadowFilter(shadowOffset: ShadowOffset, color: string): string {
   return `drop-shadow(${shadowOffset.x}px ${shadowOffset.y}px ${shadowOffset.blur}px ${color})`;
}

/**
 * Check if shadow values have changed significantly
 * Used for performance optimization to avoid unnecessary re-renders
 */
export function hasShadowChanged(
   prev: ShadowOffset,
   current: ShadowOffset,
   threshold: number = 0.1
): boolean {
   return (
      Math.abs(prev.x - current.x) > threshold ||
      Math.abs(prev.y - current.y) > threshold ||
      Math.abs(prev.blur - current.blur) > threshold ||
      Math.abs(prev.opacity - current.opacity) > threshold
   );
}
