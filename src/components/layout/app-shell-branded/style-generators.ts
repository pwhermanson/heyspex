/**
 * Style Generation Utilities
 *
 * Pure functions for generating CSS styles and visual effects.
 * Follows single responsibility principle by isolating style generation logic.
 */

import { VISUAL_CONSTANTS } from './visual-constants';

// Reusable mask styles
export const MASK_STYLES = {
   backgroundSize: '100vw 100vh, 100vw 100vh, 100vw 100vh, 100vw 100vh',
   backgroundPosition: '0 0, 0 0, 0 0, 0 0',
   backgroundRepeat: 'repeat',
   maskImage: `
      repeating-linear-gradient(to right, black 0px, black 1px, transparent 1px, transparent 20px),
      repeating-linear-gradient(to bottom, black 0px, black 1px, transparent 1px, transparent 20px),
      repeating-linear-gradient(45deg, transparent 0px, transparent 200px, black 201px, black 202px, transparent 202px, transparent 220px),
      repeating-linear-gradient(-45deg, transparent 0px, transparent 300px, black 301px, black 302px, transparent 202px, transparent 320px)
   `,
   maskSize: '800px 800px, 800px 800px, 400px 400px, 600px 600px',
   maskPosition: '0 0, 0 0, 50px 50px, 100px 100px',
   maskRepeat: 'repeat',
} as const;

// Reusable component styles
export const COMPONENT_STYLES = {
   // Glow effect base styles
   glowEffect: {
      zIndex: VISUAL_CONSTANTS.GLOW_Z_INDEX,
      mixBlendMode: 'screen' as const,
      ...MASK_STYLES,
   },

   // Solid black background logo styles
   solidBlackLogo: {
      filter: 'brightness(0)',
      WebkitFilter: 'brightness(0)',
   },

   // Explosive radial glow styles
   explosiveGlow: {
      width: '0px',
      height: '0px',
      borderRadius: '50%',
      position: 'absolute' as const,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 1,
      transition:
         'width 1s cubic-bezier(0.25, 0.46, 0.45, 0.94), height 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      pointerEvents: 'none' as const,
   },

   // KBD button styles
   kbdButton:
      'px-2 py-1 text-sm font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500',
} as const;

// Style generation functions
export const STYLE_GENERATORS = {
   // Generate radial glow gradient based on mouse position and intensity
   getGlowRadialGradient: (x: number, y: number, intensity: number) =>
      `radial-gradient(circle at ${x}px ${y}px, 
         rgba(255, 255, 255, ${VISUAL_CONSTANTS.GLOW_OPACITY_1 * intensity}) ${VISUAL_CONSTANTS.GLOW_RADIUS_1}px, 
         rgba(255, 255, 255, ${VISUAL_CONSTANTS.GLOW_OPACITY_2 * intensity}) ${VISUAL_CONSTANTS.GLOW_RADIUS_2}px, 
         rgba(255, 255, 255, ${VISUAL_CONSTANTS.GLOW_OPACITY_3 * intensity}) ${VISUAL_CONSTANTS.GLOW_RADIUS_3}px, 
         rgba(255, 255, 255, ${VISUAL_CONSTANTS.GLOW_OPACITY_4 * intensity}) ${VISUAL_CONSTANTS.GLOW_RADIUS_4}px, 
         rgba(255, 255, 255, ${VISUAL_CONSTANTS.GLOW_OPACITY_5 * intensity}) ${VISUAL_CONSTANTS.GLOW_RADIUS_5}px, 
         transparent ${VISUAL_CONSTANTS.GLOW_RADIUS_6}px)`,

   // Generate explosive glow background for hover effect
   getExplosiveGlowBackground: () =>
      'radial-gradient(circle, rgba(59, 130, 246, 0.6) 0%, rgba(59, 130, 246, 0.4) 30%, rgba(59, 130, 246, 0.2) 60%, rgba(59, 130, 246, 0.1) 80%, transparent 100%)',

   // Generate grid background gradients
   getGridBackgroundImage: (baseOpacity: number) => `
      linear-gradient(45deg, rgba(34, 197, 94, ${VISUAL_CONSTANTS.GRID_GRADIENT_OPACITY_1 * baseOpacity}) 0%, rgba(59, 130, 246, ${VISUAL_CONSTANTS.GRID_GRADIENT_OPACITY_1 * baseOpacity}) 100%),
      linear-gradient(45deg, rgba(147, 51, 234, ${VISUAL_CONSTANTS.GRID_GRADIENT_OPACITY_1 * baseOpacity}) 0%, rgba(236, 72, 153, ${VISUAL_CONSTANTS.GRID_GRADIENT_OPACITY_1 * baseOpacity}) 100%),
      linear-gradient(45deg, rgba(249, 115, 22, ${VISUAL_CONSTANTS.GRID_GRADIENT_OPACITY_2 * baseOpacity}) 0%, rgba(234, 179, 8, ${VISUAL_CONSTANTS.GRID_GRADIENT_OPACITY_2 * baseOpacity}) 100%),
      linear-gradient(-45deg, rgba(59, 130, 246, ${VISUAL_CONSTANTS.GRID_GRADIENT_OPACITY_3 * baseOpacity}) 0%, rgba(147, 51, 234, ${VISUAL_CONSTANTS.GRID_GRADIENT_OPACITY_3 * baseOpacity}) 100%)
   `,
} as const;
