/**
 * Shared Zone Management Utilities
 *
 * This module extracts common patterns from both Workspace Zone A and Workspace Zone B
 * to create a unified architecture and reduce code duplication.
 *
 * Provides:
 * - Shared types and interfaces
 * - Common utility functions
 * - Unified state management patterns
 * - Consistent CSS class management
 * - Shared z-index utilities
 */

import { useCallback, useState, useEffect } from 'react';
import { ZIndex } from './z-index-management';

// ============================================================================
// SHARED TYPES
// ============================================================================

/**
 * Base zone state that all workspace zones extend
 */
export interface BaseZoneState {
   isVisible: boolean;
}

/**
 * Zone visibility modes
 */
export type ZoneVisibilityMode = 'visible' | 'hidden';

/**
 * Zone positioning modes (for overlay zones)
 */
export type ZonePositionMode = 'push' | 'overlay' | 'fullscreen';

/**
 * Base zone configuration
 */
export interface BaseZoneConfig {
   isVisible: boolean;
   mode?: ZonePositionMode;
   className?: string;
   zIndex?: keyof typeof ZIndex.layers;
}

/**
 * Zone container props that all zone containers should implement
 */
export interface BaseZoneContainerProps {
   isVisible: boolean;
   children: React.ReactNode;
   className?: string;
}

/**
 * Zone toggle button props
 */
export interface BaseZoneToggleButtonProps {
   isVisible: boolean;
   onToggle: () => void;
   className?: string;
   size?: 'sm' | 'md' | 'lg';
   variant?: 'ghost' | 'outline' | 'default';
   showLabel?: boolean;
}

// ============================================================================
// SHARED UTILITIES
// ============================================================================

/**
 * Generate CSS classes for zone visibility
 */
export function getZoneVisibilityClasses(
   zoneName: string,
   isVisible: boolean,
   className?: string
): string {
   const baseClass = `workspace-zone-${zoneName}`;
   const visibilityClass = isVisible
      ? `workspace-zone-${zoneName}-visible`
      : `workspace-zone-${zoneName}-hidden`;

   return [baseClass, visibilityClass, className].filter(Boolean).join(' ');
}

/**
 * Generate CSS classes for zone modes (overlay, push, etc.)
 */
export function getZoneModeClasses(
   zoneName: string,
   mode: ZonePositionMode,
   className?: string
): string {
   const baseClass = `workspace-zone-${zoneName}`;
   const modeClass = `workspace-zone-${zoneName}-${mode}`;

   return [baseClass, modeClass, className].filter(Boolean).join(' ');
}

/**
 * Get z-index class for a zone
 */
export function getZoneZIndexClass(zIndexKey: keyof typeof ZIndex.layers): string {
   return ZIndex.utils.getTailwindClass(zIndexKey);
}

/**
 * Get z-index style object for a zone
 */
export function getZoneZIndexStyle(zIndexKey: keyof typeof ZIndex.layers): { zIndex: number } {
   return ZIndex.utils.getStyle(zIndexKey);
}

// ============================================================================
// LOCAL STORAGE UTILITIES
// ============================================================================

/**
 * Save zone state to localStorage with error handling
 */
export function saveZoneStateToStorage(
   key: string,
   value: boolean | string | number,
   errorContext?: string
): void {
   try {
      localStorage.setItem(key, value.toString());
   } catch (error) {
      const context = errorContext || 'zone state';
      console.warn(`Failed to save ${context} to localStorage:`, error);
   }
}

/**
 * Load zone state from localStorage with fallback
 */
export function loadZoneStateFromStorage<T>(
   key: string,
   fallback: T,
   parser?: (value: string) => T
): T {
   try {
      const stored = localStorage.getItem(key);
      if (stored === null) return fallback;

      if (parser) {
         return parser(stored);
      }

      // Default parsers for common types
      if (typeof fallback === 'boolean') {
         return (stored === 'true') as T;
      }
      if (typeof fallback === 'number') {
         const parsed = parseFloat(stored);
         return (isNaN(parsed) ? fallback : parsed) as T;
      }

      return stored as T;
   } catch (error) {
      console.warn(`Failed to load zone state from localStorage (${key}):`, error);
      return fallback;
   }
}

