'use client';

import {
   Archive,
   Bell,
   Box,
   ChevronRight,
   CopyMinus,
   Layers,
   Link as LinkIcon,
   MoreHorizontal,
   Settings,
} from 'lucide-react';
import Link from 'next/link';

import {
   Collapsible,
   CollapsibleContent,
   CollapsibleTrigger,
} from '@/src/components/ui/collapsible';
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
   PanelMenuAction,
   PanelMenuButton,
   PanelMenuItem,
   PanelMenuSub,
   PanelMenuSubButton,
   PanelMenuSubItem,
} from '@/src/components/ui/sidebar';
import { teams } from '@/src/tests/test-data/teams';
import { RiDonutChartFill } from '@remixicon/react';

export function NavTeams() {
   const joinedTeams = teams.filter((t) => t.joined);
   return (
      <PanelGroup>
         <PanelGroupLabel>Your teams</PanelGroupLabel>
         <PanelMenu>
            {joinedTeams.map((item, index) => (
               <Collapsible
                  key={item.name}
                  asChild
                  defaultOpen={index === 0}
                  className="group/collapsible"
               >
                  <PanelMenuItem>
                     <CollapsibleTrigger asChild>
                        <PanelMenuButton tooltip={item.name}>
                           <div className="inline-flex size-6 bg-muted/50 items-center justify-center rounded shrink-0">
                              <div className="text-sm">{item.icon}</div>
                           </div>
                           <span className="text-sm">{item.name}</span>
                           <span className="w-3 shrink-0">
                              <ChevronRight className="w-full transition-transform layout-transition-short motion-reduce:transition-none group-data-[state=open]/collapsible:rotate-90" />
                           </span>
                           <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                 <PanelMenuAction asChild showOnHover>
                                    <div>
                                       <MoreHorizontal />
                                       <span className="sr-only">More</span>
                                    </div>
                                 </PanelMenuAction>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                 className="w-48 rounded-lg"
                                 side="right"
                                 align="start"
                              >
                                 <DropdownMenuItem>
                                    <Settings className="size-4" />
                                    <span>Team settings</span>
                                 </DropdownMenuItem>
                                 <DropdownMenuItem>
                                    <LinkIcon className="size-4" />
                                    <span>Copy link</span>
                                 </DropdownMenuItem>
                                 <DropdownMenuItem>
                                    <Archive className="size-4" />
                                    <span>Open archive</span>
                                 </DropdownMenuItem>
                                 <DropdownMenuSeparator />
                                 <DropdownMenuItem>
                                    <Bell className="size-4" />
                                    <span>Subscribe</span>
                                 </DropdownMenuItem>
                                 <DropdownMenuSeparator />
                                 <DropdownMenuItem>
                                    <span>Leave team...</span>
                                 </DropdownMenuItem>
                              </DropdownMenuContent>
                           </DropdownMenu>
                        </PanelMenuButton>
                     </CollapsibleTrigger>
                     <CollapsibleContent>
                        <PanelMenuSub>
                           <PanelMenuSubItem>
                              <PanelMenuSubButton asChild>
                                 <Link href="/demo-user/team/CORE/all">
                                    <CopyMinus size={14} />
                                    <span>Issues</span>
                                 </Link>
                              </PanelMenuSubButton>
                           </PanelMenuSubItem>
                           <PanelMenuSubItem>
                              <PanelMenuSubButton asChild>
                                 <Link href="/demo-user/team/CORE/all">
                                    <RiDonutChartFill size={14} />
                                    <span>Cycles</span>
                                 </Link>
                              </PanelMenuSubButton>
                           </PanelMenuSubItem>
                           <PanelMenuSubItem>
                              <PanelMenuSubButton asChild>
                                 <Link href="/demo-user/projects">
                                    <Box size={14} />
                                    <span>Projects</span>
                                 </Link>
                              </PanelMenuSubButton>
                           </PanelMenuSubItem>
                           <PanelMenuSubItem>
                              <PanelMenuSubButton asChild>
                                 <Link href="#">
                                    <Layers size={14} />
                                    <span>Views</span>
                                 </Link>
                              </PanelMenuSubButton>
                           </PanelMenuSubItem>
                        </PanelMenuSub>
                     </CollapsibleContent>
                  </PanelMenuItem>
               </Collapsible>
            ))}
         </PanelMenu>
      </PanelGroup>
   );
}
