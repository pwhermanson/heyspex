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

import React, { useRef } from 'react';
import Image from 'next/image';
import { cn } from '@/src/lib/lib/utils';
import { useShadow, ShadowLayer } from './shadow';
import { useMouseInteraction, useVisualEffects } from './hooks';
import { GridBackground, GlowEffect } from './components';
import { VISUAL_CONSTANTS } from './visual-constants';
import { COMPONENT_STYLES, STYLE_GENERATORS } from './style-generators';

export interface AppShellBrandedProps {
   className?: string;
}

export const AppShellBranded = React.memo(function AppShellBranded({
   className,
}: AppShellBrandedProps) {
   const containerRef = useRef<HTMLDivElement>(null);
   const logoRef = useRef<HTMLDivElement>(null);

   // Use mouse interaction hook for state management
   const {
      isMouseOver,
      isMouseMoving,
      isIdle,
      isFading,
      isShadowFading,
      isClient,
      handleMouseMove: mouseInteractionHandleMouseMove,
      handleMouseLeave: mouseInteractionHandleMouseLeave,
   } = useMouseInteraction();

   // Use shadow system
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

   // Use visual effects hook for calculations
   const { logoData, glowIntensity, gridBackgroundStyle } = useVisualEffects({
      logoRef,
      containerRef,
      mousePosition,
      isClient,
      isMouseOver,
      isFading,
   });

   // Combined mouse move handler
   const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      shadowHandleMouseMove(e);
      mouseInteractionHandleMouseMove(e);
   };

   // Combined mouse leave handler
   const handleMouseLeave = () => {
      shadowHandleMouseLeave();
      mouseInteractionHandleMouseLeave();
   };

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
         <GridBackground style={gridBackgroundStyle} />

         {/* Mouse-following glow effect - only render when client is ready */}
         {isClient && isMouseOver && logoData && (
            <GlowEffect
               mousePosition={mousePosition}
               glowIntensity={glowIntensity}
               isFading={isFading}
               isMouseMoving={isMouseMoving}
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
