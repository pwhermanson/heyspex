import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { CommandContext } from '../registry';
import type { PaletteResult } from '../provider-registry';
import { clearProviders, registerProvider } from '../provider-registry';
import { getInitialPaletteResults, runPaletteQuery } from '../search-engine';

const baseContext: CommandContext = {
   route: 'dashboard',
   user: { id: 'user-1', role: 'member' },
};

const makeResult = (id: string, score: number): PaletteResult => ({
   id,
   title: `Result ${id}`,
   group: 'Test',
   score,
   onSelect: () => {},
});

beforeEach(() => {
   clearProviders();
   vi.restoreAllMocks();
});

describe('command palette search engine', () => {
   it('merges and sorts provider results by score, priority, and title', async () => {
      registerProvider({
         id: 'first',
         label: 'First',
         priority: 10,
         search: async () => [makeResult('first-high', 400), makeResult('first-low', 50)],
      });
      registerProvider({
         id: 'second',
         label: 'Second',
         priority: 20,
         search: async () => [makeResult('second-top', 400)],
      });

      const results = await runPaletteQuery({ query: '', context: baseContext });

      expect(results.map((result) => result.id)).toEqual(['second-top', 'first-high', 'first-low']);
   });

   it('clamps provider results to the global limit and skips failing providers', async () => {
      registerProvider({
         id: 'okay',
         label: 'Okay',
         priority: 5,
         search: async () => [
            makeResult('ok-1', 300),
            makeResult('ok-2', 200),
            makeResult('ok-3', 100),
         ],
      });
      registerProvider({
         id: 'fails',
         label: 'Fails',
         search: async () => {
            throw new Error('nope');
         },
      });

      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      try {
         const results = await runPaletteQuery({
            query: '',
            context: baseContext,
            limit: 2,
         });

         expect(results.map((result) => result.id)).toEqual(['ok-1', 'ok-2']);
      } finally {
         errorSpy.mockRestore();
      }
   });

   it('pulls initial results from provider hooks', async () => {
      registerProvider({
         id: 'initial-only',
         label: 'Initial',
         priority: 5,
         search: async () => [],
         getInitialResults: async () => [makeResult('initial', 100)],
      });

      const results = await getInitialPaletteResults(baseContext);

      expect(results.map((result) => result.id)).toEqual(['initial']);
   });
});
