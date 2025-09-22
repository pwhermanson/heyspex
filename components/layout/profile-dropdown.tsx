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
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function ProfileDropdown() {
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
                  LN
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
               demo user
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
                     <DropdownMenuLabel>leonelngoya@gmail.com</DropdownMenuLabel>
                     <DropdownMenuSeparator />
                     <DropdownMenuItem>
                        <div className="flex aspect-square size-6 items-center justify-center rounded bg-orange-500 text-sidebar-primary-foreground">
                           LN
                        </div>
                        demo-user
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
