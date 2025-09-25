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
      setBottomBarVisible: (visible: boolean) => {
         window.dispatchEvent(
            new CustomEvent('panel-command', {
               detail: { action: 'setBottomBarVisible', visible },
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
      setBottomBarMode: (mode: 'push' | 'overlay') => {
         window.dispatchEvent(
            new CustomEvent('panel-command', {
               detail: { action: 'setBottomBarMode', mode },
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
         sidebarContext.setBottomBarVisible(true);
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
         sidebarContext.setBottomBarVisible(false);
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
         sidebarContext.setBottomBarMode('push');
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
