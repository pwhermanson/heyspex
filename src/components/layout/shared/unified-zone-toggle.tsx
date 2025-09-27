/**
 * Unified Zone Toggle Component
 *
 * A single, configurable component that handles all workspace zone toggles
 * with different behaviors (2-way, 3-way, mode switching)
 */

import React from 'react';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/lib/utils';
import { useStateMachine } from '@/src/lib/state-machines/zone-state-machine';

export type ToggleType = 'binary' | 'cycle' | 'mode';
export type ToggleSize = 'sm' | 'md' | 'lg';
export type ToggleVariant = 'ghost' | 'outline' | 'default';

export interface ToggleConfig<T extends string = string> {
   type: ToggleType;
   states: T[];
   initialState: T;
   transitions?: Record<T, T>;
   icons: Record<T, React.ComponentType<{ className?: string }>>;
   labels: Record<T, string>;
   descriptions: Record<T, string>;
}

export interface UnifiedZoneToggleProps<T extends string = string> {
   'config': ToggleConfig<T>;
   'currentState': T;
   'onStateChange': (state: T) => void;
   'size'?: ToggleSize;
   'variant'?: ToggleVariant;
   'showLabel'?: boolean;
   'showDescription'?: boolean;
   'className'?: string;
   'disabled'?: boolean;
   'data-testid'?: string;
}

export function UnifiedZoneToggle<T extends string>({
   config,
   currentState,
   onStateChange,
   size = 'md',
   variant = 'ghost',
   showLabel = false,
   className,
   disabled = false,
   'data-testid': testId,
}: UnifiedZoneToggleProps<T>) {
   const { transition } = useStateMachine({
      states: config.states,
      initialState: config.initialState,
      transitions: config.transitions || createDefaultTransitions(config.states),
   });

   const handleToggle = () => {
      if (disabled) return;

      if (config.type === 'cycle') {
         const newState = transition();
         onStateChange(newState);
      } else if (config.type === 'binary') {
         const newState = currentState === config.states[0] ? config.states[1] : config.states[0];
         onStateChange(newState);
      } else if (config.type === 'mode') {
         const newState = transition();
         onStateChange(newState);
      }
   };

   const Icon = config.icons[currentState] as React.ComponentType<{ className?: string }>;
   const label = config.labels[currentState];
   const description = config.descriptions[currentState];

   const sizeClasses = {
      sm: 'h-6 w-6',
      md: 'h-8 w-8',
      lg: 'h-10 w-10',
   };

   return (
      <Button
         variant={variant}
         size="icon"
         onClick={handleToggle}
         disabled={disabled}
         className={cn(
            sizeClasses[size],
            'transition-all layout-transition-short motion-reduce:transition-none',
            className
         )}
         title={description}
         aria-label={`${label} - ${description}`}
         aria-pressed={config.type === 'binary' ? currentState === config.states[1] : undefined}
         data-testid={testId}
         data-state={currentState}
         data-type={config.type}
      >
         <Icon className="h-4 w-4" />
         {showLabel && <span className="ml-2 text-sm">{label}</span>}
      </Button>
   );
}

// Helper function to create default transitions for cycle toggles
function createDefaultTransitions<T extends string>(states: T[]): Record<T, T> {
   const transitions: Record<T, T> = {} as Record<T, T>;

   for (let i = 0; i < states.length; i++) {
      const current = states[i];
      const next = states[(i + 1) % states.length];
      transitions[current] = next;
   }

   return transitions;
}

// Predefined configurations for common toggles
export const WORKSPACE_ZONE_A_CONFIG: ToggleConfig<'normal' | 'fullscreen' | 'hidden'> = {
   type: 'cycle',
   states: ['normal', 'fullscreen', 'hidden'],
   initialState: 'normal',
   icons: {
      normal: () => <div className="h-4 w-4 bg-blue-500 rounded" />,
      fullscreen: () => <div className="h-4 w-4 bg-green-500 rounded" />,
      hidden: () => <div className="h-4 w-4 bg-gray-400 rounded" />,
   },
   labels: {
      normal: '3-Panel Layout',
      fullscreen: 'Panel B Fullscreen',
      hidden: 'Hidden',
   },
   descriptions: {
      normal: 'Show 3-panel layout with sidebars',
      fullscreen: 'Show only center panel in fullscreen',
      hidden: 'Hide all panels',
   },
};

export const WORKSPACE_ZONE_B_CONFIG: ToggleConfig<'push' | 'overlay'> = {
   type: 'mode',
   states: ['push', 'overlay'],
   initialState: 'push',
   icons: {
      push: () => <div className="h-4 w-4 bg-orange-500 rounded" />,
      overlay: () => <div className="h-4 w-4 bg-purple-500 rounded" />,
   },
   labels: {
      push: 'Push Mode',
      overlay: 'Overlay Mode',
   },
   descriptions: {
      push: 'Dock panel and push content',
      overlay: 'Float panel over content',
   },
};

// Specialized components for common use cases
export function WorkspaceZoneAToggle(
   props: Omit<UnifiedZoneToggleProps<'normal' | 'fullscreen' | 'hidden'>, 'config'>
) {
   return <UnifiedZoneToggle {...props} config={WORKSPACE_ZONE_A_CONFIG} />;
}

export function WorkspaceZoneBToggle(
   props: Omit<UnifiedZoneToggleProps<'push' | 'overlay'>, 'config'>
) {
   return <UnifiedZoneToggle {...props} config={WORKSPACE_ZONE_B_CONFIG} />;
}
