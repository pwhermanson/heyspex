'use client';

import { useCallback, useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

import {
   Command,
   CommandEmpty,
   CommandGroup,
   CommandInput,
   CommandItem,
   CommandList,
} from '@/components/ui/command';
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
} from '@/components/ui/dialog';
import { usePaletteStore } from '@/components/command-palette/palette-provider';

export function CommandPaletteModal() {
   const open = usePaletteStore((state) => state.isOpen);
   const setOpen = usePaletteStore((state) => state.setOpen);
   const setQuery = usePaletteStore((state) => state.setQuery);
   const executeQuery = usePaletteStore((state) => state.executeQuery);
   const results = usePaletteStore((state) => state.results);
   const isLoading = usePaletteStore((state) => state.isLoading);
   const context = usePaletteStore((state) => state.context);

   const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

   useEffect(() => {
      if (!open) {
         if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
         }
         return;
      }

      // Don't automatically execute query when modal opens
      // Only execute when user types
   }, [open]);

   // Don't load initial results automatically
   // Only search when user types

   useEffect(() => {
      return () => {
         if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
         }
      };
   }, []);

   const handleOpenChange = useCallback(
      (nextOpen: boolean) => {
         if (!nextOpen) {
            if (debounceTimerRef.current) {
               clearTimeout(debounceTimerRef.current);
            }
         }
         setOpen(nextOpen);
      },
      [setOpen]
   );

   const handleQueryChange = useCallback(
      (value: string) => {
         console.log('💬 Query changed to:', value);
         setQuery(value);

         if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
         }

         // Execute query immediately for live search (autocomplete behavior)
         // Use a very short debounce to prevent excessive API calls while typing
         if (value.trim().length > 0) {
            console.log('⚡ Executing query:', value);
            // Execute immediately for single characters, debounce for longer queries
            if (value.length === 1) {
               void executeQuery(value);
            } else {
               debounceTimerRef.current = setTimeout(() => {
                  void executeQuery(value);
               }, 100);
            }
         }
      },
      [executeQuery, setQuery]
   );

   const query = usePaletteStore((state) => state.query);

   // Only show results when user has typed something
   const hasQuery = query.trim().length > 0;
   const showLoadingSkeletons = open && hasQuery && isLoading;
   const showResults = open && hasQuery && !isLoading && results.length > 0;
   const showEmpty = open && hasQuery && !isLoading && results.length === 0;

   console.log('📊 Modal State:', {
      query,
      hasQuery,
      results: results.length,
      isLoading,
      showResults,
      showEmpty,
      showLoadingSkeletons,
   });

   return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
         <DialogHeader className="sr-only">
            <DialogTitle>Command Palette</DialogTitle>
            <DialogDescription>Search for a command to run...</DialogDescription>
         </DialogHeader>
         <DialogContent className="overflow-hidden p-0 max-h-[400px] min-h-[200px]">
            <Command
               shouldFilter={false}
               className="[&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
            >
               <CommandInput
                  placeholder="Search for commands or actions..."
                  onValueChange={(value) => {
                     console.log('🎯 CommandInput onValueChange triggered with:', value);
                     handleQueryChange(value);
                  }}
               />
               <CommandList>
                  {!hasQuery && (
                     <div className="py-6 text-center text-sm text-muted-foreground">
                        Type to search for commands or actions...
                     </div>
                  )}
                  {showLoadingSkeletons && (
                     <div className="p-2 space-y-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                           <div key={i} className="flex items-center space-x-2 px-2 py-1.5">
                              <Skeleton className="h-4 w-4 rounded" />
                              <Skeleton className="h-4 flex-1" />
                           </div>
                        ))}
                     </div>
                  )}
                  {showEmpty && <CommandEmpty>No matching results</CommandEmpty>}
                  {showResults && results.length > 0 && (
                     <CommandGroup heading="Results">
                        {results.map((result) => (
                           <CommandItem
                              key={result.id}
                              onSelect={() => {
                                 console.log(
                                    '🚀 Executing command:',
                                    result.title,
                                    'with context:',
                                    context
                                 );
                                 try {
                                    result.onSelect(context);
                                    setOpen(false);
                                 } catch (error) {
                                    console.error('❌ Command execution failed:', error);
                                 }
                              }}
                           >
                              {result.title}
                           </CommandItem>
                        ))}
                     </CommandGroup>
                  )}
               </CommandList>
            </Command>
         </DialogContent>
      </Dialog>
   );
}
