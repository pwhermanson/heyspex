/**
 * Shared Layout Components
 *
 * This module exports all shared components and utilities used across
 * different workspace zones to maintain consistency and reduce duplication.
 */

// Base components
export {
   BaseZoneContainer,
   WorkspaceZoneAContainer,
   WorkspaceZoneBContainer,
   type BaseZoneContainerComponentProps,
   type WorkspaceZoneAContainerProps,
   type WorkspaceZoneBContainerProps,
} from './base-zone-container';

export {
   BaseZoneToggleButton,
   WorkspaceZoneAToggleButton,
   WorkspaceZoneBToggleButton,
   type BaseZoneToggleButtonComponentProps,
   type WorkspaceZoneAToggleButtonProps,
   type WorkspaceZoneBToggleButtonProps,
} from './base-zone-toggle-button';

// Re-export zone management utilities for convenience
export {
   ZoneManagement,
   type BaseZoneState,
   type ZoneVisibilityMode,
   type ZonePositionMode,
   type BaseZoneConfig,
   type BaseZoneContainerProps,
   type BaseZoneToggleButtonProps,
   getZoneVisibilityClasses,
   getZoneModeClasses,
   getZoneZIndexClass,
   getZoneZIndexStyle,
   saveZoneStateToStorage,
   loadZoneStateFromStorage,
   disableTransitionsTemporarily,
   shouldDisableTransitions,
   validateZoneConfig,
   useZoneVisibility,
   useZoneMode,
} from '@/lib/zone-management';
