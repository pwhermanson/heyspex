'use client';

import { CreateNewIssue } from '@/src/components/layout/sidebar/create-new-issue';

export function CreateIssueModalProvider() {
   return (
      <div className="hidden">
         <CreateNewIssue />
      </div>
   );
}
