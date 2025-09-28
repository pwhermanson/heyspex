/**
 * App Shell Branded Module
 *
 * Centralized exports for the App Shell Branded system.
 * This module contains all components and utilities related to the
 * interactive logo display and visual effects system.
 */

// Main Components
export { AppShellBranded } from './app-shell-branded';
export { AppShellBrandedSimple } from './app-shell-branded-simple';
export { StableAppShell } from './stable-app-shell';

// Shadow System
export * from './shadow';

// Hooks
export { useMouseInteraction, useVisualEffects } from './hooks';
export type {
   MouseInteractionState,
   MouseInteractionActions,
   UseMouseInteractionOptions,
   UseMouseInteractionReturn,
} from './hooks';

// Components
export { GridBackground, GlowEffect } from './components';
export type { GridBackgroundProps, GlowEffectProps } from './components';

// Constants and Utilities
export { VISUAL_CONSTANTS } from './visual-constants';
export { COMPONENT_STYLES, STYLE_GENERATORS } from './style-generators';

// Types
export type { AppShellBrandedProps } from './app-shell-branded';
export type { AppShellBrandedSimpleProps } from './app-shell-branded-simple';
