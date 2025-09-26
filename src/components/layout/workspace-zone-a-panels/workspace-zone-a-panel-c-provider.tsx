'use client';

import * as React from 'react';
import { createContext, useContext, useState, useCallback } from 'react';

type WorkspaceZoneAPanelCContext = {
   isOpen: boolean;
   toggleSidebar: () => void;
   setOpen: (open: boolean) => void;
};

const WorkspaceZoneAPanelCContext = createContext<WorkspaceZoneAPanelCContext | null>(null);

export function useRightSidebar() {
   const context = useContext(WorkspaceZoneAPanelCContext);
   if (!context) {
      throw new Error('useRightSidebar must be used within a WorkspaceZoneAPanelCProvider');
   }
   return context;
}

export function WorkspaceZoneAPanelCProvider({ children }: { children: React.ReactNode }) {
   const [isOpen, setIsOpen] = useState(false);

   const toggleSidebar = useCallback(() => {
      setIsOpen((prev) => !prev);
   }, []);

   const setOpen = useCallback((open: boolean) => {
      setIsOpen(open);
   }, []);

   const contextValue = React.useMemo(
      () => ({
         isOpen,
         toggleSidebar,
         setOpen,
      }),
      [isOpen, toggleSidebar, setOpen]
   );

   return (
      <WorkspaceZoneAPanelCContext.Provider value={contextValue}>
         {children}
      </WorkspaceZoneAPanelCContext.Provider>
   );
}
