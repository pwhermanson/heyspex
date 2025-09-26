'use client';

import { registerCommand } from '../registry';
import type { CommandContext } from '../registry';

// Function to get the resizable sidebar provider functions
function getResizableSidebarContext() {
   // This will be called at runtime when the command is executed
   // We need to access the context from the React component tree
   if (typeof window === 'undefined') return null;

   // Access the global store or context that holds the sidebar controls
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
               detail: { action: 'setWorkspaceZoneAPanelAOpen', open },
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
               detail: { action: 'toggleWorkspaceZoneAPanelA' },
            })
         );
      },
      toggleWorkspaceZoneAPanelC: () => {
         window.dispatchEvent(
            new CustomEvent('panel-command', {
               detail: { action: 'toggleWorkspaceZoneAPanelC' },
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
      const sidebarContext = getResizableSidebarContext();
      if (sidebarContext) {
         sidebarContext.setWorkspaceZoneBVisible(true);
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
      const sidebarContext = getResizableSidebarContext();
      if (sidebarContext) {
         sidebarContext.setWorkspaceZoneBVisible(false);
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
      const sidebarContext = getResizableSidebarContext();
      if (sidebarContext) {
         // Switch to push mode so user can see the split result
         sidebarContext.setWorkspaceZoneBMode('push');
         // Open the center bottom split
         sidebarContext.setCenterBottomSplit(200);
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
      const sidebarContext = getResizableSidebarContext();
      if (sidebarContext) {
         sidebarContext.setCenterBottomSplit(0);
      }
   },
});

// Register Workspace Zone A Open command
registerCommand({
   id: 'workspace.zone.a.open',
   title: '/workspace zone A open',
   keywords: ['workspace', 'zone', 'main', 'content', 'open', 'show'],
   shortcut: 'Ctrl+Shift+,',
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   run: (ctx: CommandContext) => {
      const sidebarContext = getResizableSidebarContext();
      if (sidebarContext) {
         // Toggle Workspace Zone A container (panels A, B, C)
         sidebarContext.toggleWorkspaceZoneA();
      }
   },
});

// Register Workspace Zone A Close command
registerCommand({
   id: 'workspace.zone.a.close',
   title: '/workspace zone A close',
   keywords: ['workspace', 'zone', 'main', 'content', 'close', 'hide'],
   shortcut: 'Ctrl+Shift+1',
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   run: (ctx: CommandContext) => {
      const sidebarContext = getResizableSidebarContext();
      if (sidebarContext) {
         // Toggle Workspace Zone A container (panels A, B, C)
         sidebarContext.toggleWorkspaceZoneA();
      }
   },
});

// Register Workspace Zone A Toggle command
registerCommand({
   id: 'workspace.zone.a.toggle',
   title: '/workspace zone A toggle',
   keywords: ['workspace', 'zone', 'main', 'content', 'toggle'],
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   run: (ctx: CommandContext) => {
      const sidebarContext = getResizableSidebarContext();
      if (sidebarContext) {
         // Toggle Workspace Zone A container visibility
         sidebarContext.toggleWorkspaceZoneA();
      }
   },
});

// Register Control Bar Open command
registerCommand({
   id: 'controlbar.open',
   title: '/control bar open',
   keywords: ['control', 'bar', 'header', 'open', 'show'],
   shortcut: 'Ctrl+Shift+8',
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   run: (ctx: CommandContext) => {
      const sidebarContext = getResizableSidebarContext();
      if (sidebarContext) {
         // Show control bar
         sidebarContext.setControlBarVisible(true);
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
      const sidebarContext = getResizableSidebarContext();
      if (sidebarContext) {
         // Hide control bar
         sidebarContext.setControlBarVisible(false);
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
      const sidebarContext = getResizableSidebarContext();
      if (sidebarContext) {
         // Toggle control bar visibility
         sidebarContext.toggleControlBar();
      }
   },
});
