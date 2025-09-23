'use client';

import { PrioritySelector as StandardPrioritySelector } from '@/components/common/selectors';
import { useIssuesStore } from '@/store/issues-store';
import { Priority } from '@/mock-data/priorities';

interface PrioritySelectorProps {
   priority: Priority;
   issueId?: string;
}

export function PrioritySelector({ priority, issueId }: PrioritySelectorProps) {
   const { updateIssuePriority } = useIssuesStore();

   const handlePriorityChange = (newPriority: Priority) => {
      if (issueId) {
         updateIssuePriority(issueId, newPriority);
      }
   };

   return (
      <StandardPrioritySelector
         selectedItem={priority}
         onSelectionChange={handlePriorityChange}
         showCounts={true}
         searchable={true}
         triggerVariant="icon"
         triggerSize="icon"
         searchPlaceholder="Set priority..."
         placeholder="Priority"
      />
   );
}
