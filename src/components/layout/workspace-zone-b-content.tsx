import React from 'react';
import {
   ResizablePanel,
   ResizablePanelGroup,
   ResizableHandle,
} from '@/src/components/ui/resizable';

export function WorkspaceZoneBContent() {
   return (
      <div className="h-full overflow-hidden">
         <div className="h-full overflow-y-auto">
            <div className="p-4 space-y-4 max-w-4xl mx-auto">
               <div className="text-sm text-muted-foreground">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                     HeySpex Development Console
                  </h3>
                  <p className="text-xs">Real-time development tools and debugging information.</p>
               </div>

               {/* Development Console Content */}
               <div className="space-y-2">
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                     <p className="text-sm font-medium text-green-400">
                        ✓ Workspace Zone B Overlay Fixed
                     </p>
                     <p className="text-xs text-green-300">
                        Background color now matches push mode using --card variable
                     </p>
                  </div>
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                     <p className="text-sm font-medium text-blue-400">
                        🔧 CSS Custom Properties Working
                     </p>
                     <p className="text-xs text-blue-300">
                        Inline styles now use var(--workspace-zone-b-bg) successfully
                     </p>
                  </div>
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                     <p className="text-sm font-medium text-yellow-400">
                        ⚠️ Toggle Button Styling Updated
                     </p>
                     <p className="text-xs text-yellow-300">
                        Changed from bg-muted to bg-muted/20 for better contrast
                     </p>
                  </div>
                  <div className="p-3 bg-muted/20 border rounded-lg">
                     <p className="text-sm font-medium">🎯 Next: Test Theme Switching</p>
                     <p className="text-xs text-muted-foreground">
                        Verify overlay mode works correctly in both light and dark themes
                     </p>
                  </div>
                  <div className="p-3 bg-muted/20 border rounded-lg">
                     <p className="text-sm font-medium">📝 Refactor Complete</p>
                     <p className="text-xs text-muted-foreground">
                        Workspace Zone B now uses robust CSS architecture with single source of
                        truth
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
