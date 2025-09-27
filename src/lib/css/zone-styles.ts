/**
 * Zone Styles System
 *
 * Provides elegant CSS variable management and dynamic styling for workspace zones
 */

import React from 'react';

export interface ZoneStyleConfig {
   zone: 'a' | 'b' | 'c';
   state: 'visible' | 'hidden' | 'fullscreen' | 'normal';
   mode?: 'push' | 'overlay';
   dimensions?: {
      width?: number;
      height?: number;
      leftWidth?: number;
      rightWidth?: number;
   };
   position?: {
      top?: number;
      bottom?: number;
      left?: number;
      right?: number;
   };
   zIndex?: number;
}

export class ZoneStyleManager {
   private static instance: ZoneStyleManager;
   private rootElement: HTMLElement;

   private constructor() {
      this.rootElement = document.documentElement;
   }

   static getInstance(): ZoneStyleManager {
      if (!ZoneStyleManager.instance) {
         ZoneStyleManager.instance = new ZoneStyleManager();
      }
      return ZoneStyleManager.instance;
   }

   applyZoneStyles(config: ZoneStyleConfig): void {
      const variables = this.generateCSSVariables(config);

      Object.entries(variables).forEach(([property, value]) => {
         this.rootElement.style.setProperty(property, value);
      });
   }

   private generateCSSVariables(config: ZoneStyleConfig): Record<string, string> {
      const variables: Record<string, string> = {};

      // Zone-specific variables
      const zonePrefix = `--workspace-zone-${config.zone}`;

      // State-based variables
      switch (config.state) {
         case 'visible':
            if (config.zone === 'a') {
               variables[`${zonePrefix}-left-width`] = `${config.dimensions?.leftWidth || 244}px`;
               variables[`${zonePrefix}-right-width`] = `${config.dimensions?.rightWidth || 320}px`;
               variables[`${zonePrefix}-grid-template-columns`] =
                  `${config.dimensions?.leftWidth || 244}px 1fr ${config.dimensions?.rightWidth || 320}px`;
            }
            break;

         case 'fullscreen':
            if (config.zone === 'a') {
               variables[`${zonePrefix}-left-width`] = '0px';
               variables[`${zonePrefix}-right-width`] = '0px';
               variables[`${zonePrefix}-grid-template-columns`] = '0px 1fr 0px';
            }
            break;

         case 'hidden':
            if (config.zone === 'a') {
               variables[`${zonePrefix}-display`] = 'none';
            }
            break;
      }

      // Mode-based variables
      if (config.mode) {
         variables[`${zonePrefix}-mode`] = config.mode;

         if (config.zone === 'b') {
            if (config.mode === 'overlay') {
               variables[`${zonePrefix}-position`] = 'fixed';
               variables[`${zonePrefix}-z-index`] = 'var(--z-workspace-zone-b-overlay)';
            } else {
               variables[`${zonePrefix}-position`] = 'relative';
               variables[`${zonePrefix}-z-index`] = 'var(--z-workspace-zone-b-push)';
            }
         }
      }

      // Dimension variables
      if (config.dimensions) {
         if (config.dimensions.width) {
            variables[`${zonePrefix}-width`] = `${config.dimensions.width}px`;
         }
         if (config.dimensions.height) {
            variables[`${zonePrefix}-height`] = `${config.dimensions.height}px`;
         }
      }

      // Position variables
      if (config.position) {
         Object.entries(config.position).forEach(([key, value]) => {
            if (value !== undefined) {
               variables[`${zonePrefix}-${key}`] = `${value}px`;
            }
         });
      }

      // Z-index
      if (config.zIndex !== undefined) {
         variables[`${zonePrefix}-z-index`] = config.zIndex.toString();
      }

      return variables;
   }

   // Animation helpers
   enableTransitions(zone: string): void {
      this.rootElement.classList.remove(`${zone}-toggling`);
   }

   disableTransitions(zone: string): void {
      this.rootElement.classList.add(`${zone}-toggling`);
   }

   // Batch updates for performance
   batchUpdate(updates: ZoneStyleConfig[]): void {
      const allVariables: Record<string, string> = {};

      updates.forEach((config) => {
         const variables = this.generateCSSVariables(config);
         Object.assign(allVariables, variables);
      });

      Object.entries(allVariables).forEach(([property, value]) => {
         this.rootElement.style.setProperty(property, value);
      });
   }
}

// React hook for zone styles
export function useZoneStyles(config: ZoneStyleConfig) {
   const manager = ZoneStyleManager.getInstance();

   React.useEffect(() => {
      manager.applyZoneStyles(config);
   }, [config, manager]);

   return {
      applyStyles: manager.applyZoneStyles.bind(manager),
      enableTransitions: manager.enableTransitions.bind(manager),
      disableTransitions: manager.disableTransitions.bind(manager),
   };
}

// CSS class generator with variables
export function generateZoneCSSClasses(config: ZoneStyleConfig): string {
   const classes = [
      `workspace-zone-${config.zone}`,
      `workspace-zone-${config.zone}-${config.state}`,
      config.mode && `workspace-zone-${config.zone}-${config.mode}`,
   ].filter(Boolean);

   return classes.join(' ');
}

// Predefined style configurations
export const ZONE_STYLE_PRESETS = {
   'workspace-zone-a-visible': {
      zone: 'a' as const,
      state: 'visible' as const,
      dimensions: { leftWidth: 244, rightWidth: 320 },
   },
   'workspace-zone-a-fullscreen': {
      zone: 'a' as const,
      state: 'fullscreen' as const,
      dimensions: { leftWidth: 0, rightWidth: 0 },
   },
   'workspace-zone-a-hidden': {
      zone: 'a' as const,
      state: 'hidden' as const,
   },
   'workspace-zone-b-push': {
      zone: 'b' as const,
      state: 'visible' as const,
      mode: 'push' as const,
   },
   'workspace-zone-b-overlay': {
      zone: 'b' as const,
      state: 'visible' as const,
      mode: 'overlay' as const,
   },
} as const;
