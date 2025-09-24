'use client';

import Link from 'next/link';

import {
   SidebarGroup,
   SidebarGroupLabel,
   SidebarMenu,
   SidebarMenuButton,
   SidebarMenuItem,
} from '@/src/components/ui/sidebar';
import { accountItems } from '@/src/tests/test-data/side-bar-nav';

export function NavAccount() {
   return (
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
         <SidebarGroupLabel>Account</SidebarGroupLabel>
         <SidebarMenu>
            {accountItems.map((item) => (
               <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild tooltip={item.name}>
                     <Link href={item.url}>
                        <item.icon className="size-4" />
                        <span>{item.name}</span>
                     </Link>
                  </SidebarMenuButton>
               </SidebarMenuItem>
            ))}
         </SidebarMenu>
      </SidebarGroup>
   );
}
