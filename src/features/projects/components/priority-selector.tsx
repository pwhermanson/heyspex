'use client';

import { PrioritySelector as StandardPrioritySelector } from '@/src/components/shared/selectors';
import { Priority } from '@/src/tests/test-data/priorities';

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
