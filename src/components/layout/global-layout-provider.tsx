'use client';

import * as React from 'react';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useFeatureFlag } from '@/src/lib/hooks/use-feature-flag';
import { useStateMachine } from '@/src/lib/state-machines/zone-state-machine';

// Global UI state types
export type WorkspaceZoneAMode = 'normal' | 'fullscreen' | 'hidden';

export type GlobalUIState = {
   isHydrated: boolean;
   isControlBarVisible: boolean;
   centerBottomSplit: number;
   viewportWidth: number;
   workspaceZoneAMode: WorkspaceZoneAMode;
};

// Global layout context type
type GlobalLayoutContext = {
   // Global UI state
   uiState: GlobalUIState;
   setUIState: (state: GlobalUIState | ((prev: GlobalUIState) => GlobalUIState)) => void;

   // UI controls
   centerBottomSplit: number;
   setCenterBottomSplit: (height: number) => void;
   isMainFullscreen: boolean;
   setMainFullscreen: (fullscreen: boolean) => void;
   isWorkspaceZoneAVisible: boolean;
   setWorkspaceZoneAVisible: (visible: boolean) => void;
   isControlBarVisible: boolean;
   isHydrated: boolean;
   setControlBarVisible: (visible: boolean) => void;
   toggleControlBar: () => void;

   // Workspace Zone A mode controls
   workspaceZoneAMode: WorkspaceZoneAMode;
   setWorkspaceZoneAMode: (mode: WorkspaceZoneAMode) => void;
   cycleWorkspaceZoneAMode: () => void;
};

const GlobalLayoutContext = createContext<GlobalLayoutContext | null>(null);

// Constants
const FALLBACK_VIEWPORT_WIDTH = 1200;

export function useGlobalLayout() {
   const context = useContext(GlobalLayoutContext);
   if (!context) {
      throw new Error('useGlobalLayout must be used within a GlobalLayoutProvider');
   }
   return context;
}

