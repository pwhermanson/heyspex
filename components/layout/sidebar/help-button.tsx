'use client';

import * as React from 'react';
import { ExternalLink, HelpCircle, Keyboard, Search } from 'lucide-react';

import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import Link from 'next/link';
import { RiBox3Fill, RiLinkedinFill } from '@remixicon/react';
import { useResizableSidebar } from './resizable-sidebar-provider';
import { useFeatureFlag } from '@/hooks/use-feature-flag';

export function HelpButton() {
   const { leftState } = useResizableSidebar();
   const enableLeftRail = useFeatureFlag('enableLeftRail');
   const isCollapsed = enableLeftRail && leftState === 'collapsed';

   const helpButton = (
      <Button size="icon" variant="outline">
         <HelpCircle className="size-4" />
         <span className="sr-only">Help and support</span>
      </Button>
   );

   return (
      <DropdownMenu>
         <DropdownMenuTrigger asChild>
            {isCollapsed ? (
               <Tooltip>
                  <TooltipTrigger asChild>{helpButton}</TooltipTrigger>
                  <TooltipContent side="right" align="center">
                     Help and support
                  </TooltipContent>
               </Tooltip>
            ) : (
               helpButton
            )}
         </DropdownMenuTrigger>
         <DropdownMenuContent align="end" className="w-60">
            <div className="p-2">
               <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="search" placeholder="Search for help..." className="pl-8" />
               </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Shortcuts</DropdownMenuLabel>
            <DropdownMenuItem>
               <Keyboard className="mr-2 h-4 w-4" />
               <span>Keyboard shortcuts</span>
               <span className="ml-auto text-xs text-muted-foreground">⌘/</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Follow me</DropdownMenuLabel>
            <DropdownMenuItem asChild>
               <Link href="http://linkedin.com/in/paulhermanson" target="_blank">
                  <RiLinkedinFill className="mr-2 h-4 w-4" />
                  <span>LinkedIn</span>
                  <ExternalLink className="ml-auto h-3 w-3 text-muted-foreground" />
               </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
               <Link href="https://heyspex.com/store" target="_blank">
                  <RiBox3Fill className="mr-2 h-4 w-4" />
                  <span>Support project</span>
               </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>What&apos;s new</DropdownMenuLabel>
            <DropdownMenuItem asChild>
               <Link href="https://heyspex.com/ui" target="_blank" className="flex items-center">
                  <div className="mr-2 flex h-4 w-4 items-center justify-center">
                     <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                  </div>
                  <span>Launch HeySpex UI</span>
               </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
               <Link href="https://heyspex.com" target="_blank" className="flex items-center">
                  <div className="mr-2 flex h-4 w-4 items-center justify-center">
                     <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                  </div>
                  <span>New portfolio</span>
               </Link>
            </DropdownMenuItem>
         </DropdownMenuContent>
      </DropdownMenu>
   );
}
