'use client';

import React from 'react';
import BaseSelector from './base-selector';
import { status as allStatus, Status } from '@/src/tests/test-data/status';
import { useIssuesStore } from '@/src/state/store/issues-store';
import { renderStatusIcon } from '@/src/lib/lib/status-utils';
import type { BaseSelectorProps } from '@/src/components/standards/prop-interface-patterns';

interface StatusSelectorProps
   extends Omit<
      BaseSelectorProps<Status>,
      'items' | 'getItemKey' | 'getItemLabel' | 'getItemIcon'
   > {
   /** Whether to show counts for each status */
   showCounts?: boolean;
   /** Whether to show search functionality */
   searchable?: boolean;
   /** Trigger variant for the selector */
   triggerVariant?: 'button' | 'icon' | 'ghost';
   /** Size of the trigger button */
   triggerSize?: 'default' | 'xxs' | 'xs' | 'sm' | 'lg' | 'icon';
}

/**
 * StatusSelector - A standardized component for selecting issue statuses
 *
 * This component uses the BaseSelector to provide consistent behavior across
 * all status selection use cases in the application.
 *
 * @example
 * <StatusSelector
 *   selectedItem={status}
 *   onSelectionChange={handleStatusChange}
 *   showCounts={true}
 *   triggerVariant="icon"
 * />
 */
export function StatusSelector({
   selectedItem,
   onSelectionChange,
   showCounts = false,
   searchable = true,
   triggerVariant = 'button',
   triggerSize = 'sm',
   ...props
}: StatusSelectorProps) {
   const { filterByStatus } = useIssuesStore();

   return (
      <BaseSelector
         selectedItem={selectedItem}
         onSelectionChange={onSelectionChange}
         items={allStatus}
         getItemKey={(status) => status.id}
         getItemLabel={(status) => status.name}
         getItemIcon={(status) => renderStatusIcon(status.id)}
         getItemCount={showCounts ? (status) => filterByStatus(status.id).length : undefined}
         showCounts={showCounts}
         searchable={searchable}
         searchPlaceholder="Search statuses..."
         emptyMessage="No statuses found."
         triggerVariant={triggerVariant}
         triggerSize={triggerSize}
         placeholder="Select status..."
         {...props}
      />
   );
}

export default StatusSelector;