export function GlobalLayoutProvider({ children }: { children: React.ReactNode }) {
   const [uiState, setUIState] = useState<GlobalUIState>({
      isHydrated: false,
      isControlBarVisible: false,
      centerBottomSplit: 0,
      viewportWidth: typeof window !== 'undefined' ? window.innerWidth : FALLBACK_VIEWPORT_WIDTH,
      workspaceZoneAMode: 'hidden', // Start hidden to show App Shell
   });

   const enableBottomSplit = useFeatureFlag('enableBottomSplit');
   // Keep latest values in refs for a stable keydown listener
   const enableBottomSplitRef = React.useRef(enableBottomSplit);
   useEffect(() => {
      enableBottomSplitRef.current = enableBottomSplit;
   }, [enableBottomSplit]);

   // State machine for elegant 3-way toggle management
   const { transition: stateMachineTransition, setState: setStateMachineState } = useStateMachine({
      states: ['normal', 'fullscreen', 'hidden'],
      initialState: 'hidden', // Match the initial UI state
      transitions: {
         normal: 'fullscreen',
         fullscreen: 'hidden',
         hidden: 'normal',
      },
   });

   // Hydration effect - load saved state after client-side hydration
   useEffect(() => {
      setUIState((prev) => ({ ...prev, isHydrated: true }));

      try {
         // Load workspace zone A mode - only load saved preferences if they exist
         const savedWorkspaceZoneAMode = localStorage.getItem('ui:workspaceZoneAMode');
         const workspaceZoneAMode =
            savedWorkspaceZoneAMode === 'normal' ||
            savedWorkspaceZoneAMode === 'fullscreen' ||
            savedWorkspaceZoneAMode === 'hidden'
               ? (savedWorkspaceZoneAMode as WorkspaceZoneAMode)
               : 'hidden'; // Default to hidden to show App Shell

         console.log('🎨 Loading workspace zone A mode from localStorage:', {
            savedWorkspaceZoneAMode,
            workspaceZoneAMode,
         });

         // Load center-bottom split state
         const savedCenterBottomSplit = localStorage.getItem('ui:centerBottomSplit');
         let centerBottomSplit = 0;
         if (savedCenterBottomSplit !== null) {
            const splitHeight = parseInt(savedCenterBottomSplit, 10);
            if (!isNaN(splitHeight) && splitHeight >= 0) {
               const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
               const maxHeight = Math.max(100, Math.round(viewportHeight * 0.5));
               const validHeight = Math.min(maxHeight, Math.max(0, splitHeight));
               centerBottomSplit = validHeight;
            }
         }

         // Load fullscreen state
         const savedFullscreen = localStorage.getItem('ui:mainFullscreen');
         const isMainFullscreen = savedFullscreen === 'true';

         // Load control bar visibility
         const savedControlBarVisible = localStorage.getItem('ui:controlBarVisible');
         const isControlBarVisible = savedControlBarVisible === 'true';

         setUIState((prev) => ({
            ...prev,
            centerBottomSplit,
            isMainFullscreen,
            workspaceZoneAMode, // Load the saved workspace zone A mode
            isControlBarVisible,
         }));
      } catch (error) {
         console.warn('Failed to load global layout state from localStorage:', error);
      }
   }, []);

   // Save center-bottom split state to localStorage
   useEffect(() => {
      if (!uiState.isHydrated) {
         return;
      }

      try {
         localStorage.setItem('ui:centerBottomSplit', uiState.centerBottomSplit.toString());
      } catch (error) {
         console.warn('Failed to save center-bottom split state to localStorage:', error);
      }
   }, [uiState.centerBottomSplit, uiState.isHydrated]);

   const setCenterBottomSplit = useCallback((height: number) => {
      setUIState((prev) => ({ ...prev, centerBottomSplit: height }));
   }, []);

   // Set specific Workspace Zone A mode
   const setWorkspaceZoneAMode = useCallback(
      (mode: WorkspaceZoneAMode) => {
         setUIState((prev) => ({ ...prev, workspaceZoneAMode: mode }));

         // Synchronize state machine with the new mode
         setStateMachineState(mode);

         // Save to localStorage
         try {
            localStorage.setItem('ui:workspaceZoneAMode', mode);
         } catch (error) {
            console.warn('Failed to save workspace zone A mode to localStorage:', error);
         }
      },
      [setStateMachineState]
   );

   // 3-way toggle for Workspace Zone A: normal -> fullscreen -> hidden -> normal
   // Now using elegant state machine pattern instead of manual switch statement
   const cycleWorkspaceZoneAMode = useCallback(() => {
      const nextMode = stateMachineTransition();

      console.log('🎨 Cycling workspace zone A mode (state machine):', {
         currentMode: uiState.workspaceZoneAMode,
         nextMode,
      });

      // Update UI state to match state machine
      setUIState((prev) => ({ ...prev, workspaceZoneAMode: nextMode }));

      // Save to localStorage
      try {
         localStorage.setItem('ui:workspaceZoneAMode', nextMode);
      } catch (error) {
         console.warn('Failed to save workspace zone A mode to localStorage:', error);
      }
   }, [stateMachineTransition, uiState.workspaceZoneAMode]);

   const setMainFullscreen = useCallback(
      (fullscreen: boolean) => {
         // Legacy function - now maps to new 3-way toggle system
         if (fullscreen) {
            setWorkspaceZoneAMode('fullscreen');
         } else {
            setWorkspaceZoneAMode('normal');
         }
      },
      [setWorkspaceZoneAMode]
   );

   const setWorkspaceZoneAVisible = useCallback(
      (visible: boolean) => {
         // Legacy function - now uses 3-way toggle
         setWorkspaceZoneAMode(visible ? 'normal' : 'hidden');
      },
      [setWorkspaceZoneAMode]
   );

   const setControlBarVisible = useCallback((visible: boolean) => {
      setUIState((prev) => ({ ...prev, isControlBarVisible: visible }));
      try {
         localStorage.setItem('ui:controlBarVisible', visible.toString());
      } catch (error) {
         console.warn('Failed to save control bar visibility to localStorage:', error);
      }
   }, []);

   const toggleControlBar = useCallback(() => {
      setUIState((prev) => ({ ...prev, isControlBarVisible: !prev.isControlBarVisible }));
   }, []);

   // Monitor viewport width changes
   useEffect(() => {
      if (!uiState.isHydrated) return;

      const handleWindowResize = () => {
         const newViewportWidth = window.innerWidth;
         setUIState((prev) => ({ ...prev, viewportWidth: newViewportWidth }));
      };

      window.addEventListener('resize', handleWindowResize);
      return () => window.removeEventListener('resize', handleWindowResize);
   }, [uiState.isHydrated]);

   // Keyboard shortcuts for global layout controls
   useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
         const isCtrlLike = event.ctrlKey || event.metaKey;
         const isTopDigit5 = event.shiftKey && event.code === 'Digit5';
         const isNumpad5 = event.code === 'Numpad5';
         const isTopDigit2 = event.shiftKey && event.code === 'Digit2';
         const isNumpad2 = event.code === 'Numpad2';
         const isTopDigit8 = event.shiftKey && event.code === 'Digit8';
         const isNumpad8 = event.code === 'Numpad8';

         // Ctrl+Shift+5 or Ctrl+Numpad5 - 3-way toggle: normal -> fullscreen -> hidden -> normal
         if (isCtrlLike && !event.altKey && (isTopDigit5 || isNumpad5)) {
            event.preventDefault();
            cycleWorkspaceZoneAMode();
         }

         // Ctrl+Shift+2 or Ctrl+Numpad2 - Toggle Zone B (handled by Zone B provider)
         if (isCtrlLike && !event.altKey && (isTopDigit2 || isNumpad2)) {
            event.preventDefault();
            // This will be handled by Zone B provider
         }

         // Ctrl+Shift+8 or Ctrl+Numpad8 - Toggle control bar
         if (isCtrlLike && !event.altKey && (isTopDigit8 || isNumpad8)) {
            event.preventDefault();
            toggleControlBar();
         }
      };

      document.addEventListener('keydown', handleKeyDown, { capture: true });
      return () =>
         document.removeEventListener('keydown', handleKeyDown, {
            capture: true,
         } as AddEventListenerOptions);
   }, [cycleWorkspaceZoneAMode, toggleControlBar]);

   // Listen for global layout command events from command palette
   useEffect(() => {
      const handlePanelCommand = (event: CustomEvent) => {
         const { action, visible, height, fullscreen } = event.detail;

         if (action === 'setCenterBottomSplit') {
            const splitHeight = height ?? 200;
            const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
            const maxHeight = Math.max(100, Math.round(viewportHeight * 0.5));
            const validHeight = Math.min(maxHeight, Math.max(0, splitHeight));
            setCenterBottomSplit(validHeight);
         }

         if (action === 'toggleCenterBottomSplit') {
            // Get current value from state instead of store
            if (uiState.centerBottomSplit > 0) {
               setCenterBottomSplit(0);
            } else {
               const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
               const defaultHeight = Math.max(200, Math.round(viewportHeight * 0.3));
               setCenterBottomSplit(defaultHeight);
            }
         }

         if (action === 'setMainFullscreen') {
            setMainFullscreen(fullscreen);
         }

         if (action === 'toggleMainFullscreen') {
            setMainFullscreen(!(uiState.workspaceZoneAMode === 'fullscreen'));
         }

         if (action === 'setWorkspaceZoneAVisible') {
            setWorkspaceZoneAVisible(visible);
         }

         if (action === 'toggleWorkspaceZoneA') {
            // Legacy action - now cycles through 3-way toggle
            cycleWorkspaceZoneAMode();
         }

         if (action === 'setControlBarVisible') {
            setControlBarVisible(visible);
         }

         if (action === 'toggleControlBar') {
            toggleControlBar();
         }

         if (action === 'setWorkspaceZoneAMode') {
            const mode = event.detail.mode;
            if (mode === 'normal' || mode === 'fullscreen' || mode === 'hidden') {
               setWorkspaceZoneAMode(mode);
            }
         }

         if (action === 'cycleWorkspaceZoneAMode') {
            cycleWorkspaceZoneAMode();
         }
      };

      window.addEventListener('panel-command', handlePanelCommand as EventListener);
      return () => window.removeEventListener('panel-command', handlePanelCommand as EventListener);
   }, [
      setCenterBottomSplit,
      setMainFullscreen,
      setWorkspaceZoneAVisible,
      setControlBarVisible,
      toggleControlBar,
      uiState.centerBottomSplit,
      uiState.workspaceZoneAMode,
      setWorkspaceZoneAMode,
      cycleWorkspaceZoneAMode,
   ]);

   const contextValue = React.useMemo(
      () => ({
         uiState,
         setUIState,
         centerBottomSplit: uiState.centerBottomSplit,
         setCenterBottomSplit,
         isDragging: false, // This will be managed by drag state provider
         setIsDragging: () => {}, // This will be managed by drag state provider
         isHydrated: uiState.isHydrated,
         isMainFullscreen: uiState.workspaceZoneAMode === 'fullscreen',
         setMainFullscreen,
         isWorkspaceZoneAVisible: uiState.workspaceZoneAMode !== 'hidden',
         setWorkspaceZoneAVisible,
         isControlBarVisible: uiState.isControlBarVisible,
         setControlBarVisible,
         toggleControlBar,
         workspaceZoneAMode: uiState.workspaceZoneAMode,
         cycleWorkspaceZoneAMode,
         setWorkspaceZoneAMode,
      }),
      [
         uiState,
         setUIState,
         setCenterBottomSplit,
         setMainFullscreen,
         setWorkspaceZoneAVisible,
         setControlBarVisible,
         toggleControlBar,
         cycleWorkspaceZoneAMode,
         setWorkspaceZoneAMode,
      ]
   );

   return (
      <GlobalLayoutContext.Provider value={contextValue}>{children}</GlobalLayoutContext.Provider>
   );
}
