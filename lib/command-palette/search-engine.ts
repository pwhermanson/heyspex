import type { CommandContext } from './registry';
import type { PaletteProvider, PaletteResult } from './provider-registry';
import { getAvailableProviders } from './provider-registry';

export type PaletteQueryArgs = {
   query: string;
   context: CommandContext;
   limit?: number;
};

export type ProviderSearchResult = {
   provider: PaletteProvider;
   results: PaletteResult[];
};

const DEFAULT_PROVIDER_LIMIT = 20;

export async function runPaletteQuery({
   query,
   context,
   limit,
}: PaletteQueryArgs): Promise<PaletteResult[]> {
   const providers = getAvailableProviders(context);
   if (providers.length === 0) {
      return [];
   }

   const providerLimit = limit ?? DEFAULT_PROVIDER_LIMIT;

   const providerResults = await Promise.all(
      providers.map(async (provider) => {
         try {
            const results = await provider.search({
               query,
               context,
               limit: providerLimit,
            });
            return {
               provider,
               results: Array.isArray(results) ? results.slice(0, providerLimit) : [],
            } satisfies ProviderSearchResult;
         } catch (error) {
            console.error(`[palette] provider "${provider.id}" search failed`, error);
            return {
               provider,
               results: [],
            } satisfies ProviderSearchResult;
         }
      })
   );

   return providerResults
      .flatMap(({ results, provider }) => results.map((result) => ({ provider, result })))
      .sort((a, b) => {
         if (b.result.score !== a.result.score) {
            return b.result.score - a.result.score;
         }
         const providerPriorityA = a.provider.priority ?? 0;
         const providerPriorityB = b.provider.priority ?? 0;
         if (providerPriorityB !== providerPriorityA) {
            return providerPriorityB - providerPriorityA;
         }
         return a.result.title.localeCompare(b.result.title);
      })
      .map(({ result }) => result)
      .slice(0, limit ?? Number.POSITIVE_INFINITY);
}

export async function getInitialPaletteResults(
   context: CommandContext,
   limit?: number
): Promise<PaletteResult[]> {
   const providers = getAvailableProviders(context);
   if (providers.length === 0) {
      return [];
   }
   const providerLimit = limit ?? DEFAULT_PROVIDER_LIMIT;

   const providerResults = await Promise.all(
      providers.map(async (provider) => {
         if (!provider.getInitialResults) {
            return {
               provider,
               results: [],
            } satisfies ProviderSearchResult;
         }
         try {
            const results = await provider.getInitialResults(context);
            return {
               provider,
               results: Array.isArray(results) ? results.slice(0, providerLimit) : [],
            } satisfies ProviderSearchResult;
         } catch (error) {
            console.error(`[palette] provider "${provider.id}" initial results failed`, error);
            return {
               provider,
               results: [],
            } satisfies ProviderSearchResult;
         }
      })
   );

   return providerResults
      .flatMap(({ results, provider }) => results.map((result) => ({ provider, result })))
      .sort((a, b) => {
         if (b.result.score !== a.result.score) {
            return b.result.score - a.result.score;
         }
         const providerPriorityA = a.provider.priority ?? 0;
         const providerPriorityB = b.provider.priority ?? 0;
         if (providerPriorityB !== providerPriorityA) {
            return providerPriorityB - providerPriorityA;
         }
         return a.result.title.localeCompare(b.result.title);
      })
      .map(({ result }) => result)
      .slice(0, limit ?? Number.POSITIVE_INFINITY);
}
