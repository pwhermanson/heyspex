'use client';

import { RiGithubLine } from '@remixicon/react';
import * as React from 'react';
import Image from 'next/image';

import { HelpButton } from '@/components/layout/sidebar/help-button';
import { NavInbox } from '@/components/layout/sidebar/nav-inbox';
import { NavTeams } from '@/components/layout/sidebar/nav-teams';
import { NavWorkspace } from '@/components/layout/sidebar/nav-workspace';
import { NavAccount } from '@/components/layout/sidebar/nav-account';
import { NavFeatures } from '@/components/layout/sidebar/nav-features';
import { NavTeamsSettings } from '@/components/layout/sidebar/nav-teams-settings';
import { Button } from '@/components/ui/button';
import { ResizableSidebar } from '@/components/layout/sidebar/resizable-sidebar';
import Link from 'next/link';
import { X } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function AppSidebar() {
   const [open, setOpen] = React.useState(true);
   const pathname = usePathname();
   const isSettings = pathname.includes('/settings');

   return (
      <ResizableSidebar side="left">
         {/* Sidebar Content */}
         <div className="flex-1 overflow-y-auto pt-4">
            {isSettings ? (
               <>
                  <NavAccount />
                  <NavFeatures />
                  <NavTeamsSettings />
               </>
            ) : (
               <>
                  <NavInbox />
                  <NavWorkspace />
                  <NavTeams />
               </>
            )}
         </div>

         {/* Sidebar Footer */}
         <div className="p-4 border-t">
            <div className="w-full flex flex-col gap-2">
               {open && (
                  <div className="group/sidebar relative flex flex-col gap-2 rounded-lg border p-4 text-sm w-full">
                     <div
                        className="absolute top-2.5 right-2 z-10 cursor-pointer"
                        onClick={() => setOpen(!open)}
                        role="button"
                     >
                        <X className="size-4" />
                     </div>
                     <div className="text-balance text-lg font-semibold leading-tight group-hover/sidebar:underline">
                        Welcome to HeySpex!
                     </div>
                     <div>
                        It&apos;s free forever! Or upgrade to Pro for unlimited projects, advanced analytics, and priority support.
                     </div>
                     <Link
                        target="_blank"
                        rel="noreferrer"
                        className="absolute inset-0"
                        href="https://heyspex.com/upgrade"
                     >
                        <span className="sr-only">Upgrade to Pro</span>
                     </Link>
                     <Button size="sm" className="w-full">
                        <Link
                           href="https://heyspex.com/upgrade"
                           target="_blank"
                           rel="noopener noreferrer"
                        >
                           Upgrade to Pro
                        </Link>
                     </Button>
                  </div>
               )}
               <a className="my-1.5" href="https://vercel.com/oss">
                  <Image
                    alt="Vercel OSS Program"
                    src="https://vercel.com/oss/program-badge.svg"
                    width={100}
                    height={20}
                    priority={false}
                  />
               </a>
               <div className="w-full flex items-center justify-between">
                  <HelpButton />
                  <Button size="icon" variant="secondary" asChild>
                     <Link
                        href="https://github.com/pwhermanson/heyspex"
                        target="_blank"
                        rel="noopener noreferrer"
                     >
                        <RiGithubLine className="size-4" />
                     </Link>
                  </Button>
               </div>
            </div>
         </div>
      </ResizableSidebar>
   );
}
