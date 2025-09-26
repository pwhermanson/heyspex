'use client';

import { PanelGroup, PanelMenu, PanelMenuButton, PanelMenuItem } from '@/src/components/ui/sidebar';
import Link from 'next/link';
import { inboxItems } from '@/src/tests/test-data/workspace-zone-a-panels-nav';

export function NavInbox() {
   return (
      <PanelGroup className="group-data-[collapsible=icon]:hidden">
         <PanelMenu>
            {inboxItems.map((item) => (
               <PanelMenuItem key={item.name}>
                  <PanelMenuButton asChild tooltip={item.name}>
                     <Link href={item.url}>
                        <item.icon />
                        <span>{item.name}</span>
                     </Link>
                  </PanelMenuButton>
               </PanelMenuItem>
            ))}
         </PanelMenu>
      </PanelGroup>
   );
}
