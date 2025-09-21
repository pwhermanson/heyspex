'use client';

import * as React from 'react';
import { createContext, useContext, useState, useCallback } from 'react';

type RightSidebarContext = {
   isOpen: boolean;
   toggleSidebar: () => void;
   setOpen: (open: boolean) => void;
};

const RightSidebarContext = createContext<RightSidebarContext | null>(null);

export function useRightSidebar() {
   const context = useContext(RightSidebarContext);
   if (!context) {
      throw new Error('useRightSidebar must be used within a RightSidebarProvider');
   }
   return context;
}

export function RightSidebarProvider({ children }: { children: React.ReactNode }) {
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
      <RightSidebarContext.Provider value={contextValue}>{children}</RightSidebarContext.Provider>
   );
}
