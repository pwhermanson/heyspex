'use client';

import { create, type StateCreator } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createDefaultLayoutView, createPredefinedViews } from '@/lib/lib/layout-utils';

// Types for layout sections as defined in the feature requirements
export type LayoutSection = 'A' | 'B' | 'C'; // Left sidebar, main content, right sidebar

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
   config?: Record<string, unknown>; // Screen-specific configuration
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

// Layout views state
export interface LayoutViewsState {
   // Current active layout
   currentViewId?: string;

   // All saved views
   views: LayoutView[];

   // Actions
   createView: (view: Omit<LayoutView, 'id' | 'createdAt' | 'updatedAt'>) => LayoutView;
   updateView: (id: string, updates: Partial<LayoutView>) => void;
   deleteView: (id: string) => void;
   setCurrentView: (viewId: string) => void;
   setDefaultView: (viewId: string) => void;
}

// Helper function to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

// Helper function to initialize default data
function initializeDefaultViews() {
   const defaultView = createDefaultLayoutView();
   const predefinedViews = createPredefinedViews();

   return [defaultView, ...predefinedViews].map((view) => ({
      ...view,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
   }));
}

// Create the store with persistence
export const useLayoutViewsStore = create<LayoutViewsState>()(
   persist<LayoutViewsState>(
      (set) => {
         // Initialize with default data
         const defaultViews = initializeDefaultViews();

         return {
            // Initial state
            views: defaultViews,
            currentViewId: defaultViews[0]?.id, // Set first view as current

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
                     view.id === id ? { ...view, ...updates, updatedAt: new Date() } : view
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
                  views: state.views.map((view) => ({
                     ...view,
                     isDefault: view.id === viewId,
                  })),
               }));
            },
         };
      },
      {
         name: 'heyspex-layout-views',
         storage: createJSONStorage(() => localStorage),

         // Only persist views and current view
         partialize: (state) =>
            ({
               views: state.views,
               currentViewId: state.currentViewId,
            }) as LayoutViewsState,

         // Handle hydration safely for SSR compatibility
         onRehydrateStorage: () => (state) => {
            if (state) {
               // Ensure dates are properly deserialized
               state.views = state.views.map((view) => ({
                  ...view,
                  createdAt: new Date(view.createdAt),
                  updatedAt: new Date(view.updatedAt),
               }));
            }
         },
      }
   ) as StateCreator<LayoutViewsState, [], []>
);
