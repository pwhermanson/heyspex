'use client';

import React from 'react';
import BaseSelector from './base-selector';
import { labels, LabelInterface } from '@/tests/test-data/labels';
import { useIssuesStore } from '@/state/store/issues-store';
import { TagIcon } from 'lucide-react';
import { cn } from '@/lib/lib/utils';

interface LabelSelectorProps {
   /** Currently selected labels */
   selectedLabels: LabelInterface[];
   /** Callback when selection changes */
   onChange: (labels: LabelInterface[]) => void;
   /** Whether to show counts for each label */
   showCounts?: boolean;
   /** Whether to show search functionality */
   searchable?: boolean;
   /** Trigger variant for the selector */
   triggerVariant?: 'button' | 'icon' | 'ghost';
   /** Size of the trigger button */
   triggerSize?: 'default' | 'xxs' | 'xs' | 'sm' | 'lg' | 'icon';
   /** Additional className for the component */
   className?: string;
}

/**
 * LabelSelector - A specialized component for multi-select label selection
 *
 * This component handles the unique multi-select behavior for labels,
 * using the BaseSelector as a foundation but with custom trigger rendering.
 *
 * @example
 * <LabelSelector
 *   selectedLabels={labels}
 *   onChange={handleLabelsChange}
 *   showCounts={true}
 *   triggerVariant="button"
 * />
 */
export function LabelSelector({
   selectedLabels,
   showCounts = false,
   searchable = true,
   triggerVariant = 'button',
   triggerSize = 'sm',
   className,
   ...props
}: LabelSelectorProps) {
   const { filterByLabel } = useIssuesStore();

   // Custom trigger renderer for labels
   const renderLabelTrigger = React.useCallback(
      ({
         isOpen,
         disabled,
      }: {
         selectedItem: LabelInterface | null;
         selectedLabel: string;
         selectedIcon: React.ReactNode | null;
         isOpen: boolean;
         disabled: boolean;
      }) => {
         return (
            <div
               className={cn(
                  'flex items-center justify-center',
                  selectedLabels.length === 0 && 'size-7',
                  className
               )}
               role="combobox"
               aria-expanded={isOpen}
               aria-disabled={disabled}
               aria-controls="label-selector-listbox"
            >
               <TagIcon className="size-4" />
               {selectedLabels.length > 0 && (
                  <div className="flex -space-x-0.5">
                     {selectedLabels.map((label) => (
                        <div
                           key={label.id}
                           className="size-3 rounded-full"
                           style={{ backgroundColor: label.color }}
                        />
                     ))}
                  </div>
               )}
            </div>
         );
      },
      [selectedLabels, className]
   );

   return (
      <BaseSelector
         selectedItem={selectedLabels[0] || undefined} // Use first selected label for display
         onSelectionChange={() => {}} // Handled by custom toggle logic
         items={labels}
         getItemKey={(label) => label.id}
         getItemLabel={(label) => label.name}
         getItemIcon={(label) => (
            <div className="size-3 rounded-full" style={{ backgroundColor: label.color }} />
         )}
         getItemCount={showCounts ? (label) => filterByLabel(label.id).length : undefined}
         showCounts={showCounts}
         searchable={searchable}
         searchPlaceholder="Search labels..."
         emptyMessage="No labels found."
         triggerVariant={triggerVariant}
         triggerSize={triggerSize}
         placeholder="Labels"
         renderTrigger={renderLabelTrigger}
         {...props}
      />
   );
}

export default LabelSelector;
