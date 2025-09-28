'use client';

/**
 * App Shell Branded Component
 *
 * A sophisticated interactive logo display that serves as the main landing page element.
 * Creates dynamic visual effects based on mouse movement and hover states, featuring:
 *
 * • Real-time mouse tracking with immediate visual response
 * • Multi-layer visual effects (shadows, glows, grids)
 * • Animated color transitions through predefined palette
 * • Distance-based calculations for smooth state transitions
 * • Performance-optimized calculations with memoization
 * • Timeout management for idle detection and fade effects
 *
 * This component appears when all panels are closed and provides an engaging
 * visual experience with interactive elements that respond to user input.
 *
 * For comprehensive documentation, implementation details, and refactoring guidelines,
 * see: @/docs/components/app-shell-branded.md
 *
 * @component AppShellBranded
 * @param {AppShellBrandedProps} props - Component props
 * @returns {JSX.Element} Interactive logo display with visual effects
 */

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/src/lib/lib/utils';
import { ZIndex } from '@/src/lib/z-index-management';
import { useShadow, ShadowLayer } from './shadow';

export interface AppShellBrandedProps {
   className?: string;
}

// Visual effect constants (shadow constants moved to separate module)
const VISUAL_CONSTANTS = {
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

// Reusable mask styles
const MASK_STYLES = {
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
const COMPONENT_STYLES = {
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
const STYLE_GENERATORS = {
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

   // Logo filter logic moved to inline JSX for better control

   // Transition styles moved to inline JSX for better control
} as const;

export const AppShellBranded = React.memo(function AppShellBranded({
   className,
}: AppShellBrandedProps) {
   const [isMouseOver, setIsMouseOver] = useState(false);
   const [isMouseMoving, setIsMouseMoving] = useState(false);
   const [isIdle, setIsIdle] = useState(false);
   const [isFading, setIsFading] = useState(false);
   const [isShadowFading, setIsShadowFading] = useState(false);
   const [isClient, setIsClient] = useState(false);

   // Ensure client-side rendering for interactivity
   React.useEffect(() => {
      setIsClient(true);
   }, []);

   const timeoutRef = useRef<NodeJS.Timeout | null>(null);
   const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
   const containerRef = useRef<HTMLDivElement>(null);
   const logoRef = useRef<HTMLDivElement>(null);

   // Use the new shadow system
   const {
      shadowFilter,
      shadowOpacity,
      mousePosition,
      handleMouseMove: shadowHandleMouseMove,
      handleMouseLeave: shadowHandleMouseLeave,
   } = useShadow({
      logoRef,
      containerRef,
      isClient,
      isMouseOver,
      isShadowFading,
   });

   // Helper function to clear all timeouts
   const clearAllTimeouts = useCallback(() => {
      if (timeoutRef.current) {
         clearTimeout(timeoutRef.current);
         timeoutRef.current = null;
      }
      if (fadeTimeoutRef.current) {
         clearTimeout(fadeTimeoutRef.current);
         fadeTimeoutRef.current = null;
      }
   }, []);

   const handleMouseMove = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
         // Only handle mouse events on client side
         if (!isClient) return;

         // Delegate shadow handling to the shadow system
         shadowHandleMouseMove(e);

         // Set mouse moving state immediately
         setIsMouseMoving(true);

         // Clear existing timeouts
         clearAllTimeouts();

         // Activate effects immediately - no delay
         setIsMouseOver(true);
         setIsIdle(false);
         setIsFading(false);
         setIsShadowFading(false);

         // Set new timeout for idle detection
         timeoutRef.current = setTimeout(() => {
            setIsIdle(true);
            setIsMouseMoving(false);
            // Start fade immediately after idle (total delay = 0.5 seconds)
            fadeTimeoutRef.current = setTimeout(() => {
               setIsFading(true);
               setIsShadowFading(true); // Shadow fades at the same time as other effects
            }, VISUAL_CONSTANTS.FADE_DELAY); // No additional delay - fade starts immediately after idle
         }, VISUAL_CONSTANTS.IDLE_TIMEOUT); // 0.5 second idle timeout
      },
      [clearAllTimeouts, isClient, shadowHandleMouseMove]
   );

   // Get container dimensions for performance optimization
   const containerDimensions = useMemo(() => {
      if (!containerRef.current || !isClient) return { width: 0, height: 0 };

      try {
         const rect = containerRef.current.getBoundingClientRect();
         return { width: rect.width, height: rect.height };
      } catch (error) {
         console.warn('Error getting container dimensions:', error);
         return { width: 0, height: 0 };
      }
   }, [isClient]);

   // Get logo data from shadow system - no need to duplicate calculation
   const logoData = useMemo(() => {
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
            ...MASK_STYLES,
            transition: isFading
               ? `opacity ${VISUAL_CONSTANTS.FADE_TRANSITION_DURATION} ease-out`
               : `opacity ${VISUAL_CONSTANTS.QUICK_TRANSITION_DURATION} ease-out`,
            opacity: isFading ? 0 : gridOpacity,
         };
      } catch (error) {
         console.warn('Error calculating grid background style:', error);
         return {
            backgroundImage: 'none',
            ...MASK_STYLES,
            opacity: 0,
         };
      }
   }, [isMouseOver, isFading, gridLineOpacity]);

   // Shadow and logo styling is now handled directly in JSX for better control

   const handleMouseLeave = useCallback(() => {
      // Only handle mouse events on client side
      if (!isClient) return;

      // Delegate shadow handling to the shadow system
      shadowHandleMouseLeave();

      // Clear existing timeouts
      clearAllTimeouts();

      // Set new timeout for idle detection (same as mouse stop)
      timeoutRef.current = setTimeout(() => {
         setIsIdle(true);
         setIsMouseMoving(false);
         // Start fade immediately after idle (total delay = 0.5 seconds)
         fadeTimeoutRef.current = setTimeout(() => {
            setIsFading(true);
            setIsShadowFading(true); // Shadow fades at the same time as other effects
         }, VISUAL_CONSTANTS.FADE_DELAY); // No additional delay - fade starts immediately after idle
      }, VISUAL_CONSTANTS.IDLE_TIMEOUT); // 0.5 second idle timeout
   }, [clearAllTimeouts, isClient, shadowHandleMouseLeave]);

   // Cleanup timeouts on unmount
   useEffect(() => {
      return () => {
         clearAllTimeouts();
      };
   }, [clearAllTimeouts]);

   return (
      <div
         ref={containerRef}
         className={cn(
            'flex flex-col items-center justify-center h-full w-full',
            'bg-background text-foreground relative overflow-hidden',
            className
         )}
         onMouseMove={isClient ? handleMouseMove : undefined}
         onMouseLeave={isClient ? handleMouseLeave : undefined}
         style={{
            zIndex: 0,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
         }}
      >
         {/* Grid background with gradient */}
         <div className="absolute inset-0" style={gridBackgroundStyle} />

         {/* Mouse-following glow effect - only render when client is ready */}
         {isClient && isMouseOver && logoData && (
            <div
               className="absolute inset-0 pointer-events-none"
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
            />
         )}

         {/* Logo with Explosive Glow */}
         <div
            className="mb-6 group cursor-pointer relative"
            style={{ zIndex: VISUAL_CONSTANTS.LOGO_Z_INDEX }}
         >
            {/* Black shadow base - creates the shadow effect */}
            <div
               className="h-auto w-auto max-w-[300px] absolute top-0 left-0 z-0"
               style={{
                  filter: 'brightness(0)',
                  WebkitFilter: 'brightness(0)',
               }}
            >
               <Image
                  src="/heyspex-logo-stacked.png"
                  alt=""
                  width={300}
                  height={273}
                  className="h-auto w-auto max-w-[300px]"
                  priority
               />
            </div>

            {/* Explosive Radial Glow - Hover Only */}
            <div
               className="radial-glow-explosion group-hover:radial-glow-explosion-active"
               style={{
                  ...COMPONENT_STYLES.explosiveGlow,
                  background: STYLE_GENERATORS.getExplosiveGlowBackground(),
               }}
            />

            {/* Shadow layer - optimized with new shadow system */}
            <ShadowLayer
               shadowFilter={shadowFilter}
               shadowOpacity={shadowOpacity}
               isShadowFading={isShadowFading}
               logoWidth={VISUAL_CONSTANTS.LOGO_WIDTH}
               logoHeight={VISUAL_CONSTANTS.LOGO_HEIGHT}
               logoSrc="/heyspex-logo-stacked.png"
            />

            {/* Main logo - no shadow, just brightness changes */}
            <div
               ref={logoRef}
               className="h-auto w-auto max-w-[300px] relative"
               style={{
                  filter: isMouseOver && !isIdle ? 'brightness(1)' : 'brightness(0.7)',
                  WebkitFilter: isMouseOver && !isIdle ? 'brightness(1)' : 'brightness(0.7)',
                  transition: `filter ${VISUAL_CONSTANTS.LOGO_BRIGHTNESS_TRANSITION_DURATION} ease-out, -webkit-filter ${VISUAL_CONSTANTS.LOGO_BRIGHTNESS_TRANSITION_DURATION} ease-out`,
                  zIndex: VISUAL_CONSTANTS.LOGO_Z_INDEX,
               }}
            >
               <Image
                  src="/heyspex-logo-stacked.png"
                  alt="HeySpex"
                  width={VISUAL_CONSTANTS.LOGO_WIDTH}
                  height={VISUAL_CONSTANTS.LOGO_HEIGHT}
                  className="h-auto w-auto max-w-[300px]"
                  priority
               />
            </div>
         </div>

         {/* Instruction text */}
         <div className="text-center relative z-10">
            <p className="text-lg text-muted-foreground">
               Press <kbd className={COMPONENT_STYLES.kbdButton}>Ctrl</kbd> +{' '}
               <kbd className={COMPONENT_STYLES.kbdButton}>/</kbd> to get started
            </p>
         </div>
      </div>
   );
});
