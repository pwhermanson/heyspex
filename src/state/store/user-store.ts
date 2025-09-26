import { create } from 'zustand';
import { User } from '@/src/tests/test-data/users';

interface UserState {
   currentUser: User | null;
   setCurrentUser: (user: User) => void;

   // Workspace-related user state
   availableWorkspaces: string[]; // Array of workspace IDs the user has access to
   setAvailableWorkspaces: (workspaceIds: string[]) => void;
   addWorkspaceAccess: (workspaceId: string) => void;
   removeWorkspaceAccess: (workspaceId: string) => void;
}

export const useUserStore = create<UserState>((set) => ({
   currentUser: null,
   setCurrentUser: (user) => set({ currentUser: user }),

   // Workspace-related user state
   availableWorkspaces: [],
   setAvailableWorkspaces: (workspaceIds) => set({ availableWorkspaces: workspaceIds }),
   addWorkspaceAccess: (workspaceId) =>
      set((state) => ({
         availableWorkspaces: state.availableWorkspaces.includes(workspaceId)
            ? state.availableWorkspaces
            : [...state.availableWorkspaces, workspaceId],
      })),
   removeWorkspaceAccess: (workspaceId) =>
      set((state) => ({
         availableWorkspaces: state.availableWorkspaces.filter((id) => id !== workspaceId),
      })),
}));
