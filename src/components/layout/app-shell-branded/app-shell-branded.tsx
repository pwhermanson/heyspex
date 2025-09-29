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

import React from 'react';
import { useAppShellBranded } from './hooks';
import { GridBackground, GlowEffect, LogoGroup, InstructionText } from './components';

export interface AppShellBrandedProps {
   className?: string;
}

export const AppShellBranded = React.memo(function AppShellBranded({
   className,
}: AppShellBrandedProps) {
   // Use master composition hook
   const {
      containerRef,
      logoRef,
      containerClassName,
      containerStyle,
      shouldShowGlowEffect,
      gridBackgroundStyle,
      glowIntensity,
      mousePosition,
      isMouseOver,
      isMouseMoving,
      isIdle,
      isFading,
      isShadowFading,
      isClient,
      shadowFilter,
      shadowOpacity,
      handleMouseMove,
      handleMouseLeave,
   } = useAppShellBranded({ className });

   return (
      <div
         ref={containerRef}
         className={containerClassName}
         onMouseMove={isClient ? handleMouseMove : undefined}
         onMouseLeave={isClient ? handleMouseLeave : undefined}
         style={containerStyle}
         data-testid="app-shell-branded"
      >
         {/* Grid background with gradient */}
         <GridBackground style={gridBackgroundStyle} />

         {/* Mouse-following glow effect - only render when client is ready */}
         {shouldShowGlowEffect && (
            <GlowEffect
               mousePosition={mousePosition}
               glowIntensity={glowIntensity}
               isFading={isFading}
               isMouseMoving={isMouseMoving}
            />
         )}

         {/* Logo with Explosive Glow */}
         <LogoGroup
            logoRef={logoRef}
            isMouseOver={isMouseOver}
            isIdle={isIdle}
            shadowFilter={shadowFilter}
            shadowOpacity={shadowOpacity}
            isShadowFading={isShadowFading}
         />

         {/* Instruction text */}
         <InstructionText />
      </div>
   );
});
