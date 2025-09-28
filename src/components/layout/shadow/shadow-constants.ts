/**
 * Shadow Constants and Configuration
 *
 * Centralized configuration for shadow effects in the AppShell branded component.
 * Follows single responsibility principle by isolating shadow-specific constants.
 */

export const SHADOW_CONSTANTS = {
   // Shadow calculation parameters
   OFFSET_DIVISOR: 20,
   MAX_DISTANCE: 3000,
   MAX_BLUR: 15,
   OPACITY_FADE_DISTANCE: 400,
   MIN_OPACITY: 0.1,

   // Performance optimization
   THROTTLE_MS: 16, // ~60fps
   DEBOUNCE_MS: 50,

   // Color animation
   COLOR_ROTATION_SPEED: 0.3,
   COLOR_PALETTE: [
      [59, 130, 246], // Blue
      [34, 197, 94], // Green
      [147, 51, 234], // Purple
      [236, 72, 153], // Pink
      [249, 115, 22], // Orange
      [234, 179, 8], // Yellow
   ],

   // Transition durations
   FADE_TRANSITION_DURATION: '2.5s',
   FILTER_TRANSITION_DURATION: '0.125s',

   // Default values
   DEFAULT_MOUSE_POSITION: { x: 0, y: 0 } as const,
} as const;

export type ShadowConstants = typeof SHADOW_CONSTANTS;
