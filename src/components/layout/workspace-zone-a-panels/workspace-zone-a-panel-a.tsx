'use client';

import { RiGithubLine } from '@remixicon/react';
import * as React from 'react';

import { HelpButton } from '@/src/components/layout/workspace-zone-a-panels/help-button';
import { NavInbox } from '@/src/components/layout/workspace-zone-a-panels/nav-inbox';
import { NavTeams } from '@/src/components/layout/workspace-zone-a-panels/nav-teams';
import { NavWorkspace } from '@/src/components/layout/workspace-zone-a-panels/nav-workspace';
import { NavAccount } from '@/src/components/layout/workspace-zone-a-panels/nav-account';
import { NavFeatures } from '@/src/components/layout/workspace-zone-a-panels/nav-features';
import { NavTeamsSettings } from '@/src/components/layout/workspace-zone-a-panels/nav-teams-settings';
import { Button } from '@/src/components/ui/button';
import { ResizableSidebar } from '@/src/components/layout/workspace-zone-a-panels/workspace-zone-a-panels-resizable';
import { WorkspaceZoneAPanelATrigger } from '@/src/components/layout/workspace-zone-a-panels/workspace-zone-a-panel-a-trigger';
import Link from 'next/link';
import { X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useResizableSidebar } from './workspace-zone-a-panels-provider';
import { useFeatureFlag } from '@/src/lib/hooks/use-feature-flag';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/src/components/ui/tooltip';

export function WorkspaceZoneAPanelA() {
   const [open, setOpen] = React.useState(true);
   const pathname = usePathname();
   const isSettings = pathname.includes('/settings');
   const { leftState } = useResizableSidebar();
   const enableLeftRail = useFeatureFlag('enableLeftRail');

   // When left rail is enabled, show text only when state is 'open'
   const showText = !enableLeftRail || leftState === 'open';

   return (
      <ResizableSidebar side="left">
         {/* Workspace Zone A Panel A Header with Toggle Icon */}
         <div className="panel-control-bar w-full flex justify-between items-center border-b py-1.5 px-6 h-10 bg-muted">
            <div className="flex-1" />
            <div className="flex items-center gap-2">
               <div className="w-px h-4 bg-border" />
               <WorkspaceZoneAPanelATrigger className="h-6 w-6" />
            </div>
         </div>

         {/* Workspace Zone A Panel A Content */}
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

         {/* Workspace Zone A Panel A Footer */}
         <div className="p-4 border-t">
            <div className="w-full flex flex-col gap-2">
               {open && showText && (
                  <div
                     className={`group/workspace-zone-a-panel-a relative flex flex-col gap-2 rounded-lg border p-4 text-sm w-full workspace-zone-a-panel-a-content-text ${showText ? 'opacity-100' : 'opacity-0'}`}
                  >
                     <div
                        className="absolute top-2.5 right-2 z-10 cursor-pointer"
                        onClick={() => setOpen(!open)}
                        role="button"
                     >
                        <X className="size-4" />
                     </div>
                     <div className="text-balance text-lg font-semibold leading-tight group-hover/workspace-zone-a-panel-a:underline">
                        Welcome to HeySpex!
                     </div>
                     <div>
                        It&apos;s free forever! Or upgrade to Pro for unlimited projects, advanced
                        analytics, and priority support.
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
               <div
                  className={`w-full flex items-center workspace-zone-a-panel-a-content-text ${showText ? 'justify-between' : 'justify-center'} ${showText ? 'opacity-100' : 'opacity-0'}`}
               >
                  <HelpButton />
                  {showText ? (
                     <Button size="icon" variant="secondary" asChild>
                        <Link
                           href="https://github.com/pwhermanson/heyspex"
                           target="_blank"
                           rel="noopener noreferrer"
                        >
                           <RiGithubLine className="size-4" />
                           <span className="sr-only">GitHub repository</span>
                        </Link>
                     </Button>
                  ) : (
                     enableLeftRail &&
                     leftState === 'collapsed' && (
                        <Tooltip>
                           <TooltipTrigger asChild>
                              <Button size="icon" variant="secondary" asChild>
                                 <Link
                                    href="https://github.com/pwhermanson/heyspex"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                 >
                                    <RiGithubLine className="size-4" />
                                    <span className="sr-only">GitHub repository</span>
                                 </Link>
                              </Button>
                           </TooltipTrigger>
                           <TooltipContent side="right" align="center">
                              GitHub repository
                           </TooltipContent>
                        </Tooltip>
                     )
                  )}
               </div>
            </div>
         </div>
      </ResizableSidebar>
   );
}
