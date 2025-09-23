'use client';

import { useCallback, useEffect, useRef } from 'react';

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

   return (
      <CommandDialog open={open} onOpenChange={handleOpenChange}>
         <PaletteCommand onQueryChange={handleQueryChange}>
            <CommandInput placeholder="Search for commands or actions..." />
            <CommandList>
               <CommandEmpty>No matching results</CommandEmpty>
               {results.length > 0 && (
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
