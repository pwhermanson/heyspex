'use client';

import * as React from 'react';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useStateMachine } from '@/src/lib/state-machines/zone-state-machine';
import { useFeatureFlag } from '@/src/lib/hooks/use-feature-flag';
import { useLocalStoragePersistence } from '@/src/hooks/use-local-storage-persistence';

// Zone A specific types
export type WorkspaceZoneAPanelAState = 'open' | 'collapsed';

type WorkspaceZoneAPanelState = {
   isOpen: boolean;
   width: number;
   preferredWidth: number;
};

export type WorkspaceZoneAMode = 'normal' | 'fullscreen' | 'hidden';

// Zone A state structure - focused only on Zone A concerns
type WorkspaceZoneAState = {
   isVisible: boolean;
   leftPanel: WorkspaceZoneAPanelState;
   rightPanel: WorkspaceZoneAPanelState;
   leftState: WorkspaceZoneAPanelAState;
};

// Zone A context type - only Zone A state and functions
type WorkspaceZoneAContext = {
   // Zone A state
   workspaceZoneA: WorkspaceZoneAState;
   setWorkspaceZoneA: (
      state: WorkspaceZoneAState | ((prev: WorkspaceZoneAState) => WorkspaceZoneAState)
   ) => void;

   // Zone A controls
   toggleWorkspaceZoneA: () => void;
   setWorkspaceZoneAVisible: (visible: boolean) => void;
   setWorkspaceZoneAMode: (mode: WorkspaceZoneAMode) => void;
   cycleWorkspaceZoneAMode: () => void;

   // Individual panel controls
   leftPanel: WorkspaceZoneAPanelState;
   rightPanel: WorkspaceZoneAPanelState;
   leftState: WorkspaceZoneAPanelAState;
   setLeftState: (state: WorkspaceZoneAPanelAState) => void;
   toggleLeftPanel: () => void;
   setLeftPanelWidth: (width: number) => void;
   setLeftPanelOpen: (open: boolean) => void;
   toggleRightPanel: () => void;
   setWorkspaceZoneAPanelCWidth: (width: number) => void;
   setWorkspaceZoneAPanelCOpen: (open: boolean) => void;

   // Computed properties for backward compatibility
   isWorkspaceZoneAVisible: boolean;
   workspaceZoneAMode: WorkspaceZoneAMode;
};

const WorkspaceZoneAContext = createContext<WorkspaceZoneAContext | null>(null);

// Constants for Zone A
const MIN_WORKSPACE_ZONE_A_PANEL_WIDTH = 200;
const DEFAULT_LEFT_WIDTH = 244;
const DEFAULT_RIGHT_WIDTH = 320;

// Viewport breaking point constants
const RIGHT_PANEL_VIEWPORT_BREAKING_POINT = 0.2; // 20% of viewport width
const FALLBACK_VIEWPORT_WIDTH = 1200;

// Hook to use Zone A context
export function useWorkspaceZoneA() {
   const context = useContext(WorkspaceZoneAContext);
   if (!context) {
      throw new Error('useWorkspaceZoneA must be used within a WorkspaceZoneAProvider');
   }
   return context;
}

