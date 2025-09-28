/**
 * Visual Effects Hook
 *
 * Custom hook for managing visual effects calculations and state.
 * Follows single responsibility principle by isolating visual effects logic.
 */

import { useMemo, useRef } from 'react';
import { VISUAL_CONSTANTS } from '../visual-constants';
import { STYLE_GENERATORS } from '../style-generators';

export interface MousePosition {
   x: number;
   y: number;
}

export interface LogoData {
   logoCenterX: number;
   logoCenterY: number;
}

export interface ContainerDimensions {
   width: number;
   height: number;
}

export interface UseVisualEffectsOptions {
   logoRef: React.RefObject<HTMLDivElement | null>;
   containerRef: React.RefObject<HTMLDivElement | null>;
   mousePosition: MousePosition;
   isClient: boolean;
   isMouseOver: boolean;
   isFading: boolean;
}

export interface UseVisualEffectsReturn {
   logoData: LogoData | null;
   containerDimensions: ContainerDimensions;
   glowIntensity: number;
   gridLineOpacity: number;
   gridBackgroundStyle: React.CSSProperties;
}

/**
 * Custom hook for visual effects calculations
 *
 * Features:
 * - Memoized calculations for performance
 * - Error handling for DOM operations
 * - Distance-based effect calculations
 * - Optimized style generation
 */
export function useVisualEffects({
   logoRef,
   containerRef,
   mousePosition,
   isClient,
   isMouseOver,
   isFading,
}: UseVisualEffectsOptions): UseVisualEffectsReturn {
   // Get container dimensions for performance optimization
   const containerDimensions = useMemo((): ContainerDimensions => {
      if (!containerRef.current || !isClient) return { width: 0, height: 0 };

      try {
         const rect = containerRef.current.getBoundingClientRect();
         return { width: rect.width, height: rect.height };
      } catch (error) {
         console.warn('Error getting container dimensions:', error);
         return { width: 0, height: 0 };
      }
   }, [containerRef, isClient]);

   // Get logo data - no need to duplicate calculation
   const logoData = useMemo((): LogoData | null => {
      if (!logoRef.current || !containerRef.current || !isClient) return null;

      try {
         const logoRect = logoRef.current.getBoundingClientRect();
         const containerRect = containerRef.current.getBoundingClientRect();

         // Validate rects have valid dimensions
         if (
            logoRect.width === 0 ||
            logoRect.height === 0 ||
            containerRect.width === 0 ||
            containerRect.height === 0
         ) {
            return null;
         }

         // Get logo center relative to container
         const logoCenterX = logoRect.left + logoRect.width / 2 - containerRect.left;
         const logoCenterY = logoRect.top + logoRect.height / 2 - containerRect.top;

         return { logoCenterX, logoCenterY };
      } catch (error) {
         console.warn('Error calculating logo data:', error);
         return null;
      }
   }, [logoRef, containerRef, isClient]);

   // Calculate glow intensity based on distance from logo (memoized)
   const glowIntensity = useMemo(() => {
      if (!logoData || !isClient) return VISUAL_CONSTANTS.DEFAULT_INTENSITY;

      try {
         // Use shadow system's mouse position for accurate distance calculation
         const deltaX = mousePosition.x - logoData.logoCenterX;
         const deltaY = mousePosition.y - logoData.logoCenterY;
         const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

         // Calculate intensity based on distance (closer = less intense, farther = more intense)
         const maxDistance = Math.max(containerDimensions.width, containerDimensions.height) / 2;

         // Prevent division by zero
         if (maxDistance === 0) return VISUAL_CONSTANTS.DEFAULT_INTENSITY;

         const normalizedDistance = Math.min(distance / maxDistance, 1);
         // Invert the calculation: closer to logo = lower intensity
         const intensity = VISUAL_CONSTANTS.DEFAULT_INTENSITY * normalizedDistance;

         return Math.max(intensity, VISUAL_CONSTANTS.DEFAULT_INTENSITY * 0.1);
      } catch (error) {
         console.warn('Error calculating glow intensity:', error);
         return VISUAL_CONSTANTS.DEFAULT_INTENSITY;
      }
   }, [logoData, mousePosition, isClient, containerDimensions]);

   // Calculate grid line opacity based on distance from logo (memoized)
   const gridLineOpacity = useMemo(() => {
      if (!logoData || !isClient) return VISUAL_CONSTANTS.DEFAULT_OPACITY;

      try {
         // Use shadow system's mouse position for accurate distance calculation
         const deltaX = mousePosition.x - logoData.logoCenterX;
         const deltaY = mousePosition.y - logoData.logoCenterY;
         const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

         // Calculate opacity based on distance (closer = less visible, farther = more visible)
         const maxDistance = Math.max(containerDimensions.width, containerDimensions.height) / 2;

         // Prevent division by zero
         if (maxDistance === 0) return VISUAL_CONSTANTS.DEFAULT_OPACITY;

         const normalizedDistance = Math.min(distance / maxDistance, 1);
         // Invert the calculation: closer to logo = lower opacity
         const opacity = VISUAL_CONSTANTS.DEFAULT_OPACITY * normalizedDistance;

         return Math.max(opacity, VISUAL_CONSTANTS.DEFAULT_OPACITY * 0.1);
      } catch (error) {
         console.warn('Error calculating grid line opacity:', error);
         return VISUAL_CONSTANTS.DEFAULT_OPACITY;
      }
   }, [logoData, mousePosition, isClient, containerDimensions]);

   // Memoized grid background style with smooth fade-in
   const gridBackgroundStyle = useMemo(() => {
      try {
         const baseOpacity = gridLineOpacity;
         const gridOpacity = isMouseOver ? baseOpacity : 0;

         return {
            backgroundImage: STYLE_GENERATORS.getGridBackgroundImage(baseOpacity),
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
            transition: isFading
               ? `opacity ${VISUAL_CONSTANTS.FADE_TRANSITION_DURATION} ease-out`
               : `opacity ${VISUAL_CONSTANTS.QUICK_TRANSITION_DURATION} ease-out`,
            opacity: isFading ? 0 : gridOpacity,
         };
      } catch (error) {
         console.warn('Error calculating grid background style:', error);
         return {
            backgroundImage: 'none',
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
            opacity: 0,
         };
      }
   }, [isMouseOver, isFading, gridLineOpacity]);

   return {
      logoData,
      containerDimensions,
      glowIntensity,
      gridLineOpacity,
      gridBackgroundStyle,
   };
}
