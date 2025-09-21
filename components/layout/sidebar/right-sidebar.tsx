'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarClosedIcon, SidebarOpenIcon } from '@/components/ui/sidebar-icons';
import {
   Bot,
   X,
   Settings,
   HelpCircle,
   MessageCircle,
   PanelRightClose,
   PanelRightOpen,
} from 'lucide-react';
import { useRightSidebar } from './right-sidebar-provider';
import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

export function RightSidebar() {
   const { isOpen, toggleSidebar } = useRightSidebar();
   const { toggleSidebar: toggleLeftSidebar, state: leftSidebarState } = useSidebar();

   return (
      <>
         {/* Right Sidebar */}
         <div
            className={cn(
               'fixed top-0 right-0 h-full w-80 bg-background border-l shadow-xl z-[50] flex flex-col transition-transform duration-300 ease-in-out',
               isOpen ? 'translate-x-0' : 'translate-x-full'
            )}
         >
            {/* Sidebar Header */}
            <div className="flex items-center p-4 border-b">
               <h2 className="text-lg font-semibold">Right Sidebar</h2>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
               {/* Sidebar Controls */}
               <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">Sidebar Controls</h3>
                  <div className="space-y-2">
                     <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleLeftSidebar}
                        className="w-full justify-start"
                     >
                        {leftSidebarState === 'collapsed' ? (
                           <SidebarOpenIcon size={16} color="currentColor" />
                        ) : (
                           <SidebarClosedIcon size={16} color="currentColor" />
                        )}
                        <span className="ml-2">
                           {leftSidebarState === 'collapsed' ? 'Expand' : 'Collapse'} Left Sidebar
                        </span>
                     </Button>
                  </div>
               </div>

               {/* Quick Actions */}
               <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">Quick Actions</h3>
                  <div className="grid grid-cols-1 gap-2">
                     <Button variant="outline" size="sm" className="justify-start">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        New Issue
                     </Button>
                     <Button variant="outline" size="sm" className="justify-start">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                     </Button>
                     <Button variant="outline" size="sm" className="justify-start">
                        <HelpCircle className="w-4 h-4 mr-2" />
                        Help & Support
                     </Button>
                  </div>
               </div>

               {/* Chatbot Section */}
               <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">Assistant</h3>
                  <div className="space-y-3">
                     <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        <Bot className="w-5 h-5 text-primary" />
                        <div>
                           <p className="text-sm font-medium">HeySpex Assistant</p>
                           <p className="text-xs text-muted-foreground">
                              Ask me anything about your projects
                           </p>
                        </div>
                     </div>
                     <div className="flex gap-2">
                        <Input placeholder="Ask me anything..." className="flex-1" />
                        <Button size="sm">
                           <MessageCircle className="w-4 h-4" />
                        </Button>
                     </div>
                  </div>
               </div>
            </div>

            {/* Sidebar Footer */}
            <div className="p-4 border-t">
               <div className="text-xs text-muted-foreground text-center">Right Sidebar v1.0</div>
            </div>
         </div>
      </>
   );
}
