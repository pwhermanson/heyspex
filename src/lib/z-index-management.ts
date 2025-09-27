/**
 * Z-Index Management System
 *
 * Centralized z-index management for the HeySpex application to prevent
 * z-index conflicts and maintain a consistent layering hierarchy.
 *
 * This system provides:
 * - Predefined z-index values for different UI layers
 * - Type-safe access to z-index values
 * - Documentation of the layering hierarchy
 * - Utilities for dynamic z-index calculation
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/z-index
 */

/**
 * Z-Index Layer Hierarchy
 *
 * The z-index values are organized in layers with clear separation:
 *
 * 0-9:     Background layers (app shell, decorative elements)
 * 10-19:   Content layers (main content, panels)
 * 20-29:   Control layers (bars, headers, controls)
 * 30-39:   Interactive layers (buttons, inputs, interactive elements)
 * 40-49:   Overlay layers (modals, dropdowns, tooltips)
 * 50-59:   High-priority overlays (command palette, critical modals)
 * 60-69:   System overlays (notifications, alerts)
 * 70-79:   Debug/development layers
 * 80-89:   Reserved for future use
 * 90-99:   Critical system layers (error boundaries, loading states)
 * 100+:    Emergency/override layers (use sparingly)
 */

export const Z_INDEX_LAYERS = {
   // Background layers (0-9)
   BACKGROUND: 0,
   APP_SHELL: 0,
   DECORATIVE: 1,
   GLOW_EFFECTS: 2,

   // Content layers (10-19)
   MAIN_CONTENT: 10,
   PANEL_CONTENT: 10,
   SIDEBAR_CONTENT: 10,
   STICKY_HEADERS: 10,

   // Control layers (20-29)
   GLOBAL_CONTROL_BAR: 20,
   PANEL_CONTROL_BAR: 20,
   SCREEN_CONTROL_BAR: 10, // Note: Lower than panel control bar
   WORKSPACE_ZONE_B: 20,

   // Interactive layers (30-39)
   INTERACTIVE_ELEMENTS: 30,
   BUTTONS: 30,
   INPUTS: 30,
   DRAG_HANDLES: 50, // Higher for drag interactions

   // Overlay layers (40-49)
   TOOLTIPS: 40,
   DROPDOWN_MENUS: 110, // Higher than Workspace Zone B overlay
   POPOVERS: 45,
   SELECT_DROPDOWNS: 110, // Higher than Workspace Zone B overlay
   CONTEXT_MENUS: 45,
   SHEETS: 50,

   // High-priority overlays (50-59)
   COMMAND_PALETTE: 250, // Highest priority - above everything
   MODALS: 200, // Using higher value for critical modals
   DIALOGS: 200,

   // System overlays (60-69)
   NOTIFICATIONS: 60,
   ALERTS: 60,
   LOADING_OVERLAYS: 60,

   // Debug/development layers (70-79)
   DEBUG_OVERLAYS: 70,
   DEV_TOOLS: 70,

   // Reserved layers (80-89)
   RESERVED_80: 80,
   RESERVED_85: 85,
   RESERVED_90: 90,

   // Critical system layers (90-99)
   ERROR_BOUNDARIES: 90,
   CRITICAL_LOADING: 90,

   // Emergency/override layers (100+)
   EMERGENCY_OVERRIDE: 100,
   WORKSPACE_ZONE_B_OVERLAY: 100, // Specific high-priority overlay
   WORKSPACE_ZONE_B_PUSH: 50, // Lower priority for push mode
} as const;

/**
 * Z-Index Layer Categories
 *
 * Grouped by functional purpose for easier management
 */
