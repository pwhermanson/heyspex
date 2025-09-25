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
// Panel expand/collapse moved to PanelControlBar

export default function HeaderOptions() {
   const { viewType, setViewType } = useViewStore();
   // No panel fullscreen control here

   const handleViewChange = (type: ViewType) => {
      setViewType(type);
   };

   return (
      <div className="screen-control-bar h-10 py-1.5 px-6" role="toolbar" data-screen-control-bar>
         <div className="flex items-center gap-2">
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
         </div>
         <div className="flex-1" />
         {/* Panel fullscreen control moved to PanelControlBar */}
      </div>
   );
}
