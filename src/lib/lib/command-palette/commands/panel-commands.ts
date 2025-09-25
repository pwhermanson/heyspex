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
   };
}

// Register Panel D Open command
registerCommand({
   id: 'panel.d.open',
   title: '/panel D open',
   keywords: ['panel', 'section', 'bottom', 'open', 'show'],
   shortcut: 'Ctrl+Shift+2',
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   run: (ctx: CommandContext) => {
      const sidebarContext = getResizableSidebarContext();
      if (sidebarContext) {
         sidebarContext.setBottomBarVisible(true);
      }
   },
});

// Register Panel D Close command
registerCommand({
   id: 'panel.d.close',
   title: '/panel D close',
   keywords: ['panel', 'section', 'bottom', 'close', 'hide'],
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   run: (ctx: CommandContext) => {
      const sidebarContext = getResizableSidebarContext();
      if (sidebarContext) {
         sidebarContext.setBottomBarVisible(false);
      }
   },
});

// Register Center Bottom Split Toggle command
registerCommand({
   id: 'split.center.bottom.toggle',
   title: '/split center bottom',
   keywords: ['split', 'center', 'bottom', 'toggle', 'divide', 'section'],
   shortcut: 'Ctrl+Shift+3',
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   run: (ctx: CommandContext) => {
      const sidebarContext = getResizableSidebarContext();
      if (sidebarContext) {
         sidebarContext.toggleCenterBottomSplit();
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
      console.log('🚀 Executing /split center bottom close command');
      const sidebarContext = getResizableSidebarContext();
      if (sidebarContext) {
         console.log('📡 Dispatching setCenterBottomSplit event with height: 0');
         sidebarContext.setCenterBottomSplit(0);
      } else {
         console.error('❌ Sidebar context not available');
      }
   },
});
