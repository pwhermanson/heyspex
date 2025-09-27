/**
 * Base Zone Toggle Button Component
 *
 * A shared toggle button component that provides consistent behavior and styling
 * for all workspace zone toggle buttons.
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/src/lib/lib/utils';
import { BaseZoneToggleButtonProps } from '@/lib/zone-management';

// ============================================================================
// TYPES
// ============================================================================

export interface BaseZoneToggleButtonComponentProps extends BaseZoneToggleButtonProps {
   'zoneName': string;
   'iconVisible': React.ComponentType<{ className?: string }>;
   'iconHidden': React.ComponentType<{ className?: string }>;
   'labelVisible': string;
   'labelHidden': string;
   'data-testid'?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Base Zone Toggle Button Component
 *
 * Provides a unified toggle button pattern for all workspace zones with:
 * - Consistent styling and behavior
 * - Accessibility support
 * - Icon and label management
 * - Keyboard navigation
 */
export function BaseZoneToggleButton({
   zoneName,
   isVisible,
   onToggle,
   'iconVisible': IconVisible,
   'iconHidden': IconHidden,
   labelVisible,
   labelHidden,
   className,
   size = 'sm',
   variant = 'ghost',
   showLabel = false,
   'data-testid': testId,
}: BaseZoneToggleButtonComponentProps) {
   const Icon = isVisible ? IconVisible : IconHidden;
   const label = isVisible ? labelVisible : labelHidden;
   const ariaLabel = `${isVisible ? 'Hide' : 'Show'} ${zoneName} zone`;

   return (
      <Button
         variant={variant}
         size={size}
         onClick={onToggle}
         className={cn(
            'transition-all',
            'layout-transition-short',
            'motion-reduce:transition-none',
            className
         )}
         title={label}
         aria-label={ariaLabel}
         aria-pressed={isVisible}
         data-testid={testId}
         data-zone={zoneName}
         data-visible={isVisible}
      >
         <Icon className="h-4 w-4" />
         {showLabel && (
            <span className="ml-2">
               {isVisible ? 'Hide' : 'Show'} {zoneName} zone
            </span>
         )}
      </Button>
   );
}

// ============================================================================
// SPECIALIZED TOGGLE BUTTONS
// ============================================================================

/**
 * Workspace Zone A Toggle Button
 *
 * Specialized toggle button for Workspace Zone A with appropriate icons and labels.
 */
export type WorkspaceZoneAToggleButtonProps = Omit<
   BaseZoneToggleButtonComponentProps,
   'zoneName' | 'iconVisible' | 'iconHidden' | 'labelVisible' | 'labelHidden'
>;

export function WorkspaceZoneAToggleButton(props: WorkspaceZoneAToggleButtonProps) {
   // Import icons dynamically to avoid circular dependencies
   const PanelLeft = React.lazy(() =>
      import('lucide-react').then((mod) => ({ default: mod.PanelLeft }))
   );
   const PanelLeftClose = React.lazy(() =>
      import('lucide-react').then((mod) => ({ default: mod.PanelLeftClose }))
   );

   return (
      <React.Suspense fallback={<div className="h-4 w-4" />}>
         <BaseZoneToggleButton
            {...props}
            zoneName="a"
            iconVisible={PanelLeftClose}
            iconHidden={PanelLeft}
            labelVisible="Hide Workspace Zone A"
            labelHidden="Show Workspace Zone A"
         />
      </React.Suspense>
   );
}

/**
 * Workspace Zone B Toggle Button
 *
 * Specialized toggle button for Workspace Zone B with appropriate icons and labels.
 */
export type WorkspaceZoneBToggleButtonProps = Omit<
   BaseZoneToggleButtonComponentProps,
   'zoneName' | 'iconVisible' | 'iconHidden' | 'labelVisible' | 'labelHidden'
>;

export function WorkspaceZoneBToggleButton(props: WorkspaceZoneBToggleButtonProps) {
   // Import icons dynamically to avoid circular dependencies
   const PanelBottom = React.lazy(() =>
      import('lucide-react').then((mod) => ({ default: mod.PanelBottom }))
   );
   const PanelBottomClose = React.lazy(() =>
      import('lucide-react').then((mod) => ({ default: mod.PanelBottomClose }))
   );

   return (
      <React.Suspense fallback={<div className="h-4 w-4" />}>
         <BaseZoneToggleButton
            {...props}
            zoneName="b"
            iconVisible={PanelBottomClose}
            iconHidden={PanelBottom}
            labelVisible="Hide Workspace Zone B"
            labelHidden="Show Workspace Zone B"
         />
      </React.Suspense>
   );
}
