/**
 * Command Factory
 *
 * Provides elegant command registration with automatic context injection
 * and reduced boilerplate
 */

import { registerCommand } from '../lib/command-palette/registry';
import type { CommandContext } from '../lib/command-palette/registry';

export interface CommandDefinition<T = unknown> {
   id: string;
   title: string;
   keywords: string[];
   shortcut?: string;
   action: (context: T) => void | Promise<void>;
   guard?: (context: CommandContext) => boolean;
   description?: string;
   category?: string;
}

export interface CommandGroup<T = unknown> {
   id: string;
   title: string;
   commands: CommandDefinition<T>[];
}

// Context providers registry
const contextProviders = new Map<string, () => unknown>();

export function registerContextProvider<T>(key: string, provider: () => T) {
   contextProviders.set(key, provider as () => unknown);
}

export function getContext<T>(key: string): T | null {
   const provider = contextProviders.get(key);
   return provider ? (provider() as T) : null;
}

// Command factory
export function createCommand<T = unknown>(definition: CommandDefinition<T>) {
   return registerCommand({
      id: definition.id,
      title: definition.title,
      keywords: definition.keywords,
      shortcut: definition.shortcut,
      guard: definition.guard,
      run: async () => {
         const context = getContext<T>(definition.id.split('.')[0]);
         if (context) {
            await definition.action(context);
         }
      },
   });
}

// Batch command registration
export function registerCommandGroup<T = unknown>(group: CommandGroup<T>) {
   group.commands.forEach(createCommand);
}

// Workspace zone context type
export interface WorkspaceZoneContext {
   cycleWorkspaceZoneAMode: () => void;
   setWorkspaceZoneAMode: (mode: 'normal' | 'fullscreen' | 'hidden') => void;
   setWorkspaceZoneBVisible: (visible: boolean) => void;
   setWorkspaceZoneBMode: (mode: 'push' | 'overlay') => void;
}

// Workspace zone commands factory
export function createWorkspaceZoneCommands(zoneContext: WorkspaceZoneContext) {
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
