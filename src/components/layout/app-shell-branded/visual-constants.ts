/**
 * Visual Effect Constants
 *
 * Centralized configuration for all visual effects in the AppShell branded component.
 * Follows single responsibility principle by isolating visual effect constants.
 */

import { ZIndex } from '@/src/lib/z-index-management';

export const VISUAL_CONSTANTS = {
   // Edge effects
   EDGE_FADE_DISTANCE: 100,

   // Glow effects
   GLOW_MAX_DISTANCE: 200,
   GLOW_MIN_INTENSITY: 0.1,

   // Grid effects
   GRID_MAX_DISTANCE: 300,

   // Timing
   IDLE_TIMEOUT: 500,
   FADE_DELAY: 0,

   // Logo dimensions
   LOGO_WIDTH: 300,
   LOGO_HEIGHT: 273,

   // Mathematical constants
   MATH_PI_2: Math.PI * 2,
   SWIRL_PHASE_MULTIPLIER: 0.5,
   SWIRL_PHASE_OFFSET: 0.5,
   TIME_DIVISOR: 1000,

   // Grid gradient opacities
   GRID_GRADIENT_OPACITY_1: 0.03,
   GRID_GRADIENT_OPACITY_2: 0.02,
   GRID_GRADIENT_OPACITY_3: 0.015,

   // Transition durations
   FADE_TRANSITION_DURATION: '2.5s',
   QUICK_TRANSITION_DURATION: '0.4s',
   FILTER_TRANSITION_DURATION: '0.125s',
   FILTER_FADE_TRANSITION_DURATION: '2.5s',
   LOGO_BRIGHTNESS_TRANSITION_DURATION: '1.2s',

   // Glow effect values
   GLOW_OPACITY_1: 0.25,
   GLOW_OPACITY_2: 0.2,
   GLOW_OPACITY_3: 0.15,
   GLOW_OPACITY_4: 0.08,
   GLOW_OPACITY_5: 0.04,
   GLOW_RADIUS_1: 0,
   GLOW_RADIUS_2: 80,
   GLOW_RADIUS_3: 160,
   GLOW_RADIUS_4: 240,
   GLOW_RADIUS_5: 320,
   GLOW_RADIUS_6: 400,

   // Filter values
   BRIGHTNESS_DIM: 0.7,
   BRIGHTNESS_NORMAL: 1,
   BRIGHTNESS_INVERT: 'brightness(0) invert(1)',

   // Z-index values - using centralized system
   GLOW_Z_INDEX: ZIndex.layers.GLOW_EFFECTS,
   LOGO_Z_INDEX: ZIndex.layers.MAIN_CONTENT,

   // Default values
   DEFAULT_OPACITY: 1,
   DEFAULT_INTENSITY: 1,
   MIN_OPACITY: 0.1,
} as const;

export type VisualConstants = typeof VISUAL_CONSTANTS;
