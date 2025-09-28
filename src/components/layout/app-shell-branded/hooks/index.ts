/**
 * Hooks Module
 *
 * Centralized exports for custom hooks used in the AppShell branded system.
 */

export { useMouseInteraction } from './use-mouse-interaction';
export { useVisualEffects } from './use-visual-effects';
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
