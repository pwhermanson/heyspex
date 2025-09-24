'use client';

import { useEffect } from 'react';
import { usePaletteStore } from '@/src/components/command-palette/palette-provider';

export function useCommandPaletteShortcuts() {
   const toggleOpen = usePaletteStore((state) => state.toggleOpen);

   useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
         // Check for Cmd+/ (macOS) or Ctrl+/ (Windows/Linux)
         const isMainShortcut = (event.metaKey || event.ctrlKey) && event.key === '/';

         // Check for Shift+Cmd+P (macOS) or Shift+Ctrl+P (Windows/Linux) as fallback
         const isFallbackShortcut =
            (event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'P';

         if (isMainShortcut || isFallbackShortcut) {
            event.preventDefault();
            event.stopPropagation();
            toggleOpen();
         }
      };

      // Add global event listener
      document.addEventListener('keydown', handleKeyDown, true);

      // Cleanup
      return () => {
         document.removeEventListener('keydown', handleKeyDown, true);
      };
   }, [toggleOpen]);
}
