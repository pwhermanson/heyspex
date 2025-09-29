/**
 * useContainerStyling Hook
 *
 * Handles container styling and conditional rendering logic for the main component.
 * This hook extracts the remaining styling and rendering logic to further reduce
 * the main component's responsibilities.
 *
 * @file use-container-styling.ts
 * @author App Shell Branded System
 * @version 1.0.0
 */

import { useMemo } from 'react';
import { cn } from '@/src/lib/lib/utils';

/**
 * Options for the useContainerStyling hook
 */
export interface UseContainerStylingOptions {
   /** Whether the client is ready for interactive features */
   isClient: boolean;
   /** Whether mouse is over the component */
   isMouseOver: boolean;
   /** Logo data for conditional rendering */
   logoData: any;
   /** Additional CSS classes */
   className?: string;
}

/**
 * Return type for the useContainerStyling hook
 */
export interface UseContainerStylingReturn {
   /** Container className with proper merging */
   containerClassName: string;
   /** Container inline styles */
   containerStyle: React.CSSProperties;
   /** Whether to show the glow effect */
   shouldShowGlowEffect: boolean;
}

/**
 * useContainerStyling Hook
 *
 * Provides container styling and conditional rendering logic for the main component.
 * This helps reduce the main component's responsibilities and centralizes styling logic.
 *
 * @param options - Configuration object
 * @returns Container styling and rendering logic
 */
export function useContainerStyling({
   isClient,
   isMouseOver,
   logoData,
   className = '',
}: UseContainerStylingOptions): UseContainerStylingReturn {
   // Container className with proper merging
   const containerClassName = useMemo(() => {
      return cn(
         'flex flex-col items-center justify-center h-full w-full',
         'bg-background text-foreground relative overflow-hidden',
         className
      );
   }, [className]);

   // Container inline styles
   const containerStyle = useMemo(
      () => ({
         zIndex: 0,
         position: 'absolute' as const,
         top: 0,
         left: 0,
         right: 0,
         bottom: 0,
      }),
      []
   );

   // Conditional rendering logic for glow effect
   const shouldShowGlowEffect = useMemo(() => {
      return isClient && isMouseOver && logoData;
   }, [isClient, isMouseOver, logoData]);

   return {
      containerClassName,
      containerStyle,
      shouldShowGlowEffect,
   };
}
