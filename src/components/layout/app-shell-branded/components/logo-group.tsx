/**
 * Logo Group Component
 *
 * Container component for the logo with all visual effects including:
 * - Black shadow base for shadow effect
 * - Explosive radial glow on hover
 * - Shadow layer integration
 * - Main logo with brightness changes
 *
 * This component extracts the complex logo group JSX from the main component
 * to follow the single use principle and improve maintainability.
 *
 * @file logo-group.tsx
 * @author App Shell Branded System
 * @version 1.0.0
 */

import React from 'react';
import { LogoImage } from './logo-image';
import { ShadowLayer } from '../shadow';
import { VISUAL_CONSTANTS } from '../visual-constants';
import { COMPONENT_STYLES, STYLE_GENERATORS } from '../style-generators';

/**
 * Props interface for LogoGroup component
 */
export interface LogoGroupProps {
   /** React ref for the main logo div */
   logoRef: React.RefObject<HTMLDivElement | null>;
   /** Whether mouse is over the logo group */
   isMouseOver: boolean;
   /** Whether the component is in idle state */
   isIdle: boolean;
   /** Shadow filter string for dynamic shadows */
   shadowFilter: string;
   /** Shadow opacity value */
   shadowOpacity: number;
   /** Whether shadow is fading */
   isShadowFading: boolean;
   /** Optional additional CSS classes */
   className?: string;
}

/**
 * LogoGroup Component
 *
 * Renders the complete logo group with all visual effects including
 * shadow base, explosive glow, shadow layer, and main logo.
 *
 * @param props - Component props
 * @returns JSX element containing the complete logo group
 */
export const LogoGroup: React.FC<LogoGroupProps> = ({
   logoRef,
   isMouseOver,
   isIdle,
   shadowFilter,
   shadowOpacity,
   isShadowFading,
   className = '',
}) => {
   return (
      <div
         className={`mb-6 group cursor-pointer relative ${className}`}
         style={{ zIndex: VISUAL_CONSTANTS.LOGO_Z_INDEX }}
         data-testid="logo-group"
      >
         {/* Black shadow base - creates the shadow effect */}
         <div
            className="h-auto w-auto max-w-[300px] absolute top-0 left-0 z-0"
            style={{
               filter: 'brightness(0)',
               WebkitFilter: 'brightness(0)',
            }}
         >
            <LogoImage src="/heyspex-logo-stacked.png" alt="" width={300} height={273} priority />
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
            <LogoImage
               src="/heyspex-logo-stacked.png"
               alt="HeySpex"
               width={VISUAL_CONSTANTS.LOGO_WIDTH}
               height={VISUAL_CONSTANTS.LOGO_HEIGHT}
               priority
            />
         </div>
      </div>
   );
};

LogoGroup.displayName = 'LogoGroup';
