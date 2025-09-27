'use client';

import { registerCommand } from '../registry';
import type { CommandContext } from '../registry';

// Function to get the resizable panel provider functions
function getResizablePanelContext() {
   // This will be called at runtime when the command is executed
   // We need to access the context from the React component tree
   if (typeof window === 'undefined') return null;

   // Access the global store or context that holds the panel controls
   // For now, we'll dispatch custom events that the provider can listen to
   return {
      setWorkspaceZoneBVisible: (visible: boolean) => {
         window.dispatchEvent(
            new CustomEvent('panel-command', {
               detail: { action: 'setWorkspaceZoneBVisible', visible },
            })
         );
      },
      setCenterBottomSplit: (height: number) => {
         window.dispatchEvent(
            new CustomEvent('panel-command', {
               detail: { action: 'setCenterBottomSplit', height },
            })
         );
      },
      toggleCenterBottomSplit: () => {
         window.dispatchEvent(
            new CustomEvent('panel-command', {
               detail: { action: 'toggleCenterBottomSplit' },
            })
         );
      },
      setWorkspaceZoneBMode: (mode: 'push' | 'overlay') => {
         window.dispatchEvent(
            new CustomEvent('panel-command', {
               detail: { action: 'setWorkspaceZoneBMode', mode },
            })
         );
      },
      setWorkspaceZoneAPanelAOpen: (open: boolean) => {
         window.dispatchEvent(
            new CustomEvent('panel-command', {
               detail: { action: 'setLeftPanelOpen', open },
            })
         );
      },
      setWorkspaceZoneAPanelCOpen: (open: boolean) => {
         window.dispatchEvent(
            new CustomEvent('panel-command', {
               detail: { action: 'setWorkspaceZoneAPanelCOpen', open },
            })
         );
      },
      toggleWorkspaceZoneAPanelA: () => {
         window.dispatchEvent(
            new CustomEvent('panel-command', {
               detail: { action: 'toggleLeftPanel' },
            })
         );
      },
      toggleWorkspaceZoneAPanelC: () => {
         window.dispatchEvent(
            new CustomEvent('panel-command', {
               detail: { action: 'toggleRightPanel' },
            })
         );
      },
      setMainFullscreen: (fullscreen: boolean) => {
         window.dispatchEvent(
            new CustomEvent('panel-command', {
               detail: { action: 'setMainFullscreen', fullscreen },
            })
         );
      },
      setWorkspaceZoneAVisible: (visible: boolean) => {
         window.dispatchEvent(
            new CustomEvent('panel-command', {
               detail: { action: 'setWorkspaceZoneAVisible', visible },
            })
         );
      },
      toggleWorkspaceZoneA: () => {
         window.dispatchEvent(
            new CustomEvent('panel-command', {
               detail: { action: 'toggleWorkspaceZoneA' },
            })
         );
      },
      setControlBarVisible: (visible: boolean) => {
         window.dispatchEvent(
            new CustomEvent('panel-command', {
               detail: { action: 'setControlBarVisible', visible },
            })
         );
      },
      toggleControlBar: () => {
         window.dispatchEvent(
            new CustomEvent('panel-command', {
               detail: { action: 'toggleControlBar' },
            })
         );
      },
      setWorkspaceZoneAMode: (mode: 'normal' | 'fullscreen' | 'hidden') => {
         window.dispatchEvent(
            new CustomEvent('panel-command', {
               detail: { action: 'setWorkspaceZoneAMode', mode },
            })
         );
      },
      cycleWorkspaceZoneAMode: () => {
         window.dispatchEvent(
            new CustomEvent('panel-command', {
               detail: { action: 'cycleWorkspaceZoneAMode' },
            })
         );
      },
   };
}

// Register Workspace Zone B Open command
registerCommand({
   id: 'workspace.zone.b.open',
   title: '/workspace zone B open',
   keywords: ['workspace', 'zone', 'bottom', 'open', 'show'],
   shortcut: 'Ctrl+Shift+2',
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   run: (ctx: CommandContext) => {
      const panelContext = getResizablePanelContext();
      if (panelContext) {
         panelContext.setWorkspaceZoneBVisible(true);
      }
   },
});

// Register Workspace Zone B Close command
registerCommand({
   id: 'workspace.zone.b.close',
   title: '/workspace zone B close',
   keywords: ['workspace', 'zone', 'bottom', 'close', 'hide'],
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   run: (ctx: CommandContext) => {
      const panelContext = getResizablePanelContext();
      if (panelContext) {
         panelContext.setWorkspaceZoneBVisible(false);
      }
   },
});

