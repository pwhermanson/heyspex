/**
 * Refactored Panel Commands
 *
 * Demonstrates elegant command registration with the new factory pattern
 */

import { createCommand, registerCommandGroup, registerContextProvider } from './command-factory';
import type { CommandDefinition } from './command-factory';

// Register context provider for workspace zones
registerContextProvider('workspace', () => {
   // This would be injected from your workspace provider
   return {
      cycleWorkspaceZoneAMode: () => {
         // Implementation from your provider
         console.log('Cycling workspace zone A mode');
      },
      setWorkspaceZoneAMode: (mode: 'normal' | 'fullscreen' | 'hidden') => {
         console.log('Setting workspace zone A mode to:', mode);
      },
      setWorkspaceZoneBMode: (mode: 'push' | 'overlay') => {
         console.log('Setting workspace zone B mode to:', mode);
      },
      setWorkspaceZoneBVisible: (visible: boolean) => {
         console.log('Setting workspace zone B visible:', visible);
      },
   };
});

// Elegant command definitions
const workspaceCommands: CommandDefinition[] = [
   {
      id: 'workspace.zone.a.cycle',
      title: '/workspace zone A cycle toggle',
      keywords: ['workspace', 'zone', 'A', 'cycle', 'toggle', '3-way'],
      shortcut: 'Ctrl+Shift+5',
      action: (context) => context.cycleWorkspaceZoneAMode(),
      description: 'Cycle through normal → fullscreen → hidden → normal',
      category: 'workspace',
   },
   {
      id: 'workspace.zone.a.normal',
      title: '/workspace zone A 3-sided layout',
      keywords: ['workspace', 'zone', 'A', '3-sided', 'layout', 'normal'],
      action: (context) => context.setWorkspaceZoneAMode('normal'),
      description: 'Show 3-panel layout with sidebars',
      category: 'workspace',
   },
   {
      id: 'workspace.zone.a.fullscreen',
      title: '/workspace zone A panel B fullscreen',
      keywords: ['workspace', 'zone', 'A', 'panel', 'B', 'fullscreen'],
      action: (context) => context.setWorkspaceZoneAMode('fullscreen'),
      description: 'Show only center panel in fullscreen',
      category: 'workspace',
   },
   {
      id: 'workspace.zone.a.close',
      title: '/workspace zone A close',
      keywords: ['workspace', 'zone', 'A', 'close', 'hide'],
      action: (context) => context.setWorkspaceZoneAMode('hidden'),
      description: 'Hide all panels',
      category: 'workspace',
   },
   {
      id: 'workspace.zone.b.toggle',
      title: '/workspace zone B toggle',
      keywords: ['workspace', 'zone', 'B', 'toggle', 'show', 'hide'],
      shortcut: 'Ctrl+Shift+2',
      action: (context) => context.setWorkspaceZoneBVisible(true),
      description: 'Toggle workspace zone B visibility',
      category: 'workspace',
   },
   {
      id: 'workspace.zone.b.mode.push',
      title: '/workspace zone B push mode',
      keywords: ['workspace', 'zone', 'B', 'push', 'dock'],
      action: (context) => context.setWorkspaceZoneBMode('push'),
      description: 'Set workspace zone B to push mode',
      category: 'workspace',
   },
   {
      id: 'workspace.zone.b.mode.overlay',
      title: '/workspace zone B overlay mode',
      keywords: ['workspace', 'zone', 'B', 'overlay', 'float'],
      action: (context) => context.setWorkspaceZoneBMode('overlay'),
      description: 'Set workspace zone B to overlay mode',
      category: 'workspace',
   },
];

// Register all commands at once
registerCommandGroup({
   id: 'workspace',
   title: 'Workspace Commands',
   commands: workspaceCommands,
});

// Slash command suggestions
export const SLASH_COMMANDS = [
   '/workspace zone A cycle',
   '/workspace zone A normal',
   '/workspace zone A fullscreen',
   '/workspace zone A close',
   '/workspace zone B toggle',
   '/workspace zone B push',
   '/workspace zone B overlay',
];

// Command categories for better organization
export const COMMAND_CATEGORIES = {
   workspace: {
      title: 'Workspace',
      description: 'Control workspace zones and layouts',
      commands: workspaceCommands.filter((cmd) => cmd.category === 'workspace'),
   },
};