export const Z_INDEX_CATEGORIES = {
   BACKGROUND: {
      APP_SHELL: Z_INDEX_LAYERS.APP_SHELL,
      DECORATIVE: Z_INDEX_LAYERS.DECORATIVE,
      GLOW_EFFECTS: Z_INDEX_LAYERS.GLOW_EFFECTS,
   },

   CONTENT: {
      MAIN_CONTENT: Z_INDEX_LAYERS.MAIN_CONTENT,
      PANEL_CONTENT: Z_INDEX_LAYERS.PANEL_CONTENT,
      SIDEBAR_CONTENT: Z_INDEX_LAYERS.SIDEBAR_CONTENT,
      STICKY_HEADERS: Z_INDEX_LAYERS.STICKY_HEADERS,
   },

   CONTROLS: {
      GLOBAL_CONTROL_BAR: Z_INDEX_LAYERS.GLOBAL_CONTROL_BAR,
      PANEL_CONTROL_BAR: Z_INDEX_LAYERS.PANEL_CONTROL_BAR,
      SCREEN_CONTROL_BAR: Z_INDEX_LAYERS.SCREEN_CONTROL_BAR,
      WORKSPACE_ZONE_B: Z_INDEX_LAYERS.WORKSPACE_ZONE_B,
   },

   INTERACTIVE: {
      ELEMENTS: Z_INDEX_LAYERS.INTERACTIVE_ELEMENTS,
      BUTTONS: Z_INDEX_LAYERS.BUTTONS,
      INPUTS: Z_INDEX_LAYERS.INPUTS,
      DRAG_HANDLES: Z_INDEX_LAYERS.DRAG_HANDLES,
   },

   OVERLAYS: {
      TOOLTIPS: Z_INDEX_LAYERS.TOOLTIPS,
      DROPDOWN_MENUS: Z_INDEX_LAYERS.DROPDOWN_MENUS,
      POPOVERS: Z_INDEX_LAYERS.POPOVERS,
      SELECT_DROPDOWNS: Z_INDEX_LAYERS.SELECT_DROPDOWNS,
      CONTEXT_MENUS: Z_INDEX_LAYERS.CONTEXT_MENUS,
      SHEETS: Z_INDEX_LAYERS.SHEETS,
   },

   CRITICAL: {
      COMMAND_PALETTE: Z_INDEX_LAYERS.COMMAND_PALETTE,
      MODALS: Z_INDEX_LAYERS.MODALS,
      DIALOGS: Z_INDEX_LAYERS.DIALOGS,
   },

   SYSTEM: {
      NOTIFICATIONS: Z_INDEX_LAYERS.NOTIFICATIONS,
      ALERTS: Z_INDEX_LAYERS.ALERTS,
      LOADING_OVERLAYS: Z_INDEX_LAYERS.LOADING_OVERLAYS,
   },
} as const;

/**
 * Type definitions for z-index values
 */
export type ZIndexLayer = keyof typeof Z_INDEX_LAYERS;
export type ZIndexCategory = keyof typeof Z_INDEX_CATEGORIES;
export type ZIndexValue = (typeof Z_INDEX_LAYERS)[ZIndexLayer];

/**
 * Utility functions for z-index management
 */
export const ZIndexUtils = {
   /**
    * Get z-index value by layer name
    */
   get: (layer: ZIndexLayer): ZIndexValue => {
      return Z_INDEX_LAYERS[layer];
   },

   /**
    * Get z-index value by category and sub-layer
    */
   getByCategory: (category: ZIndexCategory, subLayer: string): number => {
      const categoryLayers = Z_INDEX_CATEGORIES[category] as Record<string, number>;
      return categoryLayers[subLayer] || 0;
   },

   /**
    * Generate Tailwind CSS z-index class
    */
   getTailwindClass: (layer: ZIndexLayer): string => {
      const value = Z_INDEX_LAYERS[layer];
      // Use standard Tailwind z-index classes for common values
      const standardClasses: Record<number, string> = {
         0: 'z-0',
         1: 'z-10',
         2: 'z-20',
         10: 'z-10',
         20: 'z-20',
         30: 'z-30',
         40: 'z-40',
         45: 'z-[45]',
         50: 'z-50',
         60: 'z-60',
         70: 'z-70',
         80: 'z-80',
         90: 'z-90',
         100: 'z-[100]',
         110: 'z-[110]',
         200: 'z-[200]',
         250: 'z-[250]',
      };

      return standardClasses[value] || 'z-50'; // fallback to z-50
   },

   /**
    * Generate inline style object with z-index
    */
   getStyle: (layer: ZIndexLayer): { zIndex: number } => {
      return { zIndex: Z_INDEX_LAYERS[layer] };
   },

   /**
    * Check if a z-index value is within a specific range
    */
   isInRange: (value: number, min: number, max: number): boolean => {
      return value >= min && value <= max;
   },

   /**
    * Get the next available z-index in a category
    */
   getNextInCategory: (category: ZIndexCategory): number => {
      const categoryLayers = Z_INDEX_CATEGORIES[category] as Record<string, number>;
      const values = Object.values(categoryLayers);
      return Math.max(...values) + 1;
   },

   /**
    * Validate z-index value against layer hierarchy
    */
   validate: (value: number, expectedLayer: ZIndexLayer): boolean => {
      const expectedValue = Z_INDEX_LAYERS[expectedLayer];
      return value === expectedValue;
   },
} as const;

/**
 * Z-Index Conflict Detection
 *
 * Utilities to detect and prevent z-index conflicts
 */
