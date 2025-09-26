'use client';

import React, { createContext, useContext, useEffect, useCallback, useMemo } from 'react';
import {
   useLayoutConfigStore,
   LayoutSection,
   LayoutView,
   ScreenTab,
   LayoutSettings,
} from '@/src/state';
import {
   useResizableSidebar,
   type WorkspaceZoneAPanelAState,
} from './workspace-zone-a-panels/workspace-zone-a-panels-provider';
import {
   useLayoutCompatibility,
   useVercelPerformance,
} from '@/src/lib/hooks/use-vercel-compatibility';

// Extended layout context that combines existing sidebar state with new layout config
interface LayoutConfigContextType {
   // Current view and view management
   currentView: LayoutView | null;
   switchToView: (viewId: string) => void;
   createNewView: (name: string, description?: string) => string;
   updateCurrentView: (updates: Partial<LayoutView>) => void;

   // Section management
   sectionVisibility: Record<LayoutSection, boolean>;
   toggleSection: (section: LayoutSection) => void;
   setSectionVisible: (section: LayoutSection, visible: boolean) => void;
   leftState: WorkspaceZoneAPanelAState;
   setLeftState: (state: WorkspaceZoneAPanelAState) => void;

   // Tab management within sections
   getActiveTab: (section: LayoutSection) => ScreenTab | null;
   setActiveTab: (section: LayoutSection, tabId: string) => void;
   addTabToSection: (section: LayoutSection, tab: Omit<ScreenTab, 'id'>) => ScreenTab | null;
   removeTabFromSection: (section: LayoutSection, tabId: string) => void;

   // Settings
   layoutSettings: {
      enableAnimations: boolean;
      autoSave: boolean;
      allowKeyboardShortcuts: boolean;
      allowAIControl: boolean;
   };
   updateLayoutSettings: (settings: Partial<LayoutSettings>) => void;

   // Integration helpers
   isViewLoaded: boolean;
   isReady: boolean;

   // Vercel compatibility
   compatibility: {
      canUseResizablePanels: boolean;
      canPersistLayout: boolean;
      canUseDragAndDrop: boolean;
      canUseKeyboardShortcuts: boolean;
      canUseAnimations: boolean;
      shouldUseReducedMotion: boolean;
      compatibilityLevel: 'full' | 'basic' | 'none';
      isReady: boolean;
   };

   // Performance metrics
   performance: {
      layoutLoadTime: number;
      hydrationComplete: boolean;
      firstContentfulPaint: number;
   };
}

const LayoutConfigContext = createContext<LayoutConfigContextType | null>(null);

export function useLayoutConfig() {
   const context = useContext(LayoutConfigContext);
   if (!context) {
      throw new Error('useLayoutConfig must be used within a LayoutConfigProvider');
   }
   return context;
}