// ============================================================================
// SHARED HOOKS
// ============================================================================

/**
 * Hook for managing zone visibility with localStorage persistence
 */
export function useZoneVisibility(
   storageKey: string,
   initialVisible: boolean = true,
   errorContext?: string
) {
   const [isVisible, setIsVisible] = useState(initialVisible);

   // Load from localStorage on mount
   useEffect(() => {
      const stored = loadZoneStateFromStorage(storageKey, initialVisible);
      setIsVisible(stored);
   }, [storageKey, initialVisible]);

   // Save to localStorage when visibility changes
   const setVisibility = useCallback(
      (visible: boolean) => {
         setIsVisible(visible);
         saveZoneStateToStorage(storageKey, visible, errorContext);
      },
      [storageKey, errorContext]
   );

   // Toggle visibility
   const toggleVisibility = useCallback(() => {
      setVisibility(!isVisible);
   }, [isVisible, setVisibility]);

   return {
      isVisible,
      setVisibility,
      toggleVisibility,
   };
}

/**
 * Hook for managing zone mode with localStorage persistence
 */
export function useZoneMode(
   storageKey: string,
   initialMode: ZonePositionMode = 'push',
   errorContext?: string
) {
   const [mode, setMode] = useState<ZonePositionMode>(initialMode);

   // Load from localStorage on mount
   useEffect(() => {
      const stored = loadZoneStateFromStorage(storageKey, initialMode, (value) => {
         if (value === 'push' || value === 'overlay' || value === 'fullscreen') {
            return value as ZonePositionMode;
         }
         return initialMode;
      });
      setMode(stored);
   }, [storageKey, initialMode]);

   // Save to localStorage when mode changes
   const setModeWithPersistence = useCallback(
      (newMode: ZonePositionMode) => {
         setMode(newMode);
         saveZoneStateToStorage(storageKey, newMode, errorContext);
      },
      [storageKey, errorContext]
   );

   return {
      mode,
      setMode: setModeWithPersistence,
   };
}

// ============================================================================
// TRANSITION UTILITIES
// ============================================================================

/**
 * Add transition disabling class during operations
 */
export function disableTransitionsTemporarily(element: HTMLElement, duration: number = 100): void {
   element.classList.add('workspace-zone-toggling');

   setTimeout(() => {
      element.classList.remove('workspace-zone-toggling');
   }, duration);
}

/**
 * Check if transitions should be disabled based on user preferences
 */
export function shouldDisableTransitions(): boolean {
   if (typeof window === 'undefined') return false;
   return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// ============================================================================
// ZONE VALIDATION
// ============================================================================

/**
 * Validate zone configuration
 */
export function validateZoneConfig(config: BaseZoneConfig): string[] {
   const errors: string[] = [];

   if (typeof config.isVisible !== 'boolean') {
      errors.push('isVisible must be a boolean');
   }

   if (config.mode && !['push', 'overlay', 'fullscreen'].includes(config.mode)) {
      errors.push('mode must be one of: push, overlay, fullscreen');
   }

   if (config.zIndex && !ZIndex.layers[config.zIndex]) {
      errors.push(`Invalid zIndex: ${config.zIndex}`);
   }

   return errors;
}

// ============================================================================
// EXPORTS
// ============================================================================

export const ZoneManagement = {
   // Types
   BaseZoneState,
   ZoneVisibilityMode,
   ZonePositionMode,
   BaseZoneConfig,
   BaseZoneContainerProps,
   BaseZoneToggleButtonProps,

   // Utilities
   getZoneVisibilityClasses,
   getZoneModeClasses,
   getZoneZIndexClass,
   getZoneZIndexStyle,
   saveZoneStateToStorage,
   loadZoneStateFromStorage,
   disableTransitionsTemporarily,
   shouldDisableTransitions,
   validateZoneConfig,

   // Hooks
   useZoneVisibility,
   useZoneMode,
} as const;
