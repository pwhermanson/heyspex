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
