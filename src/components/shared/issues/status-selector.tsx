'use client';

import { StatusSelector as StandardStatusSelector } from '@/src/components/shared/selectors';
import { useIssuesStore } from '@/src/state/store/issues-store';
import { Status } from '@/src/tests/test-data/status';

interface StatusSelectorProps {
   status: Status;
   issueId: string;
}

export function StatusSelector({ status, issueId }: StatusSelectorProps) {
   const { updateIssueStatus } = useIssuesStore();

   const handleStatusChange = (newStatus: Status) => {
      if (issueId) {
         updateIssueStatus(issueId, newStatus);
      }
   };

   return (
      <StandardStatusSelector
         selectedItem={status}
         onSelectionChange={handleStatusChange}
         showCounts={true}
         searchable={true}
         triggerVariant="icon"
         triggerSize="icon"
         searchPlaceholder="Set status..."
         placeholder="Status"
      />
   );
}
