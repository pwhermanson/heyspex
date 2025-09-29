/**
 * Shadow Layer Component
 *
 * Optimized shadow rendering component that follows single responsibility principle.
 * Handles only shadow-related rendering with performance optimizations.
 */

import React, { memo } from 'react';
import Image from 'next/image';
import { SHADOW_CONSTANTS } from './shadow-constants';

export interface ShadowLayerProps {
   shadowFilter: string;
   shadowOpacity: number;
   isShadowFading: boolean;
   logoWidth: number;
   logoHeight: number;
   logoSrc: string;
   logoSrcSet?: string;
   logoSizes?: string;
   className?: string;
}

/**
 * Optimized Shadow Layer Component
 *
 * Features:
 * - Single responsibility: only handles shadow rendering
 * - Optimized with React.memo to prevent unnecessary re-renders
 * - Efficient CSS transitions and transforms
 * - Minimal DOM manipulation
 */
export const ShadowLayer = memo<ShadowLayerProps>(function ShadowLayer({
   shadowFilter,
   shadowOpacity,
   isShadowFading,
   logoWidth,
   logoHeight,
   logoSrc,
   logoSrcSet,
   logoSizes,
   className = '',
}) {
   return (
      <div
         className={`h-auto w-auto absolute top-0 left-0 z-0 ${className}`}
         style={{
            maxWidth: `${logoWidth}px`,
            filter: shadowFilter,
            WebkitFilter: shadowFilter,
            transition: isShadowFading
               ? `opacity ${SHADOW_CONSTANTS.FADE_TRANSITION_DURATION} ease-out, filter ${SHADOW_CONSTANTS.FADE_TRANSITION_DURATION} ease-out`
               : `filter ${SHADOW_CONSTANTS.FILTER_TRANSITION_DURATION} ease-out`,
            opacity: shadowOpacity,
            // Use transform3d to enable hardware acceleration
            transform: 'translate3d(0, 0, 0)',
            willChange: 'filter, opacity',
         }}
         data-testid="shadow-layer"
      >
         <Image
            src={logoSrc}
            alt=""
            width={logoWidth}
            height={logoHeight}
            className="h-auto w-auto"
            style={{ maxWidth: `${logoWidth}px` }}
            priority
            // Optional performance optimizations
            {...(logoSrcSet && { srcSet: logoSrcSet })}
            {...(logoSizes && { sizes: logoSizes })}
            // Disable lazy loading for immediate rendering
            loading="eager"
            // Optimize image quality for shadow effects
            quality={90}
         />
      </div>
   );
});

ShadowLayer.displayName = 'ShadowLayer';
