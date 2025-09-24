'use client';

import { create, type StateCreator } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Global layout settings
export interface LayoutSettings {
   enableAnimations: boolean;
   autoSave: boolean;
   defaultViewId?: string;
   allowKeyboardShortcuts: boolean;
   allowAIControl: boolean;
}

// Layout settings state
export interface LayoutSettingsState {
   // Global layout settings
   settings: LayoutSettings;

   // Actions
   updateSettings: (settings: Partial<LayoutSettings>) => void;
}

// Default settings
const DEFAULT_SETTINGS: LayoutSettings = {
   enableAnimations: true,
   autoSave: true,
   allowKeyboardShortcuts: true,
   allowAIControl: true,
};

// Create the store with persistence
export const useLayoutSettingsStore = create<LayoutSettingsState>()(
   persist<LayoutSettingsState>(
      (set) => ({
         // Initial state
         settings: DEFAULT_SETTINGS,

         // Settings
         updateSettings: (newSettings) => {
            set((state) => ({
               settings: {
                  ...state.settings,
                  ...newSettings,
               },
            }));
         },
      }),
      {
         name: 'heyspex-layout-settings',
         storage: createJSONStorage(() => localStorage),

         // Only persist settings
         partialize: (state) =>
            ({
               settings: state.settings,
            }) as LayoutSettingsState,
      }
   ) as StateCreator<LayoutSettingsState, [], []>
);
