/**
 * useMouseEventComposition Hook
 *
 * Composes multiple mouse event handlers into unified handlers for the main component.
 * This hook extracts the manual composition logic from the main component to improve
 * maintainability and follow the single use principle.
 *
 * @file use-mouse-event-composition.ts
 * @author App Shell Branded System
 * @version 1.0.0
 */

import { useCallback } from 'react';

/**
 * Options for the useMouseEventComposition hook
 */
export interface UseMouseEventCompositionOptions {
   /** Shadow system mouse move handler */
   shadowHandleMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
   /** Mouse interaction mouse move handler */
   mouseInteractionHandleMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
   /** Shadow system mouse leave handler */
   shadowHandleMouseLeave: () => void;
   /** Mouse interaction mouse leave handler */
   mouseInteractionHandleMouseLeave: () => void;
}

/**
 * Return type for the useMouseEventComposition hook
 */
export interface UseMouseEventCompositionReturn {
   /** Combined mouse move handler that calls all individual handlers */
   handleMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
   /** Combined mouse leave handler that calls all individual handlers */
   handleMouseLeave: () => void;
}

/**
 * useMouseEventComposition Hook
 *
 * Composes multiple mouse event handlers into unified handlers. This eliminates
 * the need for manual composition in the main component and provides a clean
 * interface for mouse event handling.
 *
 * @param options - Configuration object containing individual mouse handlers
 * @returns Unified mouse event handlers
 */
export function useMouseEventComposition({
   shadowHandleMouseMove,
   mouseInteractionHandleMouseMove,
   shadowHandleMouseLeave,
   mouseInteractionHandleMouseLeave,
}: UseMouseEventCompositionOptions): UseMouseEventCompositionReturn {
   // Combined mouse move handler
   const handleMouseMove = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
         shadowHandleMouseMove(e);
         mouseInteractionHandleMouseMove(e);
      },
      [shadowHandleMouseMove, mouseInteractionHandleMouseMove]
   );

   // Combined mouse leave handler
   const handleMouseLeave = useCallback(() => {
      shadowHandleMouseLeave();
      mouseInteractionHandleMouseLeave();
   }, [shadowHandleMouseLeave, mouseInteractionHandleMouseLeave]);

   return {
      handleMouseMove,
      handleMouseLeave,
   };
}
