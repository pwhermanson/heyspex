'use client';

import * as React from 'react';
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuGroup,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuPortal,
   DropdownMenuSeparator,
   DropdownMenuSub,
   DropdownMenuSubContent,
   DropdownMenuSubTrigger,
   DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { ChevronDown, Plus, Settings, Users, Building2, Check, MoreHorizontal } from 'lucide-react';
import { useWorkspaceStore } from '@/src/state/store/workspace-store';
import { useUserStore } from '@/src/state/store/user-store';
import { Workspace } from '@/src/types/workspace';
import { cn } from '@/src/lib/lib/utils';

interface WorkspaceSwitcherProps {
   className?: string;
}

export function WorkspaceSwitcher({ className }: WorkspaceSwitcherProps) {
   const { currentWorkspace, workspaces, switchWorkspace, isLoading } = useWorkspaceStore();

   const { availableWorkspaces } = useUserStore();

   // Filter workspaces based on user access
   const accessibleWorkspaces = workspaces.filter((workspace) =>
      availableWorkspaces.includes(workspace.id)
   );

   const handleWorkspaceSwitch = async (workspaceId: string) => {
      try {
         await switchWorkspace(workspaceId);
      } catch (error) {
         console.error('Failed to switch workspace:', error);
      }
   };

   const getWorkspaceIcon = (workspace: Workspace) => {
      // You can customize this based on workspace type or settings
      if (workspace.name.toLowerCase().includes('team')) {
         return <Users className="h-4 w-4" />;
      } else if (workspace.name.toLowerCase().includes('client')) {
         return <Building2 className="h-4 w-4" />;
      }
      return <Building2 className="h-4 w-4" />;
   };

   const getWorkspaceBadge = (workspace: Workspace) => {
      if (workspace.settings.privacy.isPublic) {
         return (
            <Badge variant="secondary" className="text-xs">
               Public
            </Badge>
         );
      }
      return null;
   };

   return (
      <DropdownMenu>
         <DropdownMenuTrigger asChild>
            <Button
               variant="ghost"
               className={cn('w-full justify-between px-2 py-1.5 h-auto', className)}
               disabled={isLoading}
            >
               <div className="flex items-center gap-2 min-w-0 flex-1">
                  {currentWorkspace ? (
                     <>
                        {getWorkspaceIcon(currentWorkspace)}
                        <span className="truncate text-sm font-medium">
                           {currentWorkspace.name}
                        </span>
                        {getWorkspaceBadge(currentWorkspace)}
                     </>
                  ) : (
                     <span className="text-sm text-muted-foreground">No workspace selected</span>
                  )}
               </div>
               <ChevronDown className="h-4 w-4 flex-shrink-0" />
            </Button>
         </DropdownMenuTrigger>

         <DropdownMenuContent className="w-64" align="start">
            <DropdownMenuLabel className="text-xs text-muted-foreground">
               Workspaces
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuGroup>
               {accessibleWorkspaces.map((workspace) => (
                  <DropdownMenuItem
                     key={workspace.id}
                     onClick={() => handleWorkspaceSwitch(workspace.id)}
                     className="flex items-center justify-between px-2 py-2"
                  >
                     <div className="flex items-center gap-2 min-w-0 flex-1">
                        {getWorkspaceIcon(workspace)}
                        <div className="min-w-0 flex-1">
                           <div className="flex items-center gap-2">
                              <span className="text-sm font-medium truncate">{workspace.name}</span>
                              {getWorkspaceBadge(workspace)}
                           </div>
                           {workspace.description && (
                              <p className="text-xs text-muted-foreground truncate">
                                 {workspace.description}
                              </p>
                           )}
                        </div>
                     </div>
                     {workspace.isActive && (
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                     )}
                  </DropdownMenuItem>
               ))}
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
               <DropdownMenuItem className="px-2 py-2">
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="text-sm">Create workspace</span>
               </DropdownMenuItem>

               <DropdownMenuItem className="px-2 py-2">
                  <Users className="h-4 w-4 mr-2" />
                  <span className="text-sm">Join workspace</span>
               </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuSub>
               <DropdownMenuSubTrigger className="px-2 py-2">
                  <Settings className="h-4 w-4 mr-2" />
                  <span className="text-sm">Workspace settings</span>
               </DropdownMenuSubTrigger>
               <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                     <DropdownMenuItem>
                        <span className="text-sm">General settings</span>
                     </DropdownMenuItem>
                     <DropdownMenuItem>
                        <span className="text-sm">Members & permissions</span>
                     </DropdownMenuItem>
                     <DropdownMenuItem>
                        <span className="text-sm">Billing & usage</span>
                     </DropdownMenuItem>
                     <DropdownMenuSeparator />
                     <DropdownMenuItem className="text-destructive">
                        <span className="text-sm">Delete workspace</span>
                     </DropdownMenuItem>
                  </DropdownMenuSubContent>
               </DropdownMenuPortal>
            </DropdownMenuSub>
         </DropdownMenuContent>
      </DropdownMenu>
   );
}
