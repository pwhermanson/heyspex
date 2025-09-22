'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LeftSidebarTrigger } from '@/components/layout/sidebar/left-sidebar-trigger';
import { RightSidebarTrigger } from '@/components/layout/sidebar/right-sidebar-trigger';
import { useSearchStore } from '@/store/search-store';
import { SearchIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';
import Notifications from '@/components/layout/headers/issues/notifications';
import { OrgSwitcher } from '@/components/layout/sidebar/org-switcher';
import { BackToApp } from '@/components/layout/sidebar/back-to-app';
import { ProfileDropdown } from '@/components/layout/profile-dropdown';

export function TopBar() {
   const pathname = usePathname();
   const isSettings = pathname.includes('/settings');

   const { isSearchOpen, toggleSearch, closeSearch, setSearchQuery, searchQuery } =
      useSearchStore();
   const searchInputRef = useRef<HTMLInputElement>(null);
   const searchContainerRef = useRef<HTMLDivElement>(null);
   const previousValueRef = useRef<string>('');

   useEffect(() => {
      if (isSearchOpen && searchInputRef.current) {
         searchInputRef.current.focus();
      }
   }, [isSearchOpen]);

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (
            searchContainerRef.current &&
            !searchContainerRef.current.contains(event.target as Node) &&
            isSearchOpen
         ) {
            if (searchQuery.trim() === '') {
               closeSearch();
            }
         }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
         document.removeEventListener('mousedown', handleClickOutside);
      };
   }, [isSearchOpen, closeSearch, searchQuery]);

   return (
      <div
         className="w-full h-14 border-b bg-background flex items-center justify-between px-4 gap-4"
         role="banner"
      >
         {/* Left Section - Sidebar Toggle + Org/Back */}
         <div className="flex items-center gap-3">
            <LeftSidebarTrigger className="" />

            {/* Org Switcher or Back to App */}
            <div className="flex items-center">
               {isSettings ? <BackToApp /> : <OrgSwitcher />}
            </div>
         </div>

         {/* Center Section - Search */}
         <div className="flex-1 flex justify-center max-w-2xl">
            <div className="flex items-center gap-2 w-full max-w-md">
               {isSearchOpen ? (
                  <div
                     ref={searchContainerRef}
                     className="relative flex items-center justify-center w-full transition-all duration-200 ease-in-out"
                  >
                     <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                     <Input
                        type="search"
                        ref={searchInputRef}
                        value={searchQuery}
                        onChange={(e) => {
                           previousValueRef.current = searchQuery;
                           const newValue = e.target.value;
                           setSearchQuery(newValue);

                           if (previousValueRef.current && newValue === '') {
                              const inputEvent = e.nativeEvent as InputEvent;
                              if (
                                 inputEvent.inputType !== 'deleteContentBackward' &&
                                 inputEvent.inputType !== 'deleteByCut'
                              ) {
                                 closeSearch();
                              }
                           }
                        }}
                        placeholder="Search issues..."
                        className="pl-10 h-9 text-sm w-full"
                        onKeyDown={(e) => {
                           if (e.key === 'Escape') {
                              if (searchQuery.trim() === '') {
                                 closeSearch();
                              } else {
                                 setSearchQuery('');
                              }
                           }
                        }}
                     />
                  </div>
               ) : (
                  <Button
                     variant="ghost"
                     size="sm"
                     onClick={toggleSearch}
                     className="h-9 px-3 text-muted-foreground hover:text-foreground"
                     aria-label="Search"
                  >
                     <SearchIcon className="h-4 w-4 mr-2" />
                     <span className="text-sm">Search...</span>
                  </Button>
               )}
            </div>
         </div>

         {/* Right Section - Notifications + Profile */}
         <div className="flex items-center gap-2">
            {!isSearchOpen && (
               <>
                  <Notifications />
                  <RightSidebarTrigger />

                  {/* Profile Dropdown */}
                  <ProfileDropdown />
               </>
            )}
         </div>
      </div>
   );
}