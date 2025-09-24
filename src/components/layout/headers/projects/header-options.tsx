'use client';

import { Button } from '@/src/components/ui/button';
import { ListFilter, SlidersHorizontal } from 'lucide-react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { useResizableSidebar } from '@/src/components/layout/sidebar/resizable-sidebar-provider';

export default function HeaderOptions() {
   const { isMainFullscreen, setMainFullscreen } = useResizableSidebar();
   return (
      <div className="w-full flex justify-between items-center border-b py-1.5 px-6 h-10">
         <Button size="xs" variant="ghost">
            <ListFilter className="size-4" />
            <span className="hidden sm:inline ml-1">Filter</span>
         </Button>
         <div className="flex items-center gap-2">
            <Button className="relative" size="xs" variant="secondary">
               <SlidersHorizontal className="size-4" />
               <span className="hidden sm:inline ml-1">Display</span>
            </Button>
            <Button
               size="xs"
               variant="ghost"
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
