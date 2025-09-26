'use client';

import Link from 'next/link';

import {
   PanelGroup,
   PanelGroupLabel,
   PanelMenu,
   PanelMenuButton,
   PanelMenuItem,
} from '@/src/components/ui/sidebar';
import { accountItems } from '@/src/tests/test-data/workspace-zone-a-panels-nav';

export function NavAccount() {
   return (
      <PanelGroup className="group-data-[collapsible=icon]:hidden">
         <PanelGroupLabel>Account</PanelGroupLabel>
         <PanelMenu>
            {accountItems.map((item) => (
               <PanelMenuItem key={item.name}>
                  <PanelMenuButton asChild tooltip={item.name}>
                     <Link href={item.url}>
                        <item.icon className="size-4" />
                        <span>{item.name}</span>
                     </Link>
                  </PanelMenuButton>
               </PanelMenuItem>
            ))}
         </PanelMenu>
      </PanelGroup>
   );
}
