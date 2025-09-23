'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { LeftSidebarTrigger } from '@/components/layout/sidebar/left-sidebar-trigger';
import { RightSidebarTrigger } from '@/components/layout/sidebar/right-sidebar-trigger';
import Notifications from '@/components/layout/headers/issues/notifications';
import { OrgSwitcher } from '@/components/layout/sidebar/org-switcher';
import { BackToApp } from '@/components/layout/sidebar/back-to-app';
import { ProfileDropdown } from '@/components/layout/profile-dropdown';

export function TopBar() {
   const pathname = usePathname();
   const isSettings = pathname.includes('/settings');

   return (
      <div
         className="w-full h-14 border-b bg-background flex items-center justify-between px-4 gap-4"
         role="banner"
         data-top-bar
      >
         {/* Left Section - Sidebar Toggle + Org/Back */}
         <div className="flex items-center gap-2 sm:gap-3">
            <LeftSidebarTrigger className="" />

            {/* Org Switcher or Back to App */}
            <div className="flex items-center">{isSettings ? <BackToApp /> : <OrgSwitcher />}</div>
         </div>

         {/* Right Section - Notifications + Profile */}
         <div className="flex items-center gap-1 sm:gap-2">
            <Notifications />
            <RightSidebarTrigger />

            {/* Profile Dropdown */}
            <ProfileDropdown />
         </div>
      </div>
   );
}
