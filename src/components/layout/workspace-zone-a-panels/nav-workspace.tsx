'use client';

import { Layers, LayoutList, MoreHorizontal } from 'lucide-react';

import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';
import {
   PanelGroup,
   PanelGroupLabel,
   PanelMenu,
   PanelMenuButton,
   PanelMenuItem,
} from '@/src/components/ui/sidebar';
import Link from 'next/link';
import { workspaceItems } from '@/src/tests/test-data/workspace-zone-a-panels-nav';
import { RiPresentationLine } from '@remixicon/react';

export function NavWorkspace() {
   return (
      <PanelGroup className="group-data-[collapsible=icon]:hidden">
         <PanelGroupLabel>Workspace</PanelGroupLabel>
         <PanelMenu>
            {workspaceItems.map((item) => (
               <PanelMenuItem key={item.name}>
                  <PanelMenuButton asChild tooltip={item.name}>
                     <Link href={item.url}>
                        <item.icon />
                        <span>{item.name}</span>
                     </Link>
                  </PanelMenuButton>
               </PanelMenuItem>
            ))}
            <PanelMenuItem>
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <PanelMenuButton asChild tooltip="More options">
                        <span>
                           <MoreHorizontal />
                           <span>More</span>
                        </span>
                     </PanelMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48 rounded-lg" side="bottom" align="start">
                     <DropdownMenuItem>
                        <RiPresentationLine className="text-muted-foreground" />
                        <span>Initiatives</span>
                     </DropdownMenuItem>
                     <DropdownMenuItem>
                        <Layers className="text-muted-foreground" />
                        <span>Views</span>
                     </DropdownMenuItem>
                     <DropdownMenuSeparator />
                     <DropdownMenuItem>
                        <LayoutList className="text-muted-foreground" />
                        <span>Customize panel</span>
                     </DropdownMenuItem>
                  </DropdownMenuContent>
               </DropdownMenu>
            </PanelMenuItem>
         </PanelMenu>
      </PanelGroup>
   );
}