export const ZIndexConflictDetection = {
   /**
    * Check for potential z-index conflicts
    */
   checkConflicts: (usedValues: number[]): Array<{ value: number; conflicts: number[] }> => {
      const conflicts: Array<{ value: number; conflicts: number[] }> = [];

      for (let i = 0; i < usedValues.length; i++) {
         const current = usedValues[i];
         const conflicting = usedValues.filter(
            (val, index) => index !== i && Math.abs(val - current) < 5
         );

         if (conflicting.length > 0) {
            conflicts.push({ value: current, conflicts: conflicting });
         }
      }

      return conflicts;
   },

   /**
    * Get recommended z-index value to avoid conflicts
    */
   getRecommendedValue: (preferredLayer: ZIndexLayer, usedValues: number[]): number => {
      const baseValue = Z_INDEX_LAYERS[preferredLayer];
      const conflicts = usedValues.filter((val) => Math.abs(val - baseValue) < 5);

      if (conflicts.length === 0) {
         return baseValue;
      }

      // Find next available value
      let recommended = baseValue + 1;
      while (usedValues.includes(recommended)) {
         recommended++;
      }

      return recommended;
   },
} as const;

/**
 * CSS Custom Properties for z-index values
 *
 * These can be used in CSS files for consistent z-index management
 */
export const Z_INDEX_CSS_VARS = {
   '--z-background': Z_INDEX_LAYERS.BACKGROUND,
   '--z-app-shell': Z_INDEX_LAYERS.APP_SHELL,
   '--z-decorative': Z_INDEX_LAYERS.DECORATIVE,
   '--z-glow-effects': Z_INDEX_LAYERS.GLOW_EFFECTS,
   '--z-main-content': Z_INDEX_LAYERS.MAIN_CONTENT,
   '--z-panel-content': Z_INDEX_LAYERS.PANEL_CONTENT,
   '--z-sidebar-content': Z_INDEX_LAYERS.SIDEBAR_CONTENT,
   '--z-sticky-headers': Z_INDEX_LAYERS.STICKY_HEADERS,
   '--z-global-control-bar': Z_INDEX_LAYERS.GLOBAL_CONTROL_BAR,
   '--z-panel-control-bar': Z_INDEX_LAYERS.PANEL_CONTROL_BAR,
   '--z-screen-control-bar': Z_INDEX_LAYERS.SCREEN_CONTROL_BAR,
   '--z-workspace-zone-b': Z_INDEX_LAYERS.WORKSPACE_ZONE_B,
   '--z-interactive-elements': Z_INDEX_LAYERS.INTERACTIVE_ELEMENTS,
   '--z-buttons': Z_INDEX_LAYERS.BUTTONS,
   '--z-inputs': Z_INDEX_LAYERS.INPUTS,
   '--z-drag-handles': Z_INDEX_LAYERS.DRAG_HANDLES,
   '--z-tooltips': Z_INDEX_LAYERS.TOOLTIPS,
   '--z-dropdown-menus': Z_INDEX_LAYERS.DROPDOWN_MENUS,
   '--z-popovers': Z_INDEX_LAYERS.POPOVERS,
   '--z-select-dropdowns': Z_INDEX_LAYERS.SELECT_DROPDOWNS,
   '--z-context-menus': Z_INDEX_LAYERS.CONTEXT_MENUS,
   '--z-sheets': Z_INDEX_LAYERS.SHEETS,
   '--z-command-palette': Z_INDEX_LAYERS.COMMAND_PALETTE,
   '--z-modals': Z_INDEX_LAYERS.MODALS,
   '--z-dialogs': Z_INDEX_LAYERS.DIALOGS,
   '--z-notifications': Z_INDEX_LAYERS.NOTIFICATIONS,
   '--z-alerts': Z_INDEX_LAYERS.ALERTS,
   '--z-loading-overlays': Z_INDEX_LAYERS.LOADING_OVERLAYS,
   '--z-debug-overlays': Z_INDEX_LAYERS.DEBUG_OVERLAYS,
   '--z-error-boundaries': Z_INDEX_LAYERS.ERROR_BOUNDARIES,
   '--z-emergency-override': Z_INDEX_LAYERS.EMERGENCY_OVERRIDE,
   '--z-workspace-zone-b-overlay': Z_INDEX_LAYERS.WORKSPACE_ZONE_B_OVERLAY,
   '--z-workspace-zone-b-push': Z_INDEX_LAYERS.WORKSPACE_ZONE_B_PUSH,
} as const;

/**
 * Export the main z-index management object
 */
export const ZIndex = {
   layers: Z_INDEX_LAYERS,
   categories: Z_INDEX_CATEGORIES,
   utils: ZIndexUtils,
   conflictDetection: ZIndexConflictDetection,
   cssVars: Z_INDEX_CSS_VARS,
} as const;

export default ZIndex;
