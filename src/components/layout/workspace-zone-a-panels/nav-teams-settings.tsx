'use client';

import Link from 'next/link';
import { PlusIcon } from 'lucide-react';

import {
   SidebarGroup,
   SidebarGroupLabel,
   SidebarMenu,
   SidebarMenuButton,
   SidebarMenuItem,
} from '@/src/components/ui/sidebar';
import { teams } from '@/src/tests/test-data/teams';
import { Button } from '@/src/components/ui/button';

export function NavTeamsSettings() {
   const joinedTeams = teams.filter((t) => t.joined);
   return (
      <SidebarGroup>
         <SidebarGroupLabel>Your teams</SidebarGroupLabel>
         <SidebarMenu>
            {joinedTeams.map((team) => (
               <SidebarMenuItem key={team.id}>
                  <SidebarMenuButton asChild tooltip={team.name}>
                     <Link href={`/settings/teams/${team.id}`}>
                        <div className="inline-flex size-6 bg-muted/50 items-center justify-center rounded shrink-0">
                           <div className="text-sm">{team.icon}</div>
                        </div>
                        <span>{team.name}</span>
                     </Link>
                  </SidebarMenuButton>
               </SidebarMenuItem>
            ))}
            <SidebarMenuItem>
               <SidebarMenuButton asChild tooltip="Join or create a team">
                  <Button variant="ghost" className="w-full justify-start gap-2 px-2" asChild>
                     <Link href="/settings/teams/new">
                        <PlusIcon className="size-4" />
                        <span>Join or create a team</span>
                     </Link>
                  </Button>
               </SidebarMenuButton>
            </SidebarMenuItem>
         </SidebarMenu>
      </SidebarGroup>
   );
}
