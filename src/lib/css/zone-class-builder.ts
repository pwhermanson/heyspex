/**
 * Zone CSS Class Builder
 *
 * Provides elegant, type-safe CSS class generation for workspace zones
 */

import { cn } from '@/src/lib/lib/utils';

export type ZoneState = 'visible' | 'hidden' | 'fullscreen' | 'normal';
export type ZoneMode = 'push' | 'overlay';
export type ZoneName = 'a' | 'b' | 'c';

export interface ZoneClassConfig {
   zone: ZoneName;
   state: ZoneState;
   mode?: ZoneMode;
   isDragging?: boolean;
   isToggling?: boolean;
   customClasses?: string[];
}

// CSS class mapping
const ZONE_CLASSES = {
   base: (zone: ZoneName) => `workspace-zone-${zone}`,
   state: (zone: ZoneName, state: ZoneState) => `workspace-zone-${zone}-${state}`,
   mode: (zone: ZoneName, mode: ZoneMode) => `workspace-zone-${zone}-${mode}`,
   dragging: (zone: ZoneName) => `workspace-zone-${zone}-dragging`,
   toggling: (zone: ZoneName) => `workspace-zone-${zone}-toggling`,
} as const;

// Transition classes
const TRANSITION_CLASSES = {
   base: 'transition-all duration-[var(--layout-motion-duration-medium)] ease-[var(--layout-motion-easing)]',
   disabled: 'transition-none',
   layout: 'layout-transition-short motion-reduce:transition-none',
} as const;

// Z-index classes
const Z_INDEX_CLASSES = {
   'a': 'z-[var(--z-main-content)]',
   'b-push': 'z-[var(--z-workspace-zone-b-push)]',
   'b-overlay': 'z-[var(--z-workspace-zone-b-overlay)]',
} as const;

export class ZoneClassBuilder {
   private config: ZoneClassConfig;

   constructor(config: ZoneClassConfig) {
      this.config = config;
   }

   static create(config: ZoneClassConfig): ZoneClassBuilder {
      return new ZoneClassBuilder(config);
   }

   build(): string {
      const classes = [
         // Base zone class
         ZONE_CLASSES.base(this.config.zone),

         // State class
         ZONE_CLASSES.state(this.config.zone, this.config.state),

         // Mode class (if applicable)
         this.config.mode && ZONE_CLASSES.mode(this.config.zone, this.config.mode),

         // Interaction states
         this.config.isDragging && ZONE_CLASSES.dragging(this.config.zone),
         this.config.isToggling && ZONE_CLASSES.toggling(this.config.zone),

         // Transitions
         this.config.isToggling ? TRANSITION_CLASSES.disabled : TRANSITION_CLASSES.base,

         // Z-index
         this.getZIndexClass(),

         // Custom classes
         ...(this.config.customClasses || []),
      ].filter(Boolean);

      return cn(...classes);
   }

   private getZIndexClass(): string {
      if (this.config.zone === 'a') return Z_INDEX_CLASSES.a;
      if (this.config.zone === 'b') {
         return this.config.mode === 'overlay'
            ? Z_INDEX_CLASSES['b-overlay']
            : Z_INDEX_CLASSES['b-push'];
      }
      return '';
   }

   // Fluent API methods
   withMode(mode: ZoneMode): ZoneClassBuilder {
      return new ZoneClassBuilder({ ...this.config, mode });
   }

   withState(state: ZoneState): ZoneClassBuilder {
      return new ZoneClassBuilder({ ...this.config, state });
   }

   withDragging(isDragging: boolean): ZoneClassBuilder {
      return new ZoneClassBuilder({ ...this.config, isDragging });
   }

   withToggling(isToggling: boolean): ZoneClassBuilder {
      return new ZoneClassBuilder({ ...this.config, isToggling });
   }

   withCustomClasses(classes: string[]): ZoneClassBuilder {
      return new ZoneClassBuilder({
         ...this.config,
         customClasses: [...(this.config.customClasses || []), ...classes],
      });
   }
}

// Convenience functions
export function buildZoneClasses(config: ZoneClassConfig): string {
   return ZoneClassBuilder.create(config).build();
}

export function buildWorkspaceZoneAClasses(
   state: ZoneState,
   isToggling = false,
   customClasses?: string[]
): string {
   return ZoneClassBuilder.create({
      zone: 'a',
      state,
      isToggling,
      customClasses,
   }).build();
}

export function buildWorkspaceZoneBClasses(
   state: ZoneState,
   mode: ZoneMode,
   isDragging = false,
   customClasses?: string[]
): string {
   return ZoneClassBuilder.create({
      zone: 'b',
      state,
      mode,
      isDragging,
      customClasses,
   }).build();
}

// CSS variable helpers
export function getZoneCSSVariables(zone: ZoneName, state: ZoneState): Record<string, string> {
   const variables: Record<string, string> = {};

   if (zone === 'a') {
      switch (state) {
         case 'visible':
            variables['--left-width'] = '244px';
            variables['--right-width'] = '320px';
            variables['--grid-template-columns'] = '244px 1fr 320px';
            break;
         case 'fullscreen':
            variables['--left-width'] = '0px';
            variables['--right-width'] = '0px';
            variables['--grid-template-columns'] = '0px 1fr 0px';
            break;
         case 'hidden':
            // No variables needed for hidden state
            break;
      }
   }

   return variables;
}