// Zone A Provider - focused only on Zone A state management
export function WorkspaceZoneAProvider({ children }: { children: React.ReactNode }) {
   // Zone A state - single responsibility
   const [workspaceZoneA, setWorkspaceZoneA] = useState<WorkspaceZoneAState>({
      isVisible: false, // Start hidden to show only app shell
      leftPanel: {
         isOpen: false, // Start closed
         width: DEFAULT_LEFT_WIDTH,
         preferredWidth: DEFAULT_LEFT_WIDTH,
      },
      rightPanel: {
         isOpen: false, // Start closed
         width: DEFAULT_RIGHT_WIDTH,
         preferredWidth: DEFAULT_RIGHT_WIDTH,
      },
      leftState: 'collapsed', // Start collapsed
   });

   // Zone A mode state - managed separately for 3-way toggle
   const [workspaceZoneAMode, setWorkspaceZoneAModeState] = useState<WorkspaceZoneAMode>('hidden');

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

   const enableLeftRail = useFeatureFlag('enableLeftRail');

   // LocalStorage persistence hook - extracted for Single Responsibility Principle
   const { saveToLocalStorage, loadFromLocalStorage, cleanup } = useLocalStoragePersistence();

   // Zone A specific functions - only Zone A logic
   const updateLeftRailState = useCallback((state: WorkspaceZoneAPanelAState) => {
      setWorkspaceZoneA((prev) => ({
         ...prev,
         leftState: prev.leftState === state ? prev.leftState : state,
      }));
   }, []);

   // Save Zone A panel state to localStorage with debouncing
   const savePanelStateToLocalStorage = useCallback(
      (side: 'left' | 'right', state: WorkspaceZoneAPanelState) => {
         const panelData = {
            isOpen: state.isOpen,
            width: state.width,
            preferredWidth: state.preferredWidth,
         };
         saveToLocalStorage(`sidebar-${side}-state`, panelData);
      },
      [saveToLocalStorage]
   );

   // Set specific Workspace Zone A mode
   const setWorkspaceZoneAMode = useCallback(
      (mode: WorkspaceZoneAMode) => {
         setWorkspaceZoneAModeState(mode);

         // Synchronize state machine with the new mode
         setStateMachineState(mode);

         // Save to localStorage
         saveToLocalStorage('ui:workspaceZoneAMode', mode);
      },
      [setStateMachineState, saveToLocalStorage]
   );

   // Cycle through 3-way toggle using state machine
   const cycleWorkspaceZoneAMode = useCallback(() => {
      const nextMode = stateMachineTransition();

      console.log('🎨 Cycling workspace zone A mode (state machine):', {
         currentMode: workspaceZoneAMode,
         nextMode,
      });

      // Update state to match state machine
      setWorkspaceZoneAModeState(nextMode);

      // Save to localStorage
      try {
         saveToLocalStorage('ui:workspaceZoneAMode', nextMode);
      } catch (error) {
         console.warn('Failed to save workspace zone A mode to localStorage:', error);
      }
   }, [stateMachineTransition, workspaceZoneAMode, saveToLocalStorage]);

   const setWorkspaceZoneAVisible = useCallback(
      (visible: boolean) => {
         // Legacy function - now uses 3-way toggle
         setWorkspaceZoneAMode(visible ? 'normal' : 'hidden');
      },
      [setWorkspaceZoneAMode]
   );

   const toggleWorkspaceZoneA = useCallback(() => {
      // Legacy function - now uses 3-way toggle
      cycleWorkspaceZoneAMode();
   }, [cycleWorkspaceZoneAMode]);

   // Left panel controls
   const toggleLeftPanel = useCallback(() => {
      if (enableLeftRail) {
         // When left rail is enabled, toggle between 'open' and 'collapsed' states
         setWorkspaceZoneA((prev) => ({
            ...prev,
            leftState: prev.leftState === 'open' ? 'collapsed' : 'open',
            leftPanel: {
               ...prev.leftPanel,
               isOpen: true, // Keep isOpen: true for proper width calculations
            },
         }));
      } else {
         // Legacy behavior: toggle isOpen state
         setWorkspaceZoneA((prev) => {
            const isOpening = !prev.leftPanel.isOpen;
            const width = isOpening ? prev.leftPanel.preferredWidth : prev.leftPanel.width;
            const preferredWidth = isOpening ? prev.leftPanel.preferredWidth : prev.leftPanel.width;

            const newLeftPanel = {
               ...prev.leftPanel,
               isOpen: isOpening,
               width,
               preferredWidth,
            };

            savePanelStateToLocalStorage('left', newLeftPanel);
            updateLeftRailState(isOpening ? 'open' : 'collapsed');

            return {
               ...prev,
               leftPanel: newLeftPanel,
               leftState: isOpening ? 'open' : 'collapsed',
            };
         });
      }
   }, [enableLeftRail, savePanelStateToLocalStorage, updateLeftRailState]);

   const setLeftPanelOpen = useCallback(
      (open: boolean) => {
         if (enableLeftRail) {
            // When left rail is enabled, set the leftState directly
            setWorkspaceZoneA((prev) => ({
               ...prev,
               leftState: open ? 'open' : 'collapsed',
               leftPanel: {
                  ...prev.leftPanel,
                  isOpen: true, // Keep isOpen: true for proper width calculations
               },
            }));
         } else {
            // Legacy behavior
            setWorkspaceZoneA((prev) => {
               const newLeftPanel = {
                  ...prev.leftPanel,
                  isOpen: open,
                  width: open ? prev.leftPanel.preferredWidth : prev.leftPanel.width,
                  preferredWidth: open ? prev.leftPanel.preferredWidth : prev.leftPanel.width,
               };
               savePanelStateToLocalStorage('left', newLeftPanel);
               updateLeftRailState(open ? 'open' : 'collapsed');
               return {
                  ...prev,
                  leftPanel: newLeftPanel,
                  leftState: open ? 'open' : 'collapsed',
               };
            });
         }
      },
      [enableLeftRail, savePanelStateToLocalStorage, updateLeftRailState]
   );

   const setLeftPanelWidth = useCallback(
      (width: number) => {
         const clampedWidth = Math.max(MIN_WORKSPACE_ZONE_A_PANEL_WIDTH, width);

         setWorkspaceZoneA((prev) => {
            if (clampedWidth !== prev.leftPanel.width && prev.leftPanel.isOpen) {
               const newLeftPanel = {
                  ...prev.leftPanel,
                  width: clampedWidth,
                  preferredWidth: clampedWidth,
               };
               savePanelStateToLocalStorage('left', newLeftPanel);
               return {
                  ...prev,
                  leftPanel: newLeftPanel,
               };
            }
            return prev;
         });
      },
      [savePanelStateToLocalStorage]
   );

   // Right panel controls
   const toggleRightPanel = useCallback(() => {
      setWorkspaceZoneA((prev) => {
         const newRightPanel = {
            ...prev.rightPanel,
            isOpen: !prev.rightPanel.isOpen,
            width: !prev.rightPanel.isOpen ? prev.rightPanel.preferredWidth : prev.rightPanel.width,
            preferredWidth: !prev.rightPanel.isOpen
               ? prev.rightPanel.preferredWidth
               : prev.rightPanel.width,
         };
         savePanelStateToLocalStorage('right', newRightPanel);
         return {
            ...prev,
            rightPanel: newRightPanel,
         };
      });
   }, [savePanelStateToLocalStorage]);

   const setWorkspaceZoneAPanelCOpen = useCallback(
      (open: boolean) => {
         setWorkspaceZoneA((prev) => {
            const newRightPanel = {
               ...prev.rightPanel,
               isOpen: open,
               width: open ? prev.rightPanel.preferredWidth : prev.rightPanel.width,
               preferredWidth: open ? prev.rightPanel.preferredWidth : prev.rightPanel.width,
            };
            savePanelStateToLocalStorage('right', newRightPanel);
            return {
               ...prev,
               rightPanel: newRightPanel,
            };
         });
      },
      [savePanelStateToLocalStorage]
   );

   const setWorkspaceZoneAPanelCWidth = useCallback(
      (width: number) => {
         const clampedWidth = Math.max(MIN_WORKSPACE_ZONE_A_PANEL_WIDTH, width);

         setWorkspaceZoneA((prev) => {
            if (clampedWidth !== prev.rightPanel.width && prev.rightPanel.isOpen) {
               const newRightPanel = {
                  ...prev.rightPanel,
                  width: clampedWidth,
                  preferredWidth: clampedWidth,
               };

               // Check if the new width should trigger auto-collapse
               const currentViewportWidth =
                  typeof window !== 'undefined' ? window.innerWidth : FALLBACK_VIEWPORT_WIDTH;
               const breakingPointWidth =
                  currentViewportWidth * RIGHT_PANEL_VIEWPORT_BREAKING_POINT;

               console.log('Width change:', {
                  newWidth: clampedWidth,
                  viewportWidth: currentViewportWidth,
                  breakingPointWidth,
                  shouldCollapse: clampedWidth <= breakingPointWidth,
               });

               if (clampedWidth <= breakingPointWidth) {
                  // Auto-collapse the panel when it reaches the breaking point
                  console.log('Auto-collapsing right panel due to width change');
                  const collapsedPanel = {
                     ...newRightPanel,
                     isOpen: false,
                  };
                  savePanelStateToLocalStorage('right', collapsedPanel);
                  return {
                     ...prev,
                     rightPanel: collapsedPanel,
                  };
               }

               savePanelStateToLocalStorage('right', newRightPanel);
               return {
                  ...prev,
                  rightPanel: newRightPanel,
               };
            }
            return prev;
         });
      },
      [savePanelStateToLocalStorage]
   );

   // Load Zone A state from localStorage on hydration
   useEffect(() => {
      try {
         // Load left sidebar state
         const defaultLeftPanel = {
            isOpen: true,
            width: DEFAULT_LEFT_WIDTH,
            preferredWidth: DEFAULT_LEFT_WIDTH,
         };

         const savedLeftPanel = loadFromLocalStorage('sidebar-left-state', defaultLeftPanel);

         const validWidth =
            !isNaN(savedLeftPanel.width) && savedLeftPanel.width >= MIN_WORKSPACE_ZONE_A_PANEL_WIDTH
               ? savedLeftPanel.width
               : DEFAULT_LEFT_WIDTH;
         const validPreferred =
            !isNaN(savedLeftPanel.preferredWidth) &&
            savedLeftPanel.preferredWidth >= MIN_WORKSPACE_ZONE_A_PANEL_WIDTH
               ? savedLeftPanel.preferredWidth
               : validWidth;

         const leftPanel = {
            isOpen: savedLeftPanel.isOpen ?? true,
            width: validWidth,
            preferredWidth: validPreferred,
         };

         const leftState = loadFromLocalStorage('ui:leftState', 'open');

         // Load right sidebar state
         const defaultRightPanel = {
            isOpen: true,
            width: DEFAULT_RIGHT_WIDTH,
            preferredWidth: DEFAULT_RIGHT_WIDTH,
         };

         const savedRightPanel = loadFromLocalStorage('sidebar-right-state', defaultRightPanel);

         const validRightWidth =
            !isNaN(savedRightPanel.width) &&
            savedRightPanel.width >= MIN_WORKSPACE_ZONE_A_PANEL_WIDTH
               ? savedRightPanel.width
               : DEFAULT_RIGHT_WIDTH;
         const validRightPreferred =
            !isNaN(savedRightPanel.preferredWidth) &&
            savedRightPanel.preferredWidth >= MIN_WORKSPACE_ZONE_A_PANEL_WIDTH
               ? savedRightPanel.preferredWidth
               : validRightWidth;

         const rightPanel = {
            isOpen: savedRightPanel.isOpen ?? true,
            width: validRightWidth,
            preferredWidth: validRightPreferred,
         };

         // Load workspace zone A mode
         const workspaceZoneAMode = loadFromLocalStorage('ui:workspaceZoneAMode', 'hidden');

         // Update Zone A state
         setWorkspaceZoneA((prev) => ({
            ...prev,
            leftPanel,
            rightPanel,
            leftState,
         }));

         // Update Zone A mode state
         setWorkspaceZoneAModeState(workspaceZoneAMode);

         // Synchronize state machine with loaded state
         setStateMachineState(workspaceZoneAMode);
      } catch (error) {
         console.warn('Failed to load Zone A state from localStorage:', error);
      }
   }, [loadFromLocalStorage, setStateMachineState]);

   // Save Zone A state to localStorage
   useEffect(() => {
      try {
         saveToLocalStorage('ui:leftState', workspaceZoneA.leftState);
      } catch (error) {
         console.warn('Failed to save left sidebar rail state to localStorage:', error);
      }
   }, [workspaceZoneA.leftState, saveToLocalStorage]);

   // Cleanup timeout on unmount
   useEffect(() => {
      return () => {
         cleanup();
      };
   }, [cleanup]);

   // Monitor viewport width changes and handle breaking point logic for Zone A panels
   useEffect(() => {
      const handleWindowResize = () => {
         // Check if right panel should be collapsed based on new viewport width
         const newViewportWidth = window.innerWidth;
         const breakingPointWidth = newViewportWidth * RIGHT_PANEL_VIEWPORT_BREAKING_POINT;
         console.log('Viewport resize:', {
            viewportWidth: newViewportWidth,
            rightPanelWidth: workspaceZoneA.rightPanel.width,
            breakingPointWidth,
            shouldCollapse:
               workspaceZoneA.rightPanel.isOpen &&
               workspaceZoneA.rightPanel.width <= breakingPointWidth,
         });
         if (
            workspaceZoneA.rightPanel.isOpen &&
            workspaceZoneA.rightPanel.width <= breakingPointWidth
         ) {
            // Auto-collapse the right panel when it reaches the breaking point
            console.log('Auto-collapsing right panel due to breaking point');
            setWorkspaceZoneA((prev) => ({
               ...prev,
               rightPanel: { ...prev.rightPanel, isOpen: false },
            }));
         }
      };

      window.addEventListener('resize', handleWindowResize);
      return () => window.removeEventListener('resize', handleWindowResize);
   }, [workspaceZoneA.rightPanel.isOpen, workspaceZoneA.rightPanel.width]);

   // Listen for Zone A panel command events from command palette
   useEffect(() => {
      const handlePanelCommand = (event: CustomEvent) => {
         const { action, open } = event.detail;

         if (action === 'setLeftPanelOpen') {
            setLeftPanelOpen(open);
         }

         if (action === 'setWorkspaceZoneAPanelCOpen') {
            setWorkspaceZoneAPanelCOpen(open);
         }

         if (action === 'toggleLeftPanel') {
            toggleLeftPanel();
         }

         if (action === 'toggleRightPanel') {
            toggleRightPanel();
         }
      };

      window.addEventListener('panel-command', handlePanelCommand as EventListener);
      return () => window.removeEventListener('panel-command', handlePanelCommand as EventListener);
   }, [setLeftPanelOpen, setWorkspaceZoneAPanelCOpen, toggleLeftPanel, toggleRightPanel]);

   // Context value - only Zone A concerns
   const contextValue: WorkspaceZoneAContext = {
      // Zone A state
      workspaceZoneA,
      setWorkspaceZoneA,

      // Zone A controls
      toggleWorkspaceZoneA,
      setWorkspaceZoneAVisible,
      setWorkspaceZoneAMode,
      cycleWorkspaceZoneAMode,

      // Individual panel controls
      leftPanel: workspaceZoneA.leftPanel,
      rightPanel: workspaceZoneA.rightPanel,
      leftState: workspaceZoneA.leftState,
      setLeftState: updateLeftRailState,
      toggleLeftPanel,
      setLeftPanelWidth,
      setLeftPanelOpen,
      toggleRightPanel,
      setWorkspaceZoneAPanelCWidth,
      setWorkspaceZoneAPanelCOpen,

      // Computed properties for backward compatibility
      isWorkspaceZoneAVisible: workspaceZoneA.isVisible,
      workspaceZoneAMode,
   };

   return (
      <WorkspaceZoneAContext.Provider value={contextValue}>
         {children}
      </WorkspaceZoneAContext.Provider>
   );
}
