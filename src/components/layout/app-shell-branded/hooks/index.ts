/**
 * Hooks Module
 *
 * Centralized exports for custom hooks used in the AppShell branded system.
 */

export { useMouseInteraction } from './use-mouse-interaction';
export { useVisualEffects } from './use-visual-effects';
export { useMouseEventComposition } from './use-mouse-event-composition';
export { useContainerStyling } from './use-container-styling';
export { useAppShellBranded } from './use-app-shell-branded';
export type {
   MouseInteractionState,
   MouseInteractionActions,
   UseMouseInteractionOptions,
   UseMouseInteractionReturn,
} from './use-mouse-interaction';
export type {
   MousePosition,
   LogoData,
   ContainerDimensions,
   UseVisualEffectsOptions,
   UseVisualEffectsReturn,
} from './use-visual-effects';
export type {
   UseMouseEventCompositionOptions,
   UseMouseEventCompositionReturn,
} from './use-mouse-event-composition';
export type {
   UseContainerStylingOptions,
   UseContainerStylingReturn,
} from './use-container-styling';
export type { UseAppShellBrandedOptions, UseAppShellBrandedReturn } from './use-app-shell-branded';
