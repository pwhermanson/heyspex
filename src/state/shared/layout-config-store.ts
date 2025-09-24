'use client';

import { create } from 'zustand';
import { useLayoutViewsStore } from './layout-views-store';
import { useLayoutSectionsStore } from './layout-sections-store';
import { useLayoutShortcutsStore } from './layout-shortcuts-store';
import { useLayoutSettingsStore } from './layout-settings-store';
import type { LayoutSection, ScreenTab, LayoutView } from './layout-views-store';
import type { KeyboardShortcut } from './layout-shortcuts-store';
import type { LayoutSettings } from './layout-settings-store';

// Combined layout configuration state
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
   settings: LayoutSettings;

   // View management actions
   createView: (view: Omit<LayoutView, 'id' | 'createdAt' | 'updatedAt'>) => LayoutView;
   updateView: (id: string, updates: Partial<LayoutView>) => void;
   deleteView: (id: string) => void;
   setCurrentView: (viewId: string) => void;
   setDefaultView: (viewId: string) => void;

   // Section management actions
   toggleSection: (section: LayoutSection) => void;
   setSectionWidth: (section: LayoutSection, width: number) => void;
   setSectionVisibility: (section: LayoutSection, visible: boolean) => void;

   // Tab management actions
   addTabToSection: (section: LayoutSection, tab: Omit<ScreenTab, 'id'>) => ScreenTab;
   removeTabFromSection: (section: LayoutSection, tabId: string) => void;
   setActiveTab: (section: LayoutSection, tabId: string) => void;
   updateTab: (section: LayoutSection, tabId: string, updates: Partial<ScreenTab>) => void;

   // Keyboard shortcuts actions
   addShortcut: (shortcut: Omit<KeyboardShortcut, 'id'>) => KeyboardShortcut;
   updateShortcut: (id: string, updates: Partial<KeyboardShortcut>) => void;
   removeShortcut: (id: string) => void;

   // Settings actions
   updateSettings: (settings: Partial<LayoutSettings>) => void;
}

// Create the combined store that orchestrates all focused stores
export const useLayoutConfigStore = create<LayoutConfigState>()(() => ({
   // Initial state - these will be populated by the individual stores
   currentViewId: undefined,
   views: [],
   shortcuts: [],
   sectionVisibility: { A: true, B: true, C: false },
   sectionWidths: { A: 244, B: 0, C: 320 },
   settings: {
      enableAnimations: true,
      autoSave: true,
      allowKeyboardShortcuts: true,
      allowAIControl: true,
   },

   // View management - delegate to views store
   createView: (viewData) => {
      const viewsStore = useLayoutViewsStore.getState();
      return viewsStore.createView(viewData);
   },

   updateView: (id, updates) => {
      const viewsStore = useLayoutViewsStore.getState();
      viewsStore.updateView(id, updates);
   },

   deleteView: (id) => {
      const viewsStore = useLayoutViewsStore.getState();
      viewsStore.deleteView(id);
   },

   setCurrentView: (viewId) => {
      const viewsStore = useLayoutViewsStore.getState();
      viewsStore.setCurrentView(viewId);
   },

   setDefaultView: (viewId) => {
      const viewsStore = useLayoutViewsStore.getState();
      viewsStore.setDefaultView(viewId);
   },

   // Section management - delegate to sections store
   toggleSection: (section) => {
      const sectionsStore = useLayoutSectionsStore.getState();
      sectionsStore.toggleSection(section);
   },

   setSectionWidth: (section, width) => {
      const sectionsStore = useLayoutSectionsStore.getState();
      sectionsStore.setSectionWidth(section, width);
   },

   setSectionVisibility: (section, visible) => {
      const sectionsStore = useLayoutSectionsStore.getState();
      sectionsStore.setSectionVisibility(section, visible);
   },

   // Tab management - delegate to sections store
   addTabToSection: (section, tabData) => {
      const sectionsStore = useLayoutSectionsStore.getState();
      return sectionsStore.addTabToSection(section, tabData);
   },

   removeTabFromSection: (section, tabId) => {
      const sectionsStore = useLayoutSectionsStore.getState();
      sectionsStore.removeTabFromSection(section, tabId);
   },

   setActiveTab: (section, tabId) => {
      const sectionsStore = useLayoutSectionsStore.getState();
      sectionsStore.setActiveTab(section, tabId);
   },

   updateTab: (section, tabId, updates) => {
      const sectionsStore = useLayoutSectionsStore.getState();
      sectionsStore.updateTab(section, tabId, updates);
   },

   // Keyboard shortcuts - delegate to shortcuts store
   addShortcut: (shortcutData) => {
      const shortcutsStore = useLayoutShortcutsStore.getState();
      return shortcutsStore.addShortcut(shortcutData);
   },

   updateShortcut: (id, updates) => {
      const shortcutsStore = useLayoutShortcutsStore.getState();
      shortcutsStore.updateShortcut(id, updates);
   },

   removeShortcut: (id) => {
      const shortcutsStore = useLayoutShortcutsStore.getState();
      shortcutsStore.removeShortcut(id);
   },

   // Settings - delegate to settings store
   updateSettings: (newSettings) => {
      const settingsStore = useLayoutSettingsStore.getState();
      settingsStore.updateSettings(newSettings);
   },
}));

// Subscribe to individual stores to keep the combined store in sync
useLayoutViewsStore.subscribe((state) => {
   useLayoutConfigStore.setState({
      currentViewId: state.currentViewId,
      views: state.views,
   });
});

useLayoutSectionsStore.subscribe((state) => {
   useLayoutConfigStore.setState({
      sectionVisibility: state.sectionVisibility,
      sectionWidths: state.sectionWidths,
   });
});

useLayoutShortcutsStore.subscribe((state) => {
   useLayoutConfigStore.setState({
      shortcuts: state.shortcuts,
   });
});

useLayoutSettingsStore.subscribe((state) => {
   useLayoutConfigStore.setState({
      settings: state.settings,
   });
});
