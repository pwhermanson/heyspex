'use client';

import { StatusSelector as StandardStatusSelector } from '@/components/common/selectors';
import { useIssuesStore } from '@/store/issues-store';
import { Status } from '@/mock-data/status';

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
