'use client';

import * as React from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { useResizableSidebar } from '@/src/components/layout/sidebar/resizable-sidebar-provider';

export function PanelControlBar() {
   const { isMainFullscreen, setMainFullscreen } = useResizableSidebar();

   return (
      <div
         className="panel-control-bar w-full flex justify-between items-center border-b py-1.5 px-6 h-10 bg-muted"
         role="toolbar"
         data-panel-control-bar
      >
         <div className="flex-1" />
         <div className="flex items-center gap-2">
            <Button
               size="xs"
               variant="ghost"
               className="ml-2 text-muted-foreground hover:!text-icon-hover"
               onClick={() => setMainFullscreen(!isMainFullscreen)}
               aria-label={isMainFullscreen ? 'Exit full screen' : 'Enter full screen'}
            >
               {isMainFullscreen ? (
                  <Minimize2 className="size-4" />
               ) : (
                  <Maximize2 className="size-4" />
               )}
            </Button>
         </div>
      </div>
   );
}
