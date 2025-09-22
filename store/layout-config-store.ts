'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createDefaultLayoutView, createPredefinedViews, createDefaultShortcuts } from '@/lib/layout-utils';

// Types for layout sections as defined in the feature requirements
export type LayoutSection = 'A' | 'B' | 'C'; // Left sidebar, main content, right sidebar
export type LayoutArea = 'top-bar' | LayoutSection | 'bottom-bar';

// Screen types that can be loaded in sections
export type ScreenType =
  | 'issues'
  | 'features'
  | 'roadmap'
  | 'projects'
  | 'teams'
  | 'members'
  | 'settings'
  | 'inbox'
  | 'ai-chat'
  | 'unit-tests'
  | 'flows'
  | 'custom-view';

// Individual tab/screen instance
export interface ScreenTab {
  id: string;
  type: ScreenType;
  title: string;
  isActive: boolean;
  config?: Record<string, any>; // Screen-specific configuration
}

// View configuration for a section
export interface SectionView {
  section: LayoutSection;
  tabs: ScreenTab[];
  activeTabId?: string;
  isCollapsed?: boolean;
  width?: number; // For resizable sections
}

// Saved layout view (user-defined arrangement)
export interface LayoutView {
  id: string;
  name: string;
  description?: string;
  sections: Record<LayoutSection, SectionView>;
  keyboardShortcut?: string;
  isDefault?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Keyboard shortcut configuration
export interface KeyboardShortcut {
  id: string;
  action: 'toggle-section' | 'switch-view' | 'toggle-bottom-bar' | 'open-settings' | 'custom';
  keys: string[]; // e.g., ['ctrl', 'shift', 'l']
  description: string;
  isGlobal?: boolean; // Whether it works across the app
  section?: LayoutSection; // For section-specific shortcuts
  viewId?: string; // For view-specific shortcuts
}

// Layout configuration state
export interface LayoutConfigState {
  // Current active layout
  currentViewId?: string;

  // All saved views
  views: LayoutView[];

  // Keyboard shortcuts
  shortcuts: KeyboardShortcut[];

  // Section visibility and configuration
  sectionVisibility: Record<LayoutSection, boolean>;
  sectionWidths: Record<LayoutSection, number>;

  // Global layout settings
  settings: {
    enableAnimations: boolean;
    autoSave: boolean;
    defaultViewId?: string;
    allowKeyboardShortcuts: boolean;
    allowAIControl: boolean;
  };

  // Actions
  createView: (view: Omit<LayoutView, 'id' | 'createdAt' | 'updatedAt'>) => LayoutView;
  updateView: (id: string, updates: Partial<LayoutView>) => void;
  deleteView: (id: string) => void;
  setCurrentView: (viewId: string) => void;
  setDefaultView: (viewId: string) => void;

  // Section management
  toggleSection: (section: LayoutSection) => void;
  setSectionWidth: (section: LayoutSection, width: number) => void;
  setSectionVisibility: (section: LayoutSection, visible: boolean) => void;

  // Tab management within sections
  addTabToSection: (section: LayoutSection, tab: Omit<ScreenTab, 'id'>) => ScreenTab;
  removeTabFromSection: (section: LayoutSection, tabId: string) => void;
  setActiveTab: (section: LayoutSection, tabId: string) => void;
  updateTab: (section: LayoutSection, tabId: string, updates: Partial<ScreenTab>) => void;

  // Keyboard shortcuts
  addShortcut: (shortcut: Omit<KeyboardShortcut, 'id'>) => KeyboardShortcut;
  updateShortcut: (id: string, updates: Partial<KeyboardShortcut>) => void;
  removeShortcut: (id: string) => void;

  // Settings
  updateSettings: (settings: Partial<LayoutConfigState['settings']>) => void;
}

// Default configurations
const DEFAULT_SECTION_WIDTHS: Record<LayoutSection, number> = {
  A: 244, // Left sidebar
  B: 0,   // Main content (flexible)
  C: 320, // Right sidebar
};

const DEFAULT_SECTION_VISIBILITY: Record<LayoutSection, boolean> = {
  A: true,  // Left sidebar visible by default
  B: true,  // Main content always visible
  C: false, // Right sidebar hidden by default
};

const DEFAULT_SETTINGS = {
  enableAnimations: true,
  autoSave: true,
  allowKeyboardShortcuts: true,
  allowAIControl: true,
};

// Helper function to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

// Helper function to initialize default data
function initializeDefaultData() {
  const defaultView = createDefaultLayoutView();
  const predefinedViews = createPredefinedViews();
  const defaultShortcuts = createDefaultShortcuts();

  return {
    views: [defaultView, ...predefinedViews].map(view => ({
      ...view,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    shortcuts: defaultShortcuts.map(shortcut => ({
      ...shortcut,
      id: generateId(),
    })),
  };
}

// Create the store with persistence
export const useLayoutConfigStore = create<LayoutConfigState>()(
  persist(
    (set, get) => {
      // Initialize with default data
      const defaultData = initializeDefaultData();

      return {
        // Initial state
        views: defaultData.views,
        shortcuts: defaultData.shortcuts,
        sectionVisibility: DEFAULT_SECTION_VISIBILITY,
        sectionWidths: DEFAULT_SECTION_WIDTHS,
        settings: {
          ...DEFAULT_SETTINGS,
          defaultViewId: defaultData.views[0]?.id, // Set first view as default
        },
        currentViewId: defaultData.views[0]?.id, // Set first view as current

      // View management
      createView: (viewData) => {
        const view: LayoutView = {
          ...viewData,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          views: [...state.views, view],
        }));

        return view;
      },

      updateView: (id, updates) => {
        set((state) => ({
          views: state.views.map((view) =>
            view.id === id
              ? { ...view, ...updates, updatedAt: new Date() }
              : view
          ),
        }));
      },

      deleteView: (id) => {
        set((state) => ({
          views: state.views.filter((view) => view.id !== id),
          // Clear current view if it was deleted
          currentViewId: state.currentViewId === id ? undefined : state.currentViewId,
        }));
      },

      setCurrentView: (viewId) => {
        set({ currentViewId: viewId });
      },

      setDefaultView: (viewId) => {
        set((state) => ({
          settings: {
            ...state.settings,
            defaultViewId: viewId,
          },
        }));
      },

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

      // Settings
      updateSettings: (newSettings) => {
        set((state) => ({
          settings: {
            ...state.settings,
            ...newSettings,
          },
        }));
      }),
    {
      name: 'heyspex-layout-config',
      storage: createJSONStorage(() => localStorage),

      // Only persist certain parts of the state to avoid issues
      partialize: (state) => ({
        views: state.views,
        shortcuts: state.shortcuts,
        sectionVisibility: state.sectionVisibility,
        sectionWidths: state.sectionWidths,
        settings: state.settings,
        currentViewId: state.currentViewId,
      }),

      // Handle hydration safely for SSR compatibility
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Ensure dates are properly deserialized
          state.views = state.views.map(view => ({
            ...view,
            createdAt: new Date(view.createdAt),
            updatedAt: new Date(view.updatedAt),
          }));
        }
      },
    }
  )
);
