import { commandsProvider } from './commands-provider';

let initialized = false;

export function initializePaletteProviders(): void {
   if (initialized) {
      return;
   }
   initialized = true;

   // Touch the provider reference so bundlers keep the side-effectful import even if unused.
   void commandsProvider;
}
