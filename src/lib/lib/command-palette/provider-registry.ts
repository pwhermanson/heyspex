import type { ReactNode } from 'react';
import type { CommandContext, CommandRunHandler } from './registry';

export type PaletteResult = {
   id: string;
   title: string;
   group: string;
   subtitle?: string;
   icon?: ReactNode;
   shortcut?: string;
   score: number;
   onSelect: CommandRunHandler;
};

export type PaletteProviderSearchArgs = {
   query: string;
   context: CommandContext;
   limit?: number;
};

export type PaletteProvider = {
   id: string;
   label: string;
   priority?: number;
   isAvailable?: (context: CommandContext) => boolean;
   search: (args: PaletteProviderSearchArgs) => Promise<PaletteResult[]> | PaletteResult[];
   getInitialResults?: (context: CommandContext) => Promise<PaletteResult[]> | PaletteResult[];
};

const providers = new Map<string, PaletteProvider>();

export function registerProvider(provider: PaletteProvider): void {
   if (providers.has(provider.id)) {
      throw new Error(`Provider with id "${provider.id}" already registered`);
   }
   providers.set(provider.id, provider);
}

export function listProviders(): PaletteProvider[] {
   return Array.from(providers.values()).sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
}

export function getAvailableProviders(context: CommandContext): PaletteProvider[] {
   return listProviders().filter((provider) => provider.isAvailable?.(context) ?? true);
}

export function clearProviders(): void {
   providers.clear();
}
