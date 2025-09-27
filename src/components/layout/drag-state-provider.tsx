'use client';

import * as React from 'react';
import { createContext, useContext, useState, useCallback } from 'react';

// Drag state types
export type DragState = {
   isDragging: boolean;
   dragSide: 'left' | 'right' | null;
};

// Drag state context type
type DragStateContext = {
   // Drag state
   dragState: DragState;
   setDragState: (state: DragState | ((prev: DragState) => DragState)) => void;
   isDragging: boolean;
   setIsDragging: (dragging: boolean) => void;
   dragSide: 'left' | 'right' | null;
   setDragSide: (side: 'left' | 'right' | null) => void;
};

const DragStateContext = createContext<DragStateContext | null>(null);

export function useDragState() {
   const context = useContext(DragStateContext);
   if (!context) {
      throw new Error('useDragState must be used within a DragStateProvider');
   }
   return context;
}

export function DragStateProvider({ children }: { children: React.ReactNode }) {
   const [dragState, setDragState] = useState<DragState>({
      isDragging: false,
      dragSide: null,
   });

   const setIsDragging = useCallback((dragging: boolean) => {
      setDragState((prev) => ({ ...prev, isDragging: dragging }));
   }, []);

   const setDragSide = useCallback((side: 'left' | 'right' | null) => {
      setDragState((prev) => ({ ...prev, dragSide: side }));
   }, []);

   const contextValue = React.useMemo(
      () => ({
         dragState,
         setDragState,
         isDragging: dragState.isDragging,
         setIsDragging,
         dragSide: dragState.dragSide,
         setDragSide,
      }),
      [dragState, setDragState, setIsDragging, setDragSide]
   );

   return <DragStateContext.Provider value={contextValue}>{children}</DragStateContext.Provider>;
}
