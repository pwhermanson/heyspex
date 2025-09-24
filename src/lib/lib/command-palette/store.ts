import { create } from 'zustand';

import type { CommandContext } from './registry';
import type { PaletteResult } from './provider-registry';
import { initializePaletteProviders } from './providers-bootstrap';
import { getInitialPaletteResults, runPaletteQuery } from './search-engine';

export type PaletteStoreState = {
   context: CommandContext;
   query: string;
   results: PaletteResult[];
   isLoading: boolean;
   error?: string;
   initialResultsLoaded: boolean;
   isOpen: boolean;
   setContext: (context: CommandContext) => void;
   setQuery: (query: string) => void;
   setOpen: (open: boolean) => void;
   toggleOpen: () => void;
   loadInitialResults: () => Promise<void>;
   executeQuery: (query?: string) => Promise<void>;
};

export function createPaletteStore(initialContext: CommandContext, options?: { limit?: number }) {
   initializePaletteProviders();
   const limit = options?.limit;

   return create<PaletteStoreState>((set, get) => {
      let searchToken = 0;

      const setError = (error?: unknown) => {
         if (!error) {
            set({ error: undefined });
            return;
         }
         if (error instanceof Error) {
            set({ error: error.message });
            return;
         }
         set({ error: String(error) });
      };

      const runQuery = async (query: string): Promise<void> => {
         const currentToken = ++searchToken;
         set({
            query,
            isLoading: true,
            error: undefined,
         });
         try {
            const results = await runPaletteQuery({
               query,
               context: get().context,
               limit,
            });
            if (currentToken !== searchToken) {
               return;
            }
            set({
               results,
               isLoading: false,
            });
         } catch (error) {
            if (currentToken !== searchToken) {
               return;
            }
            set({ isLoading: false });
            setError(error);
         }
      };

      const loadInitial = async (): Promise<void> => {
         if (get().initialResultsLoaded) {
            return;
         }
         const currentToken = ++searchToken;
         set({ isLoading: true, error: undefined });
         try {
            const results = await getInitialPaletteResults(get().context, limit);
            if (currentToken !== searchToken) {
               return;
            }
            set({
               results,
               isLoading: false,
               initialResultsLoaded: true,
            });
         } catch (error) {
            if (currentToken !== searchToken) {
               return;
            }
            set({ isLoading: false });
            setError(error);
         }
      };

      return {
         context: initialContext,
         query: '',
         results: [],
         isLoading: false,
         error: undefined,
         initialResultsLoaded: false,
         isOpen: false,
         setContext: (context) => {
            set({ context });
         },
         setQuery: (query) => {
            set({ query });
         },
         setOpen: (open) => {
            set({ isOpen: open });
         },
         toggleOpen: () => {
            set((state) => ({ isOpen: !state.isOpen }));
         },
         loadInitialResults: () => loadInitial(),
         executeQuery: (query) => runQuery(query ?? get().query),
      };
   });
}

export type PaletteStore = ReturnType<typeof createPaletteStore>;
