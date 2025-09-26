'use client';

import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Bot, Settings, HelpCircle, MessageCircle } from 'lucide-react';
import { ResizableSidebar } from './workspace-zone-a-panels-resizable';
import { WorkspaceZoneAPanelCTrigger } from './workspace-zone-a-panel-c-trigger';

export function WorkspaceZoneAPanelC() {
   return (
      <ResizableSidebar side="right">
         {/* Workspace Zone A Panel C Header with Toggle Icon */}
         <div className="panel-control-bar w-full flex justify-between items-center border-b py-1.5 px-6 h-10 bg-muted">
            <h2 className="text-lg font-semibold">Workspace Zone A Panel C</h2>
            <div className="flex items-center gap-2">
               <div className="w-px h-4 bg-border" />
               <WorkspaceZoneAPanelCTrigger />
            </div>
         </div>

         {/* Workspace Zone A Panel C Content */}
         <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Sidebar Controls */}
            <div className="space-y-3">
               <h3 className="text-sm font-medium text-muted-foreground">
                  Workspace Zone A Panel C Controls
               </h3>
               <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                     Use keyboard shortcuts:
                     <br />
                     <code>Ctrl/Cmd + B</code> - Toggle Workspace Zone A Panel A
                     <br />
                     <code>Ctrl/Cmd + Shift + B</code> - Toggle Workspace Zone A Panel C
                  </div>
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

         {/* Workspace Zone A Panel C Footer */}
         <div className="p-4 border-t">
            <div className="text-xs text-muted-foreground text-center">
               Workspace Zone A Panel C v1.0
            </div>
         </div>
      </ResizableSidebar>
   );
}
