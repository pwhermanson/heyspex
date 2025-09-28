/**
 * Shadow Module Exports
 *
 * Centralized exports for the shadow system following single responsibility principle.
 */

export { SHADOW_CONSTANTS } from './shadow-constants';
export type { ShadowConstants } from './shadow-constants';

export {
   calculateLogoData,
   calculateShadowOffset,
   calculateSwirlingColor,
   generateShadowFilter,
   hasShadowChanged,
} from './shadow-calculations';
export type { ShadowOffset, LogoData, MousePosition } from './shadow-calculations';

export { useShadow } from './use-shadow';
export type { UseShadowOptions, UseShadowReturn } from './use-shadow';

export { ShadowLayer } from './shadow-layer';
export type { ShadowLayerProps } from './shadow-layer';
