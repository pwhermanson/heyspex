'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { WorkspaceZoneAPanelATrigger } from '@/src/components/layout/workspace-zone-a-panels/workspace-zone-a-panel-a-trigger';
import { WorkspaceZoneAPanelCTrigger } from '@/src/components/layout/workspace-zone-a-panels/workspace-zone-a-panel-c-trigger';
import Notifications from '@/src/components/layout/headers/issues/notifications';
import { OrgSwitcher } from '@/src/components/layout/workspace-zone-a-panels/org-switcher';
import { BackToApp } from '@/src/components/layout/workspace-zone-a-panels/back-to-app';
import { ProfileDropdown } from '@/src/components/layout/profile-dropdown';
import { cn } from '@/src/lib/lib/utils';

export function TopBar() {
   const pathname = usePathname();
   const isSettings = pathname.includes('/settings');

   return (
      <div
         className="w-full h-14 border-b bg-background flex items-center justify-between px-4 gap-4 relative z-20"
         role="banner"
         data-top-bar
      >
         {/* Left Section - Sidebar Toggle + Org/Back */}
         <div className="flex items-center gap-2 sm:gap-3">
            <WorkspaceZoneAPanelATrigger className="" />

            {/* Org Switcher or Back to App */}
            <div className="flex items-center">{isSettings ? <BackToApp /> : <OrgSwitcher />}</div>
         </div>

         {/* Right Section - Notifications + Profile */}
         <div className="flex items-center gap-1 sm:gap-2">
            <Notifications />
            <WorkspaceZoneAPanelCTrigger />

            {/* Profile Dropdown */}
            <ProfileDropdown />
         </div>
      </div>
   );
}
