/**
 * useAppShellBranded Hook
 *
 * Master composition hook that combines all individual hooks for the AppShellBranded component.
 * This hook extracts all the hook composition logic from the main component to achieve
 * the target of ~50 lines for the main component.
 *
 * @file use-app-shell-branded.ts
 * @author App Shell Branded System
 * @version 1.0.0
 */

import { useRef } from 'react';
import { useShadow } from '../shadow';
import {
   useMouseInteraction,
   useVisualEffects,
   useMouseEventComposition,
   useContainerStyling,
} from './index';

/**
 * Options for the useAppShellBranded hook
 */
export interface UseAppShellBrandedOptions {
   /** Additional CSS classes */
   className?: string;
}

/**
 * Return type for the useAppShellBranded hook
 */
export interface UseAppShellBrandedReturn {
   /** Container ref for the main container */
   containerRef: React.RefObject<HTMLDivElement | null>;
   /** Logo ref for the logo element */
   logoRef: React.RefObject<HTMLDivElement | null>;
   /** Container className with proper merging */
   containerClassName: string;
   /** Container inline styles */
   containerStyle: React.CSSProperties;
   /** Whether to show the glow effect */
   shouldShowGlowEffect: boolean;
   /** Grid background style */
   gridBackgroundStyle: React.CSSProperties;
   /** Glow effect intensity */
   glowIntensity: number;
   /** Mouse position for effects */
   mousePosition: { x: number; y: number };
   /** Whether mouse is over the component */
   isMouseOver: boolean;
   /** Whether mouse is actively moving */
   isMouseMoving: boolean;
   /** Whether component is in idle state */
   isIdle: boolean;
   /** Whether component is fading */
   isFading: boolean;
   /** Whether shadow is fading */
   isShadowFading: boolean;
   /** Whether client is ready */
   isClient: boolean;
   /** Shadow filter string */
   shadowFilter: string;
   /** Shadow opacity value */
   shadowOpacity: number;
   /** Combined mouse move handler */
   handleMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
   /** Combined mouse leave handler */
   handleMouseLeave: () => void;
}

/**
 * useAppShellBranded Hook
 *
 * Master composition hook that combines all individual hooks for the AppShellBranded component.
 * This eliminates the need for manual hook composition in the main component and provides
 * a clean, single interface for all AppShellBranded functionality.
 *
 * @param options - Configuration object
 * @returns Complete AppShellBranded state and handlers
 */
export function useAppShellBranded({
   className = '',
}: UseAppShellBrandedOptions = {}): UseAppShellBrandedReturn {
   // Create refs
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

   // Use mouse event composition hook
   const { handleMouseMove, handleMouseLeave } = useMouseEventComposition({
      shadowHandleMouseMove,
      mouseInteractionHandleMouseMove,
      shadowHandleMouseLeave,
      mouseInteractionHandleMouseLeave,
   });

   // Use container styling hook
   const { containerClassName, containerStyle, shouldShowGlowEffect } = useContainerStyling({
      isClient,
      isMouseOver,
      logoData,
      className,
   });

   return {
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
   };
}
