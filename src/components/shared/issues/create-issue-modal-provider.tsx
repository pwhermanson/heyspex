'use client';

import { CreateNewIssue } from '@/src/components/layout/workspace-zone-a-panels/create-new-issue';

export function CreateIssueModalProvider() {
   return (
      <div className="hidden">
         <CreateNewIssue />
      </div>
   );
}
