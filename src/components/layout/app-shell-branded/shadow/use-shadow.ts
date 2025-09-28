/**
 * Shadow Hook
 *
 * Custom hook for managing shadow state and calculations with performance optimizations.
 * Implements throttling, memoization, and efficient state management.
 */

import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { SHADOW_CONSTANTS } from './shadow-constants';
import {
   calculateLogoData,
   calculateShadowOffset,
   calculateSwirlingColor,
   generateShadowFilter,
   hasShadowChanged,
   type ShadowOffset,
   type LogoData,
   type MousePosition,
} from './shadow-calculations';

export interface UseShadowOptions {
   logoRef: React.RefObject<HTMLDivElement | null>;
   containerRef: React.RefObject<HTMLDivElement | null>;
   isClient: boolean;
   isMouseOver: boolean;
   isShadowFading: boolean;
}

export interface UseShadowReturn {
   shadowFilter: string;
   shadowOpacity: number;
   mousePosition: MousePosition;
   handleMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
   handleMouseLeave: () => void;
}

/**
 * Custom hook for optimized shadow management
 *
 * Features:
 * - Throttled mouse movement handling (60fps)
 * - Memoized calculations to prevent unnecessary recalculations
 * - Efficient state management with change detection
 * - Automatic cleanup of timeouts and intervals
 */
export function useShadow({
   logoRef,
   containerRef,
   isClient,
   isMouseOver,
   isShadowFading,
}: UseShadowOptions): UseShadowReturn {
   const [mousePosition, setMousePosition] = useState<MousePosition>(
      SHADOW_CONSTANTS.DEFAULT_MOUSE_POSITION
   );
   const [hasMouseMoved, setHasMouseMoved] = useState(false);
   const [shouldShowShadow, setShouldShowShadow] = useState(false);

   // Refs for performance optimization
   const lastUpdateTimeRef = useRef<number>(0);
   const lastShadowRef = useRef<ShadowOffset | null>(null);
   const animationFrameRef = useRef<number | null>(null);
   const colorUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

   // Throttled mouse position update
   const updateMousePosition = useCallback((x: number, y: number) => {
      const now = Date.now();
      if (now - lastUpdateTimeRef.current < SHADOW_CONSTANTS.THROTTLE_MS) {
         return;
      }

      lastUpdateTimeRef.current = now;
      setMousePosition({ x, y });
      setHasMouseMoved(true);
   }, []);

   // Calculate logo data with memoization
   const logoData = useMemo((): LogoData | null => {
      if (!logoRef.current || !containerRef.current || !isClient) return null;

      const logoRect = logoRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();

      return calculateLogoData(logoRect, containerRect, mousePosition);
   }, [logoRef, containerRef, isClient, mousePosition]);

   // Calculate shadow offset with change detection
   const shadowOffset = useMemo((): ShadowOffset => {
      if (!logoData) {
         return { x: 0, y: 0, blur: 0, opacity: 1 };
      }

      const newShadow = calculateShadowOffset(logoData, mousePosition);

      // Only update if shadow has changed significantly
      if (lastShadowRef.current && !hasShadowChanged(lastShadowRef.current, newShadow)) {
         return lastShadowRef.current;
      }

      lastShadowRef.current = newShadow;
      return newShadow;
   }, [logoData, mousePosition]);

   // Calculate swirling color with time-based updates
   const [swirlingColor, setSwirlingColor] = useState<string>('rgba(59, 130, 246, 1)');

   // Update color periodically for smooth animation
   useEffect(() => {
      if (!isClient || !isMouseOver) return;

      const updateColor = () => {
         setSwirlingColor(calculateSwirlingColor(shadowOffset));
      };

      // Initial color update
      updateColor();

      // Set up interval for color updates
      colorUpdateIntervalRef.current = setInterval(updateColor, 50); // 20fps for color updates

      return () => {
         if (colorUpdateIntervalRef.current) {
            clearInterval(colorUpdateIntervalRef.current);
            colorUpdateIntervalRef.current = null;
         }
      };
   }, [isClient, isMouseOver, shadowOffset]);

   // Generate shadow filter with memoization
   const shadowFilter = useMemo(() => {
      return generateShadowFilter(shadowOffset, swirlingColor);
   }, [shadowOffset, swirlingColor]);

   // Manage shadow visibility state
   useEffect(() => {
      if (isMouseOver && hasMouseMoved) {
         setShouldShowShadow(true);
      } else if (isShadowFading) {
         // Keep shadow visible during fade, let CSS transition handle the opacity
         setShouldShowShadow(true);
      } else if (!isMouseOver && !isShadowFading) {
         // Hide shadow after fade is complete
         setShouldShowShadow(false);
      }
   }, [isMouseOver, hasMouseMoved, isShadowFading]);

   // Calculate shadow opacity based on fade state and visibility
   const shadowOpacity = useMemo(() => {
      if (!shouldShowShadow) return 0;
      return isShadowFading ? 0 : 1;
   }, [isShadowFading, shouldShowShadow]);

   // Optimized mouse move handler with requestAnimationFrame
   const handleMouseMove = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
         if (!isClient || !containerRef.current) return;

         // Cancel previous animation frame
         if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
         }

         // Schedule update for next frame
         animationFrameRef.current = requestAnimationFrame(() => {
            const rect = containerRef.current!.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            updateMousePosition(x, y);
         });
      },
      [isClient, containerRef, updateMousePosition]
   );

   // Mouse leave handler
   const handleMouseLeave = useCallback(() => {
      // Cancel any pending animation frames
      if (animationFrameRef.current) {
         cancelAnimationFrame(animationFrameRef.current);
         animationFrameRef.current = null;
      }

      // Clear color update interval
      if (colorUpdateIntervalRef.current) {
         clearInterval(colorUpdateIntervalRef.current);
         colorUpdateIntervalRef.current = null;
      }

      // Reset mouse movement state
      setHasMouseMoved(false);
   }, []);

   // Cleanup on unmount
   useEffect(() => {
      return () => {
         if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
         }
         if (colorUpdateIntervalRef.current) {
            clearInterval(colorUpdateIntervalRef.current);
         }
      };
   }, []);

   return {
      shadowFilter,
      shadowOpacity,
      mousePosition,
      handleMouseMove,
      handleMouseLeave,
   };
}
