'use client';

import * as React from 'react';

import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuGroup,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuPortal,
   DropdownMenuSeparator,
   DropdownMenuShortcut,
   DropdownMenuSub,
   DropdownMenuSubContent,
   DropdownMenuSubTrigger,
   DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';
import { Button } from '@/src/components/ui/button';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useUserStore } from '@/src/state/store/user-store';
import { getUserInitials } from '@/src/lib/lib/user-utils';
import { users } from '@/src/tests/test-data/users';

export function ProfileDropdown() {
   const { theme, resolvedTheme, setTheme } = useTheme();
   const [mounted, setMounted] = React.useState(false);
   const { currentUser, setCurrentUser } = useUserStore();

   React.useEffect(() => {
      setMounted(true);
      // Initialize with demo user if no current user is set
      if (!currentUser) {
         const demoUser = users.find((user) => user.id === 'demo');
         if (demoUser) {
            setCurrentUser(demoUser);
         }
      }
   }, [currentUser, setCurrentUser]);

   const currentTheme = (resolvedTheme || theme) as 'light' | 'dark' | undefined;
   const toggleTheme = () => {
      const next = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(next);
   };

   const userInitials = currentUser ? getUserInitials(currentUser.name) : '?';
   const displayName = currentUser ? currentUser.name : 'Unknown User';

   return (
      <DropdownMenu>
         <DropdownMenuTrigger asChild>
            <Button
               variant="ghost"
               size="icon"
               className="h-8 w-8 rounded-full"
               aria-label="Profile menu"
            >
               <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-medium">
                  {userInitials}
               </div>
            </Button>
         </DropdownMenuTrigger>
         <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-60 rounded-lg"
            side="bottom"
            align="end"
            sideOffset={4}
         >
            <DropdownMenuLabel className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
               <div className="flex items-center justify-between gap-2">
                  <span>{displayName}</span>
                  <Button
                     variant="ghost"
                     size="icon"
                     className="h-6 w-6"
                     aria-label="Toggle theme"
                     onClick={toggleTheme}
                  >
                     {mounted && currentTheme === 'light' ? (
                        <Sun className="h-4 w-4" />
                     ) : (
                        <Moon className="h-4 w-4" />
                     )}
                     <span className="sr-only">Toggle theme</span>
                  </Button>
               </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
               <DropdownMenuItem asChild>
                  <Link href="/demo-user/settings">
                     Settings
                     <DropdownMenuShortcut>G then S</DropdownMenuShortcut>
                  </Link>
               </DropdownMenuItem>
               <DropdownMenuItem>Invite and manage members</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
               <DropdownMenuItem>Download desktop app</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
               <DropdownMenuSubTrigger>Switch Workspace</DropdownMenuSubTrigger>
               <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                     <DropdownMenuLabel>
                        {currentUser?.email || 'demo@example.com'}
                     </DropdownMenuLabel>
                     <DropdownMenuSeparator />
                     <DropdownMenuItem>
                        <div className="flex aspect-square size-6 items-center justify-center rounded bg-orange-500 text-sidebar-primary-foreground">
                           {userInitials}
                        </div>
                        {currentUser?.name.toLowerCase().replace(/\s+/g, '-') || 'demo-user'}
                     </DropdownMenuItem>
                     <DropdownMenuSeparator />
                     <DropdownMenuItem>Create or join workspace</DropdownMenuItem>
                     <DropdownMenuItem>Add an account</DropdownMenuItem>
                  </DropdownMenuSubContent>
               </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuItem>
               Log out
               <DropdownMenuShortcut>⌥⇧Q</DropdownMenuShortcut>
            </DropdownMenuItem>
         </DropdownMenuContent>
      </DropdownMenu>
   );
}
