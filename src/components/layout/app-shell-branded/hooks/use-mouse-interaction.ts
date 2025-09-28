/**
 * Mouse Interaction Hook
 *
 * Custom hook for managing mouse interaction state and events.
 * Follows single responsibility principle by isolating mouse interaction logic.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { VISUAL_CONSTANTS } from '../visual-constants';

export interface MouseInteractionState {
   isMouseOver: boolean;
   isMouseMoving: boolean;
   isIdle: boolean;
   isFading: boolean;
   isShadowFading: boolean;
   isClient: boolean;
}

export interface MouseInteractionActions {
   handleMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
   handleMouseLeave: () => void;
   clearAllTimeouts: () => void;
}

export interface UseMouseInteractionOptions {
   onMouseMove?: (e: React.MouseEvent<HTMLDivElement>) => void;
   onMouseLeave?: () => void;
}

export interface UseMouseInteractionReturn extends MouseInteractionState, MouseInteractionActions {}

/**
 * Custom hook for managing mouse interaction state
 *
 * Features:
 * - Centralized mouse state management
 * - Automatic timeout handling for idle detection
 * - Client-side rendering detection
 * - Cleanup on unmount
 */
export function useMouseInteraction({
   onMouseMove,
   onMouseLeave,
}: UseMouseInteractionOptions = {}): UseMouseInteractionReturn {
   const [isMouseOver, setIsMouseOver] = useState(false);
   const [isMouseMoving, setIsMouseMoving] = useState(false);
   const [isIdle, setIsIdle] = useState(false);
   const [isFading, setIsFading] = useState(false);
   const [isShadowFading, setIsShadowFading] = useState(false);
   const [isClient, setIsClient] = useState(false);

   const timeoutRef = useRef<NodeJS.Timeout | null>(null);
   const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

   // Ensure client-side rendering for interactivity
   useEffect(() => {
      setIsClient(true);
   }, []);

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

         // Call external mouse move handler
         onMouseMove?.(e);

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
      [clearAllTimeouts, isClient, onMouseMove]
   );

   const handleMouseLeave = useCallback(() => {
      // Only handle mouse events on client side
      if (!isClient) return;

      // Call external mouse leave handler
      onMouseLeave?.();

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
   }, [clearAllTimeouts, isClient, onMouseLeave]);

   // Cleanup timeouts on unmount
   useEffect(() => {
      return () => {
         clearAllTimeouts();
      };
   }, [clearAllTimeouts]);

   return {
      // State
      isMouseOver,
      isMouseMoving,
      isIdle,
      isFading,
      isShadowFading,
      isClient,
      // Actions
      handleMouseMove,
      handleMouseLeave,
      clearAllTimeouts,
   };
}
