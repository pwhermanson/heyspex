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

interface AppShellBrandedProps {
   className?: string;
}

// Visual effect constants
const VISUAL_CONSTANTS = {
   // Shadow effects
   SHADOW_OFFSET_DIVISOR: 20,
   MAX_SHADOW_DISTANCE: 3000,
   MAX_SHADOW_BLUR: 15,
   OPACITY_FADE_DISTANCE: 400,
   MIN_OPACITY: 0.1,

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

   // Color animation
   COLOR_ROTATION_SPEED: 0.3,

   // Logo dimensions
   LOGO_WIDTH: 300,
   LOGO_HEIGHT: 273,

   // Mathematical constants
   MATH_PI_2: Math.PI * 2,
   SWIRL_PHASE_MULTIPLIER: 0.5,
   SWIRL_PHASE_OFFSET: 0.5,
   TIME_DIVISOR: 1000,

   // Color palette
   COLOR_PALETTE: [
      [59, 130, 246], // Blue
      [34, 197, 94], // Green
      [147, 51, 234], // Purple
      [236, 72, 153], // Pink
      [249, 115, 22], // Orange
      [234, 179, 8], // Yellow
   ],

   // Grid gradient opacities
   GRID_GRADIENT_OPACITY_1: 0.03,
   GRID_GRADIENT_OPACITY_2: 0.02,
   GRID_GRADIENT_OPACITY_3: 0.015,

   // Transition durations
   FADE_TRANSITION_DURATION: '2.5s',
   QUICK_TRANSITION_DURATION: '0.4s',
   FILTER_TRANSITION_DURATION: '0.125s',
   FILTER_FADE_TRANSITION_DURATION: '0.875s',

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

   // Z-index values
   GLOW_Z_INDEX: 2,
   LOGO_Z_INDEX: 10,

   // Default values
   DEFAULT_OPACITY: 1,
   DEFAULT_INTENSITY: 1,
   DEFAULT_MOUSE_POSITION: { x: 0, y: 0 } as const,
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

   // Generate logo filter styles
   getLogoFilter: (
      isFading: boolean,
      isMouseOver: boolean,
      isIdle: boolean,
      shadowData: { x: number; y: number; blur: number; opacity: number },
      swirlingColor: string
   ) => {
      if (isFading) {
         return 'brightness(0) invert(1)'; // Black to white
      } else if (isMouseOver && !isIdle) {
         return `drop-shadow(${shadowData.x}px ${shadowData.y}px ${shadowData.blur}px ${swirlingColor}) brightness(1)`;
      } else {
         return 'brightness(0.7)';
      }
   },

   // Generate transition styles
   getTransitionStyle: (isFading: boolean) =>
      isFading
         ? `filter ${VISUAL_CONSTANTS.FILTER_FADE_TRANSITION_DURATION} ease-out, -webkit-filter ${VISUAL_CONSTANTS.FILTER_FADE_TRANSITION_DURATION} ease-out`
         : `filter ${VISUAL_CONSTANTS.FILTER_TRANSITION_DURATION} ease-out, -webkit-filter ${VISUAL_CONSTANTS.FILTER_TRANSITION_DURATION} ease-out`,
} as const;

