'use client';

import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Bot, Settings, HelpCircle, MessageCircle } from 'lucide-react';
import { WorkspaceZoneAResizablePanel } from './workspace-zone-a-panels-resizable';
import { WorkspaceZoneAPanelCTrigger } from './workspace-zone-a-panel-c-trigger';
import { useResizablePanel } from './workspace-zone-a-panels-provider';

export function WorkspaceZoneAPanelC() {
   const { rightPanel } = useResizablePanel();

   // Responsive behavior like Panel B - adapt content based on available width
   // Show text when panel is wide enough, hide when narrow
   const showText = rightPanel.width > 200;

   return (
      <WorkspaceZoneAResizablePanel side="right">
         {/* Workspace Zone A Panel C Header with Toggle Icon */}
         <div className="panel-control-bar w-full flex justify-between items-center border-b py-1.5 px-6 h-10 bg-muted">
            {showText && <h2 className="text-lg font-semibold">Workspace Zone A Panel C</h2>}
            <div className="flex items-center gap-2">
               <div className="w-px h-4 bg-border" />
               <WorkspaceZoneAPanelCTrigger />
            </div>
         </div>

         {/* Workspace Zone A Panel C Content */}
         <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Sidebar Controls */}
            {showText && (
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
            )}

            {/* Quick Actions */}
            <div className="space-y-3">
               {showText && (
                  <h3 className="text-sm font-medium text-muted-foreground">Quick Actions</h3>
               )}
               <div className="grid grid-cols-1 gap-2">
                  <Button
                     variant="outline"
                     size={showText ? 'sm' : 'icon'}
                     className={showText ? 'justify-start' : 'w-full'}
                  >
                     <MessageCircle className="w-4 h-4" />
                     {showText && <span className="ml-2">New Issue</span>}
                  </Button>
                  <Button
                     variant="outline"
                     size={showText ? 'sm' : 'icon'}
                     className={showText ? 'justify-start' : 'w-full'}
                  >
                     <Settings className="w-4 h-4" />
                     {showText && <span className="ml-2">Settings</span>}
                  </Button>
                  <Button
                     variant="outline"
                     size={showText ? 'sm' : 'icon'}
                     className={showText ? 'justify-start' : 'w-full'}
                  >
                     <HelpCircle className="w-4 h-4" />
                     {showText && <span className="ml-2">Help & Support</span>}
                  </Button>
               </div>
            </div>

            {/* Chatbot Section */}
            {showText && (
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
            )}
         </div>

         {/* Workspace Zone A Panel C Footer */}
         <div className="p-4 border-t">
            {showText ? (
               <div className="text-xs text-muted-foreground text-center">
                  Workspace Zone A Panel C v1.0
               </div>
            ) : (
               <div className="flex justify-center">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
               </div>
            )}
         </div>
      </WorkspaceZoneAResizablePanel>
   );
}
