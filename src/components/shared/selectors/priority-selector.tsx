'use client';

import React from 'react';
import BaseSelector from './base-selector';
import { priorities, Priority } from '@/tests/test-data/priorities';
import { useIssuesStore } from '@/state/store/issues-store';
import type { BaseSelectorProps } from '@/src/components/standards/prop-interface-patterns';

interface PrioritySelectorProps
   extends Omit<
      BaseSelectorProps<Priority>,
      'items' | 'getItemKey' | 'getItemLabel' | 'getItemIcon'
   > {
   /** Whether to show counts for each priority */
   showCounts?: boolean;
   /** Whether to show search functionality */
   searchable?: boolean;
   /** Trigger variant for the selector */
   triggerVariant?: 'button' | 'icon' | 'ghost';
   /** Size of the trigger button */
   triggerSize?: 'default' | 'xxs' | 'xs' | 'sm' | 'lg' | 'icon';
}

/**
 * PrioritySelector - A standardized component for selecting issue priorities
 *
 * This component uses the BaseSelector to provide consistent behavior across
 * all priority selection use cases in the application.
 *
 * @example
 * <PrioritySelector
 *   selectedItem={priority}
 *   onSelectionChange={handlePriorityChange}
 *   showCounts={true}
 *   triggerVariant="button"
 * />
 */
export function PrioritySelector({
   selectedItem,
   onSelectionChange,
   showCounts = false,
   searchable = true,
   triggerVariant = 'button',
   triggerSize = 'sm',
   ...props
}: PrioritySelectorProps) {
   const { filterByPriority } = useIssuesStore();

   return (
      <BaseSelector
         selectedItem={selectedItem}
         onSelectionChange={onSelectionChange}
         items={priorities}
         getItemKey={(priority) => priority.id}
         getItemLabel={(priority) => priority.name}
         getItemIcon={(priority) => {
            const Icon = priority.icon;
            return <Icon className="text-muted-foreground size-4" />;
         }}
         getItemCount={showCounts ? (priority) => filterByPriority(priority.id).length : undefined}
         showCounts={showCounts}
         searchable={searchable}
         searchPlaceholder="Search priorities..."
         emptyMessage="No priorities found."
         triggerVariant={triggerVariant}
         triggerSize={triggerSize}
         placeholder="Select priority..."
         {...props}
      />
   );
}

export default PrioritySelector;
