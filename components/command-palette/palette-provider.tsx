'use client';

import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import { useStore } from 'zustand';

import type { CommandContext } from '@/lib/command-palette/registry';
import { createPaletteStore, type PaletteStoreState } from '@/lib/command-palette/store';

type PaletteStore = ReturnType<typeof createPaletteStore>;

type PaletteProviderProps = {
   children: ReactNode;
   context: CommandContext;
   limit?: number;
};

const PaletteStoreContext = createContext<PaletteStore | null>(null);

function areSelectionsEqual(
   first: CommandContext['selection'],
   second: CommandContext['selection']
): boolean {
   if (!first && !second) {
      return true;
   }
   if (!first || !second) {
      return false;
   }
   return first.type === second.type && first.id === second.id;
}

function areContextsEqual(first: CommandContext, second: CommandContext): boolean {
   return (
      first.route === second.route &&
      first.user.id === second.user.id &&
      first.user.role === second.user.role &&
      areSelectionsEqual(first.selection, second.selection)
   );
}

export function PaletteProvider({ children, context, limit }: PaletteProviderProps) {
   const storeRef = useRef<PaletteStore | undefined>(undefined);

   if (!storeRef.current) {
      storeRef.current = createPaletteStore(context, { limit });
   }

   useEffect(() => {
      const store = storeRef.current;
      if (!store) {
         return;
      }
      const currentContext = store.getState().context;
      if (!areContextsEqual(currentContext, context)) {
         store.getState().setContext(context);
      }
   }, [context]);

   useEffect(() => {
      const store = storeRef.current;
      if (!store) {
         return;
      }

      const state = store.getState();
      if (!state.initialResultsLoaded) {
         void state.loadInitialResults();
      }
   }, []);

   return (
      <PaletteStoreContext.Provider value={storeRef.current}>
         {children}
      </PaletteStoreContext.Provider>
   );
}

function usePaletteStoreContext(): PaletteStore {
   const store = useContext(PaletteStoreContext);
   if (!store) {
      throw new Error('usePaletteStore must be used within a PaletteProvider');
   }
   return store;
}

export function usePaletteStore<T>(selector: (state: PaletteStoreState) => T): T {
   const store = usePaletteStoreContext();
   return useStore(store, selector);
}

export function usePaletteState(): PaletteStoreState {
   return usePaletteStore((state) => state);
}

export function usePaletteStoreApi(): PaletteStore {
   return usePaletteStoreContext();
}
