import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Workspace, CreateWorkspaceRequest, UpdateWorkspaceRequest } from '@/src/types/workspace';

interface WorkspaceState {
   // Current workspace
   currentWorkspace: Workspace | null;
   setCurrentWorkspace: (workspace: Workspace | null) => void;

   // Workspace list
   workspaces: Workspace[];
   setWorkspaces: (workspaces: Workspace[]) => void;
   addWorkspace: (workspace: Workspace) => void;
   updateWorkspace: (id: string, updates: Partial<Workspace>) => void;
   removeWorkspace: (id: string) => void;

   // Workspace management actions
   createWorkspace: (request: CreateWorkspaceRequest) => Promise<Workspace>;
   switchWorkspace: (workspaceId: string) => Promise<void>;
   deleteWorkspace: (workspaceId: string) => Promise<void>;

   // Loading states
   isLoading: boolean;
   setIsLoading: (loading: boolean) => void;

   // Error handling
   error: string | null;
   setError: (error: string | null) => void;
}

// Default workspace layout configuration
const getDefaultLayoutConfig = (): Workspace['layoutConfig'] => ({
   workspaceZoneA: {
      isVisible: false, // Start with empty state
      leftPanel: {
         id: 'left-panel',
         isVisible: true,
         width: 280,
         settings: {},
      },
      centerPanel: {
         id: 'center-panel',
         isVisible: true,
         settings: {},
      },
      rightPanel: {
         id: 'right-panel',
         isVisible: true,
         width: 320,
         settings: {},
      },
   },
   workspaceZoneB: {
      isVisible: false,
      mode: 'single',
      panels: [
         {
            id: 'secondary-panel-1',
            isVisible: true,
            settings: {},
         },
      ],
   },
   global: {
      topBarVisible: false, // Start hidden for empty state
      bottomBarVisible: false,
      controlBarPosition: 'top',
   },
});

// Default workspace settings
const getDefaultSettings = (): Workspace['settings'] => ({
   theme: 'system',
   notifications: {
      enabled: true,
      email: true,
      push: false,
   },
   privacy: {
      isPublic: false,
      allowInvites: true,
   },
});

export const useWorkspaceStore = create<WorkspaceState>()(
   persist(
      (set, get) => ({
         // Current workspace
         currentWorkspace: null,
         setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),

         // Workspace list
         workspaces: [],
         setWorkspaces: (workspaces) => set({ workspaces }),
         addWorkspace: (workspace) =>
            set((state) => ({
               workspaces: [...state.workspaces, workspace],
            })),
         updateWorkspace: (id, updates) =>
            set((state) => ({
               workspaces: state.workspaces.map((w) => (w.id === id ? { ...w, ...updates } : w)),
               currentWorkspace:
                  state.currentWorkspace?.id === id
                     ? { ...state.currentWorkspace, ...updates }
                     : state.currentWorkspace,
            })),
         removeWorkspace: (id) =>
            set((state) => ({
               workspaces: state.workspaces.filter((w) => w.id !== id),
               currentWorkspace: state.currentWorkspace?.id === id ? null : state.currentWorkspace,
            })),

         // Workspace management actions
         createWorkspace: async (request) => {
            set({ isLoading: true, error: null });

            try {
               // Generate unique ID (in real app, this would come from database)
               const id = `workspace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
               const now = new Date().toISOString();

               const newWorkspace: Workspace = {
                  id,
                  name: request.name,
                  description: request.description,
                  ownerId: 'demo', // TODO: Get from user store
                  createdAt: now,
                  updatedAt: now,
                  isActive: true,
                  settings: { ...getDefaultSettings(), ...request.settings },
                  layoutConfig: { ...getDefaultLayoutConfig(), ...request.layoutConfig },
               };

               // Add to workspaces list
               get().addWorkspace(newWorkspace);

               // Set as current workspace
               get().setCurrentWorkspace(newWorkspace);

               set({ isLoading: false });
               return newWorkspace;
            } catch (error) {
               set({
                  isLoading: false,
                  error: error instanceof Error ? error.message : 'Failed to create workspace',
               });
               throw error;
            }
         },

         switchWorkspace: async (workspaceId) => {
            set({ isLoading: true, error: null });

            try {
               const workspace = get().workspaces.find((w) => w.id === workspaceId);
               if (!workspace) {
                  throw new Error('Workspace not found');
               }

               // Update all workspaces to set isActive correctly
               set((state) => ({
                  workspaces: state.workspaces.map((w) => ({
                     ...w,
                     isActive: w.id === workspaceId,
                  })),
                  currentWorkspace: workspace,
               }));

               set({ isLoading: false });
            } catch (error) {
               set({
                  isLoading: false,
                  error: error instanceof Error ? error.message : 'Failed to switch workspace',
               });
               throw error;
            }
         },

         deleteWorkspace: async (workspaceId) => {
            set({ isLoading: true, error: null });

            try {
               // Don't allow deleting the last workspace
               if (get().workspaces.length <= 1) {
                  throw new Error('Cannot delete the last workspace');
               }

               // If deleting current workspace, switch to another one
               if (get().currentWorkspace?.id === workspaceId) {
                  const remainingWorkspaces = get().workspaces.filter((w) => w.id !== workspaceId);
                  if (remainingWorkspaces.length > 0) {
                     await get().switchWorkspace(remainingWorkspaces[0].id);
                  }
               }

               get().removeWorkspace(workspaceId);
               set({ isLoading: false });
            } catch (error) {
               set({
                  isLoading: false,
                  error: error instanceof Error ? error.message : 'Failed to delete workspace',
               });
               throw error;
            }
         },

         // Loading states
         isLoading: false,
         setIsLoading: (loading) => set({ isLoading: loading }),

         // Error handling
         error: null,
         setError: (error) => set({ error }),
      }),
      {
         name: 'workspace-storage',
         // Only persist essential data, not loading states
         partialize: (state) => ({
            currentWorkspace: state.currentWorkspace,
            workspaces: state.workspaces,
         }),
      }
   )
);
