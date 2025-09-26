'use client';

import { create, type StateCreator } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { LayoutSection, ScreenTab } from './layout-views-store';

// Section management state
export interface LayoutSectionsState {
   // Section visibility and configuration
   sectionVisibility: Record<LayoutSection, boolean>;
   sectionWidths: Record<LayoutSection, number>;

   // Actions
   toggleSection: (section: LayoutSection) => void;
   setSectionWidth: (section: LayoutSection, width: number) => void;
   setSectionVisibility: (section: LayoutSection, visible: boolean) => void;

   // Tab management within sections
   addTabToSection: (section: LayoutSection, tab: Omit<ScreenTab, 'id'>) => ScreenTab;
   removeTabFromSection: (section: LayoutSection, tabId: string) => void;
   setActiveTab: (section: LayoutSection, tabId: string) => void;
   updateTab: (section: LayoutSection, tabId: string, updates: Partial<ScreenTab>) => void;
}

// Default configurations
const DEFAULT_SECTION_WIDTHS: Record<LayoutSection, number> = {
   A: 244, // Left panel
   B: 0, // Main content (flexible)
   C: 320, // Right panel
};

const DEFAULT_SECTION_VISIBILITY: Record<LayoutSection, boolean> = {
   A: true, // Left panel visible by default
   B: true, // Main content always visible
   C: false, // Right panel hidden by default
};

// Helper function to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

// Create the store with persistence
export const useLayoutSectionsStore = create<LayoutSectionsState>()(
   persist<LayoutSectionsState>(
      (set) => ({
         // Initial state
         sectionVisibility: DEFAULT_SECTION_VISIBILITY,
         sectionWidths: DEFAULT_SECTION_WIDTHS,

         // Section management
         toggleSection: (section) => {
            set((state) => ({
               sectionVisibility: {
                  ...state.sectionVisibility,
                  [section]: !state.sectionVisibility[section],
               },
            }));
         },

         setSectionWidth: (section, width) => {
            set((state) => ({
               sectionWidths: {
                  ...state.sectionWidths,
                  [section]: width,
               },
            }));
         },

         setSectionVisibility: (section, visible) => {
            set((state) => ({
               sectionVisibility: {
                  ...state.sectionVisibility,
                  [section]: visible,
               },
            }));
         },

         // Tab management
         addTabToSection: (section, tabData) => {
            const tab: ScreenTab = {
               ...tabData,
               id: generateId(),
            };

            // Note: In a full implementation, we'd need to store tabs per section
            // For now, this is a placeholder that shows the API structure
            console.log(`Adding tab to section ${section}:`, tab);

            return tab;
         },

         removeTabFromSection: (section, tabId) => {
            // Placeholder implementation
            console.log(`Removing tab ${tabId} from section ${section}`);
         },

         setActiveTab: (section, tabId) => {
            // Placeholder implementation
            console.log(`Setting active tab ${tabId} in section ${section}`);
         },

         updateTab: (section, tabId, updates) => {
            // Placeholder implementation
            console.log(`Updating tab ${tabId} in section ${section}:`, updates);
         },
      }),
      {
         name: 'heyspex-layout-sections',
         storage: createJSONStorage(() => localStorage),

         // Only persist section configuration
         partialize: (state) =>
            ({
               sectionVisibility: state.sectionVisibility,
               sectionWidths: state.sectionWidths,
            }) as LayoutSectionsState,
      }
   ) as StateCreator<LayoutSectionsState, [], []>
);
