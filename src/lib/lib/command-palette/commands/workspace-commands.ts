import { registerCommand } from '@/src/lib/lib/command-palette/registry';
import type { CommandContext } from '@/src/lib/lib/command-palette/registry';

// Note: Workspace Zone A commands are already registered in panel-commands.ts
// This file only contains workspace management commands

// Register Create Workspace command
registerCommand({
   id: 'workspace.create',
   title: '/workspace create',
   keywords: ['workspace', 'create', 'new', 'add'],
   shortcut: 'Ctrl+Shift+N',
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   run: (ctx: CommandContext) => {
      // This will trigger the create workspace dialog
      // In a real implementation, you might dispatch an event or use a global state
      console.log('Create workspace command triggered');
      // TODO: Implement workspace creation trigger
   },
});

// Register Switch Workspace command
registerCommand({
   id: 'workspace.switch',
   title: '/workspace switch',
   keywords: ['workspace', 'switch', 'change', 'select'],
   shortcut: 'Ctrl+Shift+W',
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   run: (ctx: CommandContext) => {
      // This will trigger the workspace switcher
      console.log('Switch workspace command triggered');
      // TODO: Implement workspace switching trigger
   },
});

// Register Workspace Settings command
registerCommand({
   id: 'workspace.settings',
   title: '/workspace settings',
   keywords: ['workspace', 'settings', 'configure', 'preferences'],
   shortcut: 'Ctrl+Shift+,',
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   run: (ctx: CommandContext) => {
      // This will open workspace settings
      console.log('Workspace settings command triggered');
      // TODO: Implement workspace settings navigation
   },
});

// Register List Workspaces command
registerCommand({
   id: 'workspace.list',
   title: '/workspace list',
   keywords: ['workspace', 'list', 'show', 'all'],
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   run: (ctx: CommandContext) => {
      // This will show a list of all workspaces
      console.log('List workspaces command triggered');
      // TODO: Implement workspace list display
   },
});