export function AppShellBranded({ className }: AppShellBrandedProps) {
   const [isMouseOver, setIsMouseOver] = useState(false);
   const [isMouseMoving, setIsMouseMoving] = useState(false);
   const [isIdle, setIsIdle] = useState(false);
   const [isFading, setIsFading] = useState(false);
   const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>(
      VISUAL_CONSTANTS.DEFAULT_MOUSE_POSITION
   );
   const timeoutRef = useRef<NodeJS.Timeout | null>(null);
   const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
   const containerRef = useRef<HTMLDivElement>(null);
   const logoRef = useRef<HTMLDivElement>(null);

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
         // Always update mouse position immediately for smooth tracking
         if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            setMousePosition({ x, y });
         }

         // Set mouse moving state immediately
         setIsMouseMoving(true);

         // Clear existing timeouts
         clearAllTimeouts();

         // Activate effects immediately - no delay
         setIsMouseOver(true);

         setIsIdle(false);
         setIsFading(false);

         // Set new timeout for idle detection
         timeoutRef.current = setTimeout(() => {
            setIsIdle(true);
            setIsMouseMoving(false);
            // Start fade immediately after idle (total delay = 0.5 seconds)
            fadeTimeoutRef.current = setTimeout(() => {
               setIsFading(true);
            }, VISUAL_CONSTANTS.FADE_DELAY); // No additional delay - fade starts immediately after idle
         }, VISUAL_CONSTANTS.IDLE_TIMEOUT); // 0.5 second idle timeout
      },
      [clearAllTimeouts]
   );

   // Helper function to get logo center and distance from mouse (memoized)
   const getLogoCenterAndDistance = useCallback(() => {
      if (!logoRef.current || !containerRef.current) return null;

      const logoRect = logoRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();

      // Get logo center relative to container
      const logoCenterX = logoRect.left + logoRect.width / 2 - containerRect.left;
      const logoCenterY = logoRect.top + logoRect.height / 2 - containerRect.top;

      // Calculate distance from mouse to logo center
      const distance = Math.sqrt(
         Math.pow(mousePosition.x - logoCenterX, 2) + Math.pow(mousePosition.y - logoCenterY, 2)
      );

      return { logoCenterX, logoCenterY, distance };
   }, [mousePosition.x, mousePosition.y]);

   // Calculate shadow offset, blur, and opacity based on logo's actual center (memoized)
   const getShadowOffset = useCallback(() => {
      const logoData = getLogoCenterAndDistance();
      if (!logoData) return { x: 0, y: 0, blur: 0, opacity: 1 };

      const { logoCenterX, logoCenterY, distance } = logoData;

      // Shadow follows mouse position - offset from logo center
      const offsetX = -(mousePosition.x - logoCenterX) / 20;
      const offsetY = -(mousePosition.y - logoCenterY) / 20;

      // Blur increases with distance from logo
      const maxDistance = 3000;
      const blur = Math.min(Math.pow(distance / maxDistance, 2) * 15, 15);

      // Opacity decreases with distance from logo
      const opacityDistance = 400;
      const opacity = Math.max(1 - distance / opacityDistance, 0.1);

      return { x: offsetX, y: offsetY, blur, opacity };
   }, [getLogoCenterAndDistance, mousePosition.x, mousePosition.y]);

   // Calculate swirling color based on time and position (memoized)
   const getSwirlingColor = useCallback(() => {
      const time = Date.now() / 1000;
      const angle = (time * 0.3) % (Math.PI * 2);

      // Animate through color palette over time
      const swirlPhase = Math.sin(angle) * 0.5 + 0.5;

      const colors = [
         [59, 130, 246], // Blue
         [34, 197, 94], // Green
         [147, 51, 234], // Purple
         [236, 72, 153], // Pink
         [249, 115, 22], // Orange
         [234, 179, 8], // Yellow
      ];

      // Smooth color transition between palette colors
      const colorIndex = (swirlPhase * (colors.length - 1)) % colors.length;
      const currentColorIndex = Math.floor(colorIndex);
      const nextColorIndex = (currentColorIndex + 1) % colors.length;
      const blendFactor = colorIndex - currentColorIndex;

      const currentColor = colors[currentColorIndex];
      const nextColor = colors[nextColorIndex];

      const r = Math.round(currentColor[0] * (1 - blendFactor) + nextColor[0] * blendFactor);
      const g = Math.round(currentColor[1] * (1 - blendFactor) + nextColor[1] * blendFactor);
      const b = Math.round(currentColor[2] * (1 - blendFactor) + nextColor[2] * blendFactor);

      return `rgba(${r}, ${g}, ${b}, ${getShadowOffset().opacity})`;
   }, [getShadowOffset]);

   // Calculate glow intensity based on distance from logo (memoized)
   const getGlowIntensity = useCallback(() => {
      const logoData = getLogoCenterAndDistance();
      if (!logoData) return VISUAL_CONSTANTS.DEFAULT_INTENSITY;

      const { distance } = logoData;

      // Dim the glow as mouse gets closer (max distance of 200px for full glow)
      const maxDistance = VISUAL_CONSTANTS.GLOW_MAX_DISTANCE;
      const intensity = Math.min(distance / maxDistance, 1);

      return Math.max(intensity, VISUAL_CONSTANTS.GLOW_MIN_INTENSITY); // Minimum 10% intensity
   }, [getLogoCenterAndDistance]);

   // Calculate grid line opacity based on distance from logo (memoized)
   const getGridLineOpacity = useCallback(() => {
      const logoData = getLogoCenterAndDistance();
      if (!logoData) return VISUAL_CONSTANTS.DEFAULT_OPACITY;

      const { distance } = logoData;

      // Lower opacity as mouse gets closer (max distance of 300px for full opacity)
      const maxDistance = VISUAL_CONSTANTS.GRID_MAX_DISTANCE;
      const opacity = Math.min(distance / maxDistance, 1);

      return Math.max(opacity, VISUAL_CONSTANTS.MIN_OPACITY); // Minimum 10% opacity
   }, [getLogoCenterAndDistance]);

   // Get glow intensity (already memoized via useCallback)
   const glowIntensity = getGlowIntensity();

   // Memoized grid background style with smooth fade-in
   const gridBackgroundStyle = useMemo(() => {
      const baseOpacity = getGridLineOpacity();
      const gridOpacity = isMouseOver ? baseOpacity : 0;

      return {
         backgroundImage: STYLE_GENERATORS.getGridBackgroundImage(baseOpacity),
         ...MASK_STYLES,
         transition: isFading
            ? `opacity ${VISUAL_CONSTANTS.FADE_TRANSITION_DURATION} ease-out`
            : `opacity ${VISUAL_CONSTANTS.QUICK_TRANSITION_DURATION} ease-out`,
         opacity: isFading ? 0 : gridOpacity,
      };
   }, [isMouseOver, isFading, getGridLineOpacity]);

   // Memoized filter and transition values for logo
   const logoStyle = useMemo(() => {
      const shadowData = getShadowOffset();
      const swirlingColor = getSwirlingColor();
      const filterValue = STYLE_GENERATORS.getLogoFilter(
         isFading,
         isMouseOver,
         isIdle,
         shadowData,
         swirlingColor
      );
      const transitionValue = STYLE_GENERATORS.getTransitionStyle(isFading);

      return {
         filter: filterValue,
         WebkitFilter: filterValue,
         transition: transitionValue,
         opacity: 1, // Always visible, just changes color
      } as React.CSSProperties;
   }, [isMouseOver, isIdle, isFading, getShadowOffset, getSwirlingColor]);

   const handleMouseLeave = useCallback(() => {
      // Clear existing timeouts
      clearAllTimeouts();

      // Set new timeout for idle detection (same as mouse stop)
      timeoutRef.current = setTimeout(() => {
         setIsIdle(true);
         setIsMouseMoving(false);
         // Start fade immediately after idle (total delay = 0.5 seconds)
         fadeTimeoutRef.current = setTimeout(() => {
            setIsFading(true);
         }, VISUAL_CONSTANTS.FADE_DELAY); // No additional delay - fade starts immediately after idle
      }, VISUAL_CONSTANTS.IDLE_TIMEOUT); // 0.5 second idle timeout
   }, [clearAllTimeouts]);

   // Cleanup timeouts on unmount
   useEffect(() => {
      return clearAllTimeouts;
   }, [clearAllTimeouts]);

   return (
      <div
         ref={containerRef}
         className={cn(
            'flex flex-col items-center justify-center h-full w-full',
            'bg-background text-foreground relative overflow-hidden',
            className
         )}
         onMouseMove={handleMouseMove}
         onMouseLeave={handleMouseLeave}
      >
         {/* Grid background with gradient */}
         <div className="absolute inset-0" style={gridBackgroundStyle} />

         {/* Mouse-following glow effect */}
         {isMouseOver && (
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

            {/* Main logo with animated shadow */}
            <div
               ref={logoRef}
               className="h-auto w-auto max-w-[300px] relative"
               style={{ ...logoStyle, zIndex: VISUAL_CONSTANTS.LOGO_Z_INDEX }}
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
}
