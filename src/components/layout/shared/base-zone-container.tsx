/**
 * Base Zone Container Component
 *
 * A shared base component that provides common functionality for all workspace zone containers.
 * This component implements the unified container pattern used by both Zone A and Zone B.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import {
   BaseZoneContainerProps,
   getZoneVisibilityClasses,
   getZoneModeClasses,
   getZoneZIndexClass,
   getZoneZIndexStyle,
} from '@/lib/zone-management';

// ============================================================================
// TYPES
// ============================================================================

export interface BaseZoneContainerComponentProps extends BaseZoneContainerProps {
   'zoneName': string;
   'mode'?: 'push' | 'overlay' | 'fullscreen';
   'zIndexKey'?: keyof typeof import('@/lib/z-index-management').Z_INDEX_LAYERS;
   'style'?: React.CSSProperties;
   'data-testid'?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Base Zone Container Component
 *
 * Provides a unified container pattern for all workspace zones with:
 * - Consistent CSS class generation
 * - Z-index management
 * - Mode-based styling
 * - Accessibility support
 */
export function BaseZoneContainer({
   zoneName,
   isVisible,
   mode = 'push',
   zIndexKey,
   children,
   className,
   style,
   'data-testid': testId,
}: BaseZoneContainerComponentProps) {
   // Generate CSS classes based on zone name, visibility, and mode
   const baseClasses = getZoneVisibilityClasses(zoneName, isVisible, className);
   const modeClasses = mode !== 'push' ? getZoneModeClasses(zoneName, mode) : '';
   const zIndexClass = zIndexKey ? getZoneZIndexClass(zIndexKey) : '';

   // Generate z-index style if needed
   const zIndexStyle = zIndexKey ? getZoneZIndexStyle(zIndexKey) : {};

   // Combine all styles
   const combinedStyle = {
      ...zIndexStyle,
      ...style,
   };

   return (
      <div
         className={cn(
            baseClasses,
            modeClasses,
            zIndexClass,
            // Base container styles
            'transition-all',
            'duration-[var(--layout-motion-duration-medium)]',
            'ease-[var(--layout-motion-easing)]'
         )}
         style={combinedStyle}
         data-testid={testId}
         data-zone={zoneName}
         data-visible={isVisible}
         data-mode={mode}
      >
         {children}
      </div>
   );
}

// ============================================================================
// SPECIALIZED CONTAINERS
// ============================================================================

/**
 * Workspace Zone A Container
 *
 * Specialized container for Workspace Zone A that uses the base container
 * with Zone A specific configuration.
 */
export interface WorkspaceZoneAContainerProps
   extends Omit<BaseZoneContainerComponentProps, 'zoneName'> {}

export function WorkspaceZoneAContainer(props: WorkspaceZoneAContainerProps) {
   return <BaseZoneContainer {...props} zoneName="a" zIndexKey="MAIN_CONTENT" />;
}

/**
 * Workspace Zone B Container
 *
 * Specialized container for Workspace Zone B that uses the base container
 * with Zone B specific configuration.
 */
export interface WorkspaceZoneBContainerProps
   extends Omit<BaseZoneContainerComponentProps, 'zoneName'> {
   height?: number;
}

export function WorkspaceZoneBContainer({
   height,
   mode = 'push',
   ...props
}: WorkspaceZoneBContainerProps) {
   const isOverlay = mode === 'overlay';

   // Overlay mode needs specific positioning and z-index
   const zIndexKey = isOverlay ? 'WORKSPACE_ZONE_B_OVERLAY' : 'WORKSPACE_ZONE_B_PUSH';

   // Overlay mode needs specific styles
   const overlayStyle = isOverlay
      ? {
           position: 'fixed' as const,
           left: 0,
           right: 0,
           bottom: 0,
           height: height ? `${height}px` : 'auto',
           backgroundColor: 'var(--workspace-zone-b-bg)',
           background: 'var(--workspace-zone-b-bg)',
        }
      : {};

   return (
      <BaseZoneContainer
         {...props}
         zoneName="b"
         mode={mode}
         zIndexKey={zIndexKey}
         style={{
            ...overlayStyle,
            ...props.style,
         }}
      />
   );
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
   BaseZoneContainer,
   type BaseZoneContainerComponentProps,
   type WorkspaceZoneAContainerProps,
   type WorkspaceZoneBContainerProps,
};
