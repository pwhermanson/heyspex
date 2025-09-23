'use client';

import { useCallback, useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

import {
   CommandDialog,
   CommandEmpty,
   CommandGroup,
   CommandInput,
   CommandItem,
   CommandList,
} from '@/components/ui/command';
import { PaletteCommand } from '@/components/command-palette/palette-command';
import { usePaletteStore } from '@/components/command-palette/palette-provider';

export function CommandPaletteModal() {
   const open = usePaletteStore((state) => state.isOpen);
   const setOpen = usePaletteStore((state) => state.setOpen);
   const setQuery = usePaletteStore((state) => state.setQuery);
   const executeQuery = usePaletteStore((state) => state.executeQuery);
   const loadInitialResults = usePaletteStore((state) => state.loadInitialResults);
   const initialResultsLoaded = usePaletteStore((state) => state.initialResultsLoaded);
   const results = usePaletteStore((state) => state.results);
   const isLoading = usePaletteStore((state) => state.isLoading);
   const context = usePaletteStore((state) => state.context);

   const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

   useEffect(() => {
      if (!open) {
         setQuery('');
         if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
         }
         return;
      }

      if (!initialResultsLoaded) {
         return;
      }

      void executeQuery();
   }, [open, initialResultsLoaded, executeQuery, setQuery]);

   useEffect(() => {
      if (!open || initialResultsLoaded) {
         return;
      }

      void loadInitialResults();
   }, [open, initialResultsLoaded, loadInitialResults]);

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
            setQuery('');
            if (debounceTimerRef.current) {
               clearTimeout(debounceTimerRef.current);
            }
         }
         setOpen(nextOpen);
      },
      [setOpen, setQuery]
   );

   const handleQueryChange = useCallback(
      (value: string) => {
         setQuery(value);

         if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
         }

         debounceTimerRef.current = setTimeout(() => {
            void executeQuery(value);
         }, 150);
      },
      [executeQuery, setQuery]
   );

   // Show loading skeletons while initial results are loading
   const showLoadingSkeletons = open && !initialResultsLoaded && isLoading;
   const showResults = open && initialResultsLoaded && !isLoading;
   const showEmpty = open && initialResultsLoaded && !isLoading && results.length === 0;

   return (
      <CommandDialog open={open} onOpenChange={handleOpenChange}>
         <PaletteCommand onQueryChange={handleQueryChange}>
            <CommandInput placeholder="Search for commands or actions..." />
            <CommandList>
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
                              result.onSelect(context);
                              setOpen(false);
                           }}
                        >
                           {result.title}
                        </CommandItem>
                     ))}
                  </CommandGroup>
               )}
            </CommandList>
         </PaletteCommand>
      </CommandDialog>
   );
}
