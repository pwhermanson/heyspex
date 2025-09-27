/**
 * Command Factory
 *
 * Provides elegant command registration with automatic context injection
 * and reduced boilerplate
 */

import { registerCommand } from './registry';
import type { CommandContext } from './registry';

export interface CommandDefinition<T = any> {
   id: string;
   title: string;
   keywords: string[];
   shortcut?: string;
   action: (context: T) => void | Promise<void>;
   guard?: (context: CommandContext) => boolean;
   description?: string;
   category?: string;
}

export interface CommandGroup {
   id: string;
   title: string;
   commands: CommandDefinition[];
}

// Context providers registry
const contextProviders = new Map<string, () => any>();

export function registerContextProvider<T>(key: string, provider: () => T) {
   contextProviders.set(key, provider);
}

export function getContext<T>(key: string): T | null {
   const provider = contextProviders.get(key);
   return provider ? provider() : null;
}

// Command factory
export function createCommand<T = any>(definition: CommandDefinition<T>) {
   return registerCommand({
      id: definition.id,
      title: definition.title,
      keywords: definition.keywords,
      shortcut: definition.shortcut,
      guard: definition.guard,
      run: async (ctx: CommandContext) => {
         const context = getContext<T>(definition.id.split('.')[0]);
         if (context) {
            await definition.action(context);
         }
      },
   });
}

// Batch command registration
export function registerCommandGroup(group: CommandGroup) {
   group.commands.forEach(createCommand);
}

// Workspace zone commands factory
export function createWorkspaceZoneCommands(zoneContext: any) {
   const commands: CommandDefinition[] = [
      {
         id: 'workspace.zone.a.cycle',
         title: '/workspace zone A cycle toggle',
         keywords: ['workspace', 'zone', 'A', 'cycle', 'toggle', '3-way'],
         shortcut: 'Ctrl+Shift+5',
         action: () => zoneContext.cycleWorkspaceZoneAMode(),
         category: 'workspace',
      },
      {
         id: 'workspace.zone.a.normal',
         title: '/workspace zone A 3-sided layout',
         keywords: ['workspace', 'zone', 'A', '3-sided', 'layout', 'normal'],
         action: () => zoneContext.setWorkspaceZoneAMode('normal'),
         category: 'workspace',
      },
      {
         id: 'workspace.zone.a.fullscreen',
         title: '/workspace zone A panel B fullscreen',
         keywords: ['workspace', 'zone', 'A', 'panel', 'B', 'fullscreen'],
         action: () => zoneContext.setWorkspaceZoneAMode('fullscreen'),
         category: 'workspace',
      },
      {
         id: 'workspace.zone.a.close',
         title: '/workspace zone A close',
         keywords: ['workspace', 'zone', 'A', 'close', 'hide'],
         action: () => zoneContext.setWorkspaceZoneAMode('hidden'),
         category: 'workspace',
      },
   ];

   return commands.map(createCommand);
}

// Slash command parser
export function parseSlashCommand(input: string): { command: string; args: string[] } | null {
   const match = input.match(/^\/(\w+)(?:\s+(.*))?$/);
   if (!match) return null;

   return {
      command: match[1],
      args: match[2] ? match[2].split(/\s+/) : [],
   };
}

// Command suggestion system
export function createCommandSuggestions(commands: CommandDefinition[]): string[] {
   return commands.map((cmd) => `/${cmd.id.split('.').pop()}`);
}