// Provider component that integrates layout config with existing sidebar system
export function LayoutConfigProvider({ children }: { children: React.ReactNode }) {
   const {
      currentViewId,
      views,
      sectionVisibility,
      settings,
      createView,
      updateView,
      setCurrentView,
      setSectionVisibility,
      toggleSection,
      updateSettings,
   } = useLayoutConfigStore();

   const {
      leftSidebar,
      rightSidebar,
      setLeftSidebarOpen,
      setRightSidebarOpen,
      leftState,
      setLeftState: setLeftRailState,
      isHydrated: sidebarHydrated,
   } = useResizableSidebar();

   const layoutCompatibility = useLayoutCompatibility();
   const compatibility = useMemo<LayoutConfigContextType['compatibility']>(
      () => ({
         canUseResizablePanels: layoutCompatibility.canUseResizablePanels,
         canPersistLayout: layoutCompatibility.canPersistLayout,
         canUseDragAndDrop: layoutCompatibility.canUseDragAndDrop,
         canUseKeyboardShortcuts: layoutCompatibility.canUseKeyboardShortcuts,
         canUseAnimations: layoutCompatibility.canUseAnimations,
         shouldUseReducedMotion: layoutCompatibility.shouldUseReducedMotion,
         compatibilityLevel: layoutCompatibility.compatibilityLevel,
         isReady: layoutCompatibility.isReady,
      }),
      [
         layoutCompatibility.canUseResizablePanels,
         layoutCompatibility.canPersistLayout,
         layoutCompatibility.canUseDragAndDrop,
         layoutCompatibility.canUseKeyboardShortcuts,
         layoutCompatibility.canUseAnimations,
         layoutCompatibility.shouldUseReducedMotion,
         layoutCompatibility.compatibilityLevel,
         layoutCompatibility.isReady,
      ]
   );
   const performance = useVercelPerformance();

   // Memoized current view
   const currentView = useMemo(() => {
      if (!currentViewId) return null;
      return views.find((view) => view.id === currentViewId) || null;
   }, [currentViewId, views]);

   // Track if we're fully hydrated and ready
   const [isHydrated, setIsHydrated] = React.useState(false);
   const [isViewLoaded, setIsViewLoaded] = React.useState(false);

   // Hydration effect - ensure everything is loaded before enabling features
   useEffect(() => {
      // Small delay to ensure all stores are hydrated
      const timer = setTimeout(() => {
         setIsHydrated(true);
         setIsViewLoaded(true);
      }, 100);

      return () => clearTimeout(timer);
   }, []);

   // Sync section visibility with sidebar states
   useEffect(() => {
      if (!isHydrated) return;

      // Sync left sidebar (Section A)
      if (sectionVisibility.A !== leftSidebar.isOpen) {
         setLeftSidebarOpen(sectionVisibility.A);
      }

      // Sync right sidebar (Section C)
      if (sectionVisibility.C !== rightSidebar.isOpen) {
         setRightSidebarOpen(sectionVisibility.C);
      }
   }, [
      sectionVisibility,
      leftSidebar.isOpen,
      rightSidebar.isOpen,
      isHydrated,
      setLeftSidebarOpen,
      setRightSidebarOpen,
   ]);

   // Sync width changes from sidebar system back to layout config
   useEffect(() => {
      if (!isHydrated) return;

      // This would sync width changes back to the layout config store
      // For now, we'll keep the existing sidebar system as the source of truth
      // and sync layout config to match it
   }, [leftSidebar.width, rightSidebar.width, isHydrated]);

   // View switching function
   const switchToView = useCallback(
      (viewId: string) => {
         if (!isHydrated) return;

         const view = views.find((v) => v.id === viewId);
         if (!view) return;

         setCurrentView(viewId);

         // Apply section visibility from the view
         if (view.sections.A.isCollapsed !== undefined) {
            setSectionVisibility('A', !view.sections.A.isCollapsed);
         }
         if (view.sections.C.isCollapsed !== undefined) {
            setSectionVisibility('C', !view.sections.C.isCollapsed);
         }
      },
      [views, setCurrentView, setSectionVisibility, isHydrated]
   );

   // Create new view function
   const createNewView = useCallback(
      (name: string, description?: string) => {
         if (!isHydrated) return '';

         const newView = createView({
            name,
            description,
            sections: currentView?.sections || {
               A: { section: 'A', tabs: [], isCollapsed: false },
               B: { section: 'B', tabs: [], isCollapsed: false },
               C: { section: 'C', tabs: [], isCollapsed: true },
            },
         });

         // Automatically switch to the new view
         switchToView(newView.id);

         return newView.id;
      },
      [createView, currentView, switchToView, isHydrated]
   );

   // Update current view function
   const updateCurrentView = useCallback(
      (updates: Partial<LayoutView>) => {
         if (!isHydrated || !currentViewId) return;

         updateView(currentViewId, updates);
      },
      [currentViewId, updateView, isHydrated]
   );

   // Enhanced toggle section function
   const enhancedToggleSection = useCallback(
      (section: LayoutSection) => {
         if (!isHydrated) return;

         toggleSection(section);

         // Also update the sidebar system
         if (section === 'A') {
            setLeftSidebarOpen(!leftSidebar.isOpen);
         } else if (section === 'C') {
            setRightSidebarOpen(!rightSidebar.isOpen);
         }
      },
      [
         toggleSection,
         setLeftSidebarOpen,
         setRightSidebarOpen,
         leftSidebar.isOpen,
         rightSidebar.isOpen,
         isHydrated,
      ]
   );

   // Enhanced set section visibility function
   const enhancedSetSectionVisible = useCallback(
      (section: LayoutSection, visible: boolean) => {
         if (!isHydrated) return;

         setSectionVisibility(section, visible);

         // Also update the sidebar system
         if (section === 'A') {
            setLeftSidebarOpen(visible);
         } else if (section === 'C') {
            setRightSidebarOpen(visible);
         }
      },
      [setSectionVisibility, setLeftSidebarOpen, setRightSidebarOpen, isHydrated]
   );

   // Tab management functions (placeholder implementations)
   const getActiveTab = useCallback(
      (section: LayoutSection) => {
         if (!currentView?.sections[section]) return null;
         const activeTabId = currentView.sections[section].activeTabId;
         return currentView.sections[section].tabs.find((tab) => tab.id === activeTabId) || null;
      },
      [currentView]
   );

   const setActiveTab = useCallback(
      (section: LayoutSection, tabId: string) => {
         if (!isHydrated || !currentViewId || !currentView) return;

         const view = currentView;

         updateView(currentViewId, {
            sections: {
               ...view.sections,
               [section]: {
                  ...view.sections[section],
                  activeTabId: tabId,
               },
            },
         });
      },
      [currentViewId, currentView, updateView, isHydrated]
   );

   const addTabToSection = useCallback(
      (section: LayoutSection, tab: Omit<ScreenTab, 'id'>) => {
         if (!isHydrated || !currentViewId) return null;

         // This would add a tab to the section's tabs array
         // Implementation depends on how tabs are stored
         console.log(`Adding tab to section ${section}:`, tab);
         return null; // Placeholder return
      },
      [currentViewId, isHydrated]
   );

   const removeTabFromSection = useCallback(
      (section: LayoutSection, tabId: string) => {
         if (!isHydrated || !currentViewId) return;

         // This would remove a tab from the section's tabs array
         console.log(`Removing tab ${tabId} from section ${section}`);
      },
      [currentViewId, isHydrated]
   );

   const setLeftSidebarState = useCallback(
      (state: WorkspaceZoneAPanelAState) => {
         if (!isHydrated) return;

         setLeftRailState(state);
      },
      [setLeftRailState, isHydrated]
   );

   // Update layout settings function
   const updateLayoutSettings = useCallback(
      (newSettings: Partial<LayoutSettings>) => {
         if (!isHydrated) return;

         updateSettings(newSettings);
      },
      [updateSettings, isHydrated]
   );

   // Context value
   const contextValue = useMemo(
      () => ({
         currentView,
         switchToView,
         createNewView,
         updateCurrentView,
         sectionVisibility,
         toggleSection: enhancedToggleSection,
         setSectionVisible: enhancedSetSectionVisible,
         leftState,
         setLeftState: setLeftSidebarState,
         getActiveTab,
         setActiveTab,
         addTabToSection,
         removeTabFromSection,
         layoutSettings: settings,
         updateLayoutSettings,
         isViewLoaded,
         isReady: isHydrated && sidebarHydrated,
         compatibility,
         performance,
      }),
      [
         currentView,
         switchToView,
         createNewView,
         updateCurrentView,
         sectionVisibility,
         enhancedToggleSection,
         enhancedSetSectionVisible,
         leftState,
         setLeftSidebarState,
         getActiveTab,
         setActiveTab,
         addTabToSection,
         removeTabFromSection,
         settings,
         updateLayoutSettings,
         isViewLoaded,
         isHydrated,
         sidebarHydrated,
         compatibility,
         performance,
      ]
   );

   return (
      <LayoutConfigContext.Provider value={contextValue}>{children}</LayoutConfigContext.Provider>
   );
}

// Higher-order component for components that need layout config
export function withLayoutConfig<P extends object>(Component: React.ComponentType<P>) {
   return function WithLayoutConfigComponent(props: P) {
      const layoutConfig = useLayoutConfig();

      return <Component {...props} layoutConfig={layoutConfig} />;
   };
}

// Hook for checking if layout system is ready (useful for conditional rendering)
export function useLayoutReady() {
   const { isReady } = useLayoutConfig();
   return isReady;
}
