'use client';

import Link from 'next/link';

import {
   PanelGroup,
   PanelGroupLabel,
   PanelMenu,
   PanelMenuButton,
   PanelMenuItem,
} from '@/src/components/ui/sidebar';
import { featuresItems } from '@/src/tests/test-data/workspace-zone-a-panels-nav';

export function NavFeatures() {
   return (
      <PanelGroup className="group-data-[collapsible=icon]:hidden">
         <PanelGroupLabel>Features</PanelGroupLabel>
         <PanelMenu>
            {featuresItems.map((item) => (
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
