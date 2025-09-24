import type { ReactNode } from 'react';

export type CommandContext = {
   route: string;
   selection?: { type: string; id: string };
   user: { id: string; role: string };
};

export type CommandRunHandler = (ctx: CommandContext) => void | Promise<void>;

export type Command = {
   id: string;
   title: string;
   keywords?: string[];
   shortcut?: string;
   icon?: ReactNode;
   guard?: (ctx: CommandContext) => boolean;
   run: CommandRunHandler;
   preview?: (ctx: CommandContext) => ReactNode;
};

const registry = new Map<string, Command>();

export function registerCommand(command: Command): void {
   if (registry.has(command.id)) {
      throw new Error(`Command with id "${command.id}" already registered`);
   }
   registry.set(command.id, command);
}

export function listCommands(): Command[] {
   return Array.from(registry.values());
}

export function clearCommands(): void {
   registry.clear();
}
