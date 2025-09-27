'use client';

import * as React from 'react';
import { Maximize2 } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

export function PanelControlBar() {
   // Fullscreen functionality removed - icon is now non-functional

   return (
      <div
         className="panel-control-bar w-full flex justify-between items-center border-b py-1.5 px-6 h-10 bg-muted relative z-20"
         role="toolbar"
         data-panel-control-bar
      >
         <div className="flex-1" />
         <div className="flex items-center gap-2">
            <Button
               size="xs"
               variant="ghost"
               className="ml-2 text-muted-foreground hover:!text-icon-hover opacity-50 cursor-not-allowed"
               disabled
               aria-label="Fullscreen (disabled)"
               title="Fullscreen functionality has been disabled"
            >
               <Maximize2 className="size-4" />
            </Button>
         </div>
      </div>
   );
}
