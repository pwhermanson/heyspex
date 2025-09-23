'use client';

import { PrioritySelector as StandardPrioritySelector } from '@/components/common/selectors';
import { Priority } from '@/mock-data/priorities';

interface PrioritySelectorProps {
   priority: Priority;
   onChange: (priority: Priority) => void;
}

export function PrioritySelector({ priority, onChange }: PrioritySelectorProps) {
   return (
      <StandardPrioritySelector
         selectedItem={priority}
         onSelectionChange={onChange}
         showCounts={true}
         searchable={true}
         triggerVariant="button"
         triggerSize="sm"
         searchPlaceholder="Set priority..."
         placeholder="No priority"
      />
   );
}
