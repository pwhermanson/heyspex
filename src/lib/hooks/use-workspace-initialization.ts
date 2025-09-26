import { useEffect } from 'react';
import { useWorkspaceStore } from '@/src/state/store/workspace-store';
import { useUserStore } from '@/src/state/store/user-store';
import { mockWorkspaces } from '@/src/tests/test-data/workspaces';

/**
 * Hook to initialize workspace data on app startup
 * This will be replaced with database queries in the future
 */
export function useWorkspaceInitialization() {
   const { workspaces, setWorkspaces, currentWorkspace, setCurrentWorkspace } = useWorkspaceStore();

   const { currentUser, availableWorkspaces, setAvailableWorkspaces } = useUserStore();

   useEffect(() => {
      // Only initialize once when workspaces are empty
      if (workspaces.length === 0 && currentUser) {
         // Set up mock workspaces for the current user
         const userWorkspaces = mockWorkspaces.filter(
            (workspace) => workspace.ownerId === currentUser.id
         );

         // Set workspaces in store
         setWorkspaces(userWorkspaces);

         // Set available workspaces for the user
         const workspaceIds = userWorkspaces.map((w) => w.id);
         setAvailableWorkspaces(workspaceIds);

         // Set the first workspace as current if none is set
         if (!currentWorkspace && userWorkspaces.length > 0) {
            const activeWorkspace = userWorkspaces.find((w) => w.isActive) || userWorkspaces[0];
            setCurrentWorkspace(activeWorkspace);
         }
      }
   }, [
      currentUser,
      workspaces.length,
      currentWorkspace,
      setWorkspaces,
      setCurrentWorkspace,
      availableWorkspaces,
      setAvailableWorkspaces,
   ]);

   return {
      isInitialized: workspaces.length > 0,
      workspaces,
      currentWorkspace,
   };
}
