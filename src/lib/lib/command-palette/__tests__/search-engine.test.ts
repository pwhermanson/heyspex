import assert from 'node:assert/strict';

import type { CommandContext } from '../registry';
import type { PaletteResult } from '../provider-registry';
import { clearProviders, registerProvider } from '../provider-registry';
import { getInitialPaletteResults, runPaletteQuery } from '../search-engine';

const baseContext: CommandContext = {
   route: 'dashboard',
   user: { id: 'user-1', role: 'member' },
};

function makeResult(id: string, score: number): PaletteResult {
   return {
      id,
      title: `Result ${id}`,
      group: 'Test',
      score,
      onSelect: () => {},
   };
}

async function runTest(name: string, fn: () => Promise<void>) {
   try {
      await fn();
      console.log(`? ${name}`);
   } catch (error) {
      console.error(`? ${name}`);
      console.error(error);
      process.exitCode = 1;
   } finally {
      clearProviders();
   }
}

async function main() {
   await runTest(
      'runPaletteQuery merges and sorts provider results by score, priority, and title',
      async () => {
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

         assert.deepEqual(
            results.map((result) => result.id),
            ['second-top', 'first-high', 'first-low']
         );
      }
   );

   await runTest(
      'runPaletteQuery clamps provider results to global limit and skips failing providers',
      async () => {
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

         const originalConsoleError = console.error;
         console.error = () => {};
         try {
            const results = await runPaletteQuery({
               query: '',
               context: baseContext,
               limit: 2,
            });

            assert.deepEqual(
               results.map((result) => result.id),
               ['ok-1', 'ok-2']
            );
         } finally {
            console.error = originalConsoleError;
         }
      }
   );

   await runTest('getInitialPaletteResults pulls from provider initial result hooks', async () => {
      registerProvider({
         id: 'initial-only',
         label: 'Initial',
         priority: 5,
         search: async () => [],
         getInitialResults: async () => [makeResult('initial', 100)],
      });

      const results = await getInitialPaletteResults(baseContext);

      assert.deepEqual(
         results.map((result) => result.id),
         ['initial']
      );
   });

   if (process.exitCode && process.exitCode !== 0) {
      process.exit(process.exitCode);
   }
}

main();
