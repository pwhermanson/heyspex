'use client';

import { Button } from '@/src/components/ui/button';
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';
import { cn } from '@/src/lib/lib/utils';
import { useViewStore, ViewType } from '@/src/state/store/view-store';
import { LayoutGrid, LayoutList, SlidersHorizontal } from 'lucide-react';
import { Filter } from './filter';
import { Maximize2, Minimize2 } from 'lucide-react';
import { useResizableSidebar } from '@/src/components/layout/sidebar/resizable-sidebar-provider';

export default function HeaderOptions() {
   const { viewType, setViewType } = useViewStore();
   const { isMainFullscreen, setMainFullscreen } = useResizableSidebar();

   const handleViewChange = (type: ViewType) => {
      setViewType(type);
   };

   return (
      <div className="w-full flex justify-between items-center border-b py-1.5 px-6 h-10">
         <Filter />
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <Button className="relative" size="xs" variant="secondary">
                  <SlidersHorizontal className="size-4 mr-1" />
                  Display
                  {viewType === 'grid' && (
                     <span className="absolute right-0 top-0 w-2 h-2 bg-orange-500 rounded-full" />
                  )}
               </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72 flex p-3 gap-2" align="end">
               <DropdownMenuItem
                  onClick={() => handleViewChange('list')}
                  className={cn(
                     'w-full text-xs border border-accent flex flex-col gap-1',
                     viewType === 'list' ? 'bg-accent' : ''
                  )}
               >
                  <LayoutList className="size-4" />
                  List
               </DropdownMenuItem>
               <DropdownMenuItem
                  onClick={() => handleViewChange('grid')}
                  className={cn(
                     'w-full text-xs border border-accent flex flex-col gap-1',
                     viewType === 'grid' ? 'bg-accent' : ''
                  )}
               >
                  <LayoutGrid className="size-4" />
                  Board
               </DropdownMenuItem>
            </DropdownMenuContent>
         </DropdownMenu>
         <Button
            size="xs"
            variant="ghost"
            className="ml-2"
            onClick={() => setMainFullscreen(!isMainFullscreen)}
            aria-label={isMainFullscreen ? 'Exit full screen' : 'Enter full screen'}
         >
            {isMainFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
         </Button>
      </div>
   );
}
