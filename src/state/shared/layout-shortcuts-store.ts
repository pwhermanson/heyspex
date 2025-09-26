'use client';

import { create, type StateCreator } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { LayoutSection } from './layout-views-store';

// Keyboard shortcut configuration
export interface KeyboardShortcut {
   id: string;
   action:
      | 'toggle-section'
      | 'switch-view'
      | 'toggle-workspace-zone-b'
      | 'open-settings'
      | 'custom';
   keys: string[]; // e.g., ['ctrl', 'shift', 'l']
   description: string;
   isGlobal?: boolean; // Whether it works across the app
   section?: LayoutSection; // For section-specific shortcuts
   viewId?: string; // For view-specific shortcuts
}

// Keyboard shortcuts state
export interface LayoutShortcutsState {
   // Keyboard shortcuts
   shortcuts: KeyboardShortcut[];

   // Actions
   addShortcut: (shortcut: Omit<KeyboardShortcut, 'id'>) => KeyboardShortcut;
   updateShortcut: (id: string, updates: Partial<KeyboardShortcut>) => void;
   removeShortcut: (id: string) => void;
}

// Helper function to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

// Helper function to initialize default shortcuts
function initializeDefaultShortcuts() {
   // This would import from layout-utils, but for now we'll create a basic set
   return [
      {
         action: 'toggle-section' as const,
         keys: ['ctrl', 'shift', 'l'],
         description: 'Toggle left panel',
         isGlobal: true,
         section: 'A' as LayoutSection,
      },
      {
         action: 'toggle-section' as const,
         keys: ['ctrl', 'shift', 'r'],
         description: 'Toggle right panel',
         isGlobal: true,
         section: 'C' as LayoutSection,
      },
      {
         action: 'open-settings' as const,
         keys: ['ctrl', ','],
         description: 'Open settings',
         isGlobal: true,
      },
   ].map((shortcut) => ({
      ...shortcut,
      id: generateId(),
   }));
}

// Create the store with persistence
export const useLayoutShortcutsStore = create<LayoutShortcutsState>()(
   persist<LayoutShortcutsState>(
      (set) => ({
         // Initial state
         shortcuts: initializeDefaultShortcuts(),

         // Keyboard shortcuts
         addShortcut: (shortcutData) => {
            const shortcut: KeyboardShortcut = {
               ...shortcutData,
               id: generateId(),
            };

            set((state) => ({
               shortcuts: [...state.shortcuts, shortcut],
            }));

            return shortcut;
         },

         updateShortcut: (id, updates) => {
            set((state) => ({
               shortcuts: state.shortcuts.map((shortcut) =>
                  shortcut.id === id ? { ...shortcut, ...updates } : shortcut
               ),
            }));
         },

         removeShortcut: (id) => {
            set((state) => ({
               shortcuts: state.shortcuts.filter((shortcut) => shortcut.id !== id),
            }));
         },
      }),
      {
         name: 'heyspex-layout-shortcuts',
         storage: createJSONStorage(() => localStorage),

         // Only persist shortcuts
         partialize: (state) =>
            ({
               shortcuts: state.shortcuts,
            }) as LayoutShortcutsState,
      }
   ) as StateCreator<LayoutShortcutsState, [], []>
);