// Register Center Bottom Split Open command
registerCommand({
   id: 'split.center.bottom.open',
   title: '/split center bottom open',
   keywords: ['split', 'center', 'bottom', 'open', 'show', '200px'],
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   run: (ctx: CommandContext) => {
      const panelContext = getResizablePanelContext();
      if (panelContext) {
         // Switch to push mode so user can see the split result
         panelContext.setWorkspaceZoneBMode('push');
         // Open the center bottom split
         panelContext.setCenterBottomSplit(200);
      }
   },
});

// Register Center Bottom Split Close command
registerCommand({
   id: 'split.center.bottom.close',
   title: '/split center bottom close',
   keywords: ['split', 'center', 'bottom', 'close', 'hide', 'collapse'],
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   run: (ctx: CommandContext) => {
      const panelContext = getResizablePanelContext();
      if (panelContext) {
         panelContext.setCenterBottomSplit(0);
      }
   },
});

// Old workspace zone A open command removed - replaced with new 3-way toggle system

// Old workspace zone A close command removed - replaced with new 3-way toggle system

// Old workspace zone A toggle command removed - replaced with new 3-way toggle system

// Register Control Bar Open command
registerCommand({
   id: 'controlbar.open',
   title: '/control bar open',
   keywords: ['control', 'bar', 'header', 'open', 'show'],
   shortcut: 'Ctrl+Shift+8',
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   run: (ctx: CommandContext) => {
      const panelContext = getResizablePanelContext();
      if (panelContext) {
         // Show control bar
         panelContext.setControlBarVisible(true);
      }
   },
});

// Register Control Bar Close command
registerCommand({
   id: 'controlbar.close',
   title: '/control bar close',
   keywords: ['control', 'bar', 'header', 'close', 'hide'],
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   run: (ctx: CommandContext) => {
      const panelContext = getResizablePanelContext();
      if (panelContext) {
         // Hide control bar
         panelContext.setControlBarVisible(false);
      }
   },
});

// Register Control Bar Toggle command
registerCommand({
   id: 'controlbar.toggle',
   title: '/control bar toggle',
   keywords: ['control', 'bar', 'header', 'toggle'],
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   run: (ctx: CommandContext) => {
      const panelContext = getResizablePanelContext();
      if (panelContext) {
         // Toggle control bar visibility
         panelContext.toggleControlBar();
      }
   },
});

// Register Workspace Zone A Open command
registerCommand({
   id: 'workspace.zone.a.open',
   title: '/workspace zone A open',
   keywords: ['workspace', 'zone', 'A', 'open', 'show', 'panels'],
   shortcut: 'Ctrl+Shift+1',
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   run: (ctx: CommandContext) => {
      const panelContext = getResizablePanelContext();
      if (panelContext) {
         panelContext.setWorkspaceZoneAMode('normal');
      }
   },
});

// Register Workspace Zone A - 3-Sided Layout command
registerCommand({
   id: 'workspace.zone.a.normal',
   title: '/workspace zone A 3-sided layout',
   keywords: ['workspace', 'zone', 'A', '3-sided', 'layout', 'normal', 'panels'],
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   run: (ctx: CommandContext) => {
      const panelContext = getResizablePanelContext();
      if (panelContext) {
         panelContext.setWorkspaceZoneAMode('normal');
      }
   },
});

// Register Workspace Zone A - Panel B Fullscreen command
registerCommand({
   id: 'workspace.zone.a.fullscreen',
   title: '/workspace zone A panel B fullscreen',
   keywords: ['workspace', 'zone', 'A', 'panel', 'B', 'fullscreen', 'expand', 'center'],
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   run: (ctx: CommandContext) => {
      const panelContext = getResizablePanelContext();
      if (panelContext) {
         panelContext.setWorkspaceZoneAMode('fullscreen');
      }
   },
});

// Register Workspace Zone A - Close command
registerCommand({
   id: 'workspace.zone.a.close',
   title: '/workspace zone A close',
   keywords: ['workspace', 'zone', 'A', 'close', 'hide'],
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   run: (ctx: CommandContext) => {
      const panelContext = getResizablePanelContext();
      if (panelContext) {
         panelContext.setWorkspaceZoneAMode('hidden');
      }
   },
});

// Register Workspace Zone A - Cycle Toggle command (3-way toggle)
registerCommand({
   id: 'workspace.zone.a.cycle',
   title: '/workspace zone A cycle toggle',
   keywords: ['workspace', 'zone', 'A', 'cycle', 'toggle', '3-way'],
   shortcut: 'Ctrl+Shift+5',
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   run: (ctx: CommandContext) => {
      const panelContext = getResizablePanelContext();
      if (panelContext) {
         panelContext.cycleWorkspaceZoneAMode();
      }
   },
});
