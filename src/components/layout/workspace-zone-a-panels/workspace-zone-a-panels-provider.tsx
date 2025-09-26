'use client';

import * as React from 'react';
import { useFeatureFlag } from '@/src/lib/hooks/use-feature-flag';
import { setFeatureFlag } from '@/src/lib/lib/feature-flags';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';

// Simplified state structures following Zone B's pattern
type WorkspaceZoneAPanelState = {
   isOpen: boolean;
   width: number;
   preferredWidth: number;
};

export type WorkspaceZoneAPanelAState = 'open' | 'collapsed';

type WorkspaceZoneBMode = 'push' | 'overlay';

type WorkspaceZoneBState = {
   mode: WorkspaceZoneBMode;
   height: number;
   isVisible: boolean;
   // For overlay mode - vertical position from bottom
   overlayPosition: number;
};

// Simplified Zone A state structure (matching Zone B's simplicity)
type WorkspaceZoneAState = {
   isVisible: boolean;
   leftPanel: WorkspaceZoneAPanelState;
   rightPanel: WorkspaceZoneAPanelState;
   leftState: WorkspaceZoneAPanelAState;
};

// Simplified drag state
type DragState = {
   isDragging: boolean;
   dragSide: 'left' | 'right' | null;
};

// Simplified UI state
type UIState = {
   isHydrated: boolean;
   isMainFullscreen: boolean;
   isControlBarVisible: boolean;
   centerBottomSplit: number;
   viewportWidth: number;
};

// Simplified context type following Zone B's pattern
type WorkspaceZoneAPanelsContext = {
   // Simplified Zone A state
   workspaceZoneA: WorkspaceZoneAState;
   setWorkspaceZoneA: (
      state: WorkspaceZoneAState | ((prev: WorkspaceZoneAState) => WorkspaceZoneAState)
   ) => void;
   toggleWorkspaceZoneA: () => void;

   // Zone B state (already simplified)
   workspaceZoneB: WorkspaceZoneBState;
   setWorkspaceZoneB: (
      state: WorkspaceZoneBState | ((prev: WorkspaceZoneBState) => WorkspaceZoneBState)
   ) => void;
   toggleWorkspaceZoneB: () => void;

   // Simplified drag state
   dragState: DragState;
   setDragState: (state: DragState | ((prev: DragState) => DragState)) => void;

   // Simplified UI state
   uiState: UIState;
   setUIState: (state: UIState | ((prev: UIState) => UIState)) => void;

   // Individual panel controls (for backward compatibility)
   toggleLeftPanel: () => void;
   setLeftPanelWidth: (width: number) => void;
   setLeftPanelOpen: (open: boolean) => void;
   toggleRightPanel: () => void;
   setWorkspaceZoneAPanelCWidth: (width: number) => void;
   setWorkspaceZoneAPanelCOpen: (open: boolean) => void;

   // Zone B controls (for backward compatibility)
   setWorkspaceZoneBMode: (mode: WorkspaceZoneBMode) => void;
   setWorkspaceZoneBHeight: (height: number) => void;
   setWorkspaceZoneBVisible: (visible: boolean) => void;
   setWorkspaceZoneBOverlayPosition: (position: number) => void;

   // UI controls (for backward compatibility)
   setCenterBottomSplit: (height: number) => void;
   setMainFullscreen: (fullscreen: boolean) => void;
   setControlBarVisible: (visible: boolean) => void;
   toggleControlBar: () => void;
};

const WorkspaceZoneAPanelsContext = createContext<WorkspaceZoneAPanelsContext | null>(null);

const MIN_WORKSPACE_ZONE_A_PANEL_WIDTH = 200;
const MAX_WORKSPACE_ZONE_A_PANEL_WIDTH = 500;
const DEFAULT_LEFT_WIDTH = 244;
const LEFT_COLLAPSED_WIDTH = 64;
const DEFAULT_RIGHT_WIDTH = 320;
const RIGHT_COLLAPSED_WIDTH = 64;

// Viewport breaking point constants
const RIGHT_PANEL_VIEWPORT_BREAKING_POINT = 0.2; // 20% of viewport width
const FALLBACK_VIEWPORT_WIDTH = 1200;

const MIN_BOTTOM_HEIGHT = 40; // Collapsed state height
const MAX_BOTTOM_HEIGHT_RATIO = 0.5;
const DEFAULT_BOTTOM_HEIGHT = 40; // Start collapsed by default
const DEFAULT_OVERLAY_POSITION = 0; // Start at bottom

const FALLBACK_VIEWPORT_HEIGHT = 800;
const getPushModeMaxHeight = (viewportHeight?: number) => {
   const viewport =
      viewportHeight ??
      (typeof window !== 'undefined' ? window.innerHeight : FALLBACK_VIEWPORT_HEIGHT);
   return Math.max(MIN_BOTTOM_HEIGHT, Math.round(viewport * MAX_BOTTOM_HEIGHT_RATIO));
};

export function useResizablePanel() {
   const context = useContext(WorkspaceZoneAPanelsContext);
   if (!context) {
      throw new Error('useResizablePanel must be used within a WorkspaceZoneAPanelsProvider');
   }
   return context;
}

export function WorkspaceZoneAPanelsProvider({ children }: { children: React.ReactNode }) {
   // Simplified state management following Zone B's pattern
   const [workspaceZoneA, setWorkspaceZoneA] = useState<WorkspaceZoneAState>({
      isVisible: true,
      leftPanel: {
         isOpen: true,
         width: DEFAULT_LEFT_WIDTH,
         preferredWidth: DEFAULT_LEFT_WIDTH,
      },
      rightPanel: {
         isOpen: true,
         width: DEFAULT_RIGHT_WIDTH,
         preferredWidth: DEFAULT_RIGHT_WIDTH,
      },
      leftState: 'open',
   });

   const [workspaceZoneB, setWorkspaceZoneB] = useState<WorkspaceZoneBState>({
      mode: 'push',
      height: DEFAULT_BOTTOM_HEIGHT, // 40px collapsed
      isVisible: false, // Start hidden for empty state
      overlayPosition: DEFAULT_OVERLAY_POSITION, // Start at bottom
   });

   const [dragState, setDragState] = useState<DragState>({
      isDragging: false,
      dragSide: null,
   });

   const [uiState, setUIState] = useState<UIState>({
      isHydrated: false,
      isMainFullscreen: false,
      isControlBarVisible: false,
      centerBottomSplit: 0,
      viewportWidth: typeof window !== 'undefined' ? window.innerWidth : FALLBACK_VIEWPORT_WIDTH,
   });

   const enableLeftRail = useFeatureFlag('enableLeftRail');
   const enableBottomSplit = useFeatureFlag('enableBottomSplit');
   // Keep latest values in refs for a stable keydown listener
   const enableBottomSplitRef = React.useRef(enableBottomSplit);
   useEffect(() => {
      enableBottomSplitRef.current = enableBottomSplit;
   }, [enableBottomSplit]);
   const workspaceZoneBHeightRef = React.useRef(workspaceZoneB.height);
   useEffect(() => {
      workspaceZoneBHeightRef.current = workspaceZoneB.height;
   }, [workspaceZoneB.height]);

   // Calculate if right panel should be collapsed based on viewport width
   const shouldCollapseRightPanel = useCallback(() => {
      const currentViewportWidth =
         typeof window !== 'undefined' ? window.innerWidth : uiState.viewportWidth;
      const breakingPointWidth = currentViewportWidth * RIGHT_PANEL_VIEWPORT_BREAKING_POINT;
      return workspaceZoneA.rightPanel.width <= breakingPointWidth;
   }, [workspaceZoneA.rightPanel.width, uiState.viewportWidth]);

   // Debounced save to localStorage
   const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

   // CSS classes now handle layout - no need for updateGridLayout function

   const updateLeftRailState = useCallback((state: WorkspaceZoneAPanelAState) => {
      setWorkspaceZoneA((prev) => ({
         ...prev,
         leftState: prev.leftState === state ? prev.leftState : state,
      }));
   }, []);

   // Hydration effect - load saved state after client-side hydration
   useEffect(() => {
      setUIState((prev) => ({ ...prev, isHydrated: true }));

      try {
         // Load left sidebar state
         const savedLeftOpen = localStorage.getItem('sidebar-left-open');
         const savedLeftWidth = localStorage.getItem('sidebar-left-width');
         const savedLeftPreferred = localStorage.getItem('sidebar-left-preferred-width');

         let leftPanel = {
            isOpen: true,
            width: DEFAULT_LEFT_WIDTH,
            preferredWidth: DEFAULT_LEFT_WIDTH,
         };

         if (savedLeftOpen !== null) {
            const isOpen = savedLeftOpen === 'true';
            const width = savedLeftWidth ? parseInt(savedLeftWidth, 10) : DEFAULT_LEFT_WIDTH;
            const preferredWidth = savedLeftPreferred ? parseInt(savedLeftPreferred, 10) : width;

            const validWidth =
               !isNaN(width) &&
               width >= MIN_WORKSPACE_ZONE_A_PANEL_WIDTH &&
               width <= MAX_WORKSPACE_ZONE_A_PANEL_WIDTH
                  ? width
                  : DEFAULT_LEFT_WIDTH;
            const validPreferred =
               !isNaN(preferredWidth) &&
               preferredWidth >= MIN_WORKSPACE_ZONE_A_PANEL_WIDTH &&
               preferredWidth <= MAX_WORKSPACE_ZONE_A_PANEL_WIDTH
                  ? preferredWidth
                  : validWidth;

            leftPanel = {
               isOpen,
               width: validWidth,
               preferredWidth: validPreferred,
            };
         }

         const savedLeftState = localStorage.getItem('ui:leftState');
         const leftState =
            savedLeftState === 'open' || savedLeftState === 'collapsed' ? savedLeftState : 'open';

         // Load right sidebar state
         const savedRightOpen = localStorage.getItem('sidebar-right-open');
         const savedRightWidth = localStorage.getItem('sidebar-right-width');
         const savedRightPreferred = localStorage.getItem('sidebar-right-preferred-width');

         let rightPanel = {
            isOpen: true,
            width: DEFAULT_RIGHT_WIDTH,
            preferredWidth: DEFAULT_RIGHT_WIDTH,
         };

         if (savedRightOpen !== null) {
            const isOpen = savedRightOpen === 'true';
            const width = savedRightWidth ? parseInt(savedRightWidth, 10) : DEFAULT_RIGHT_WIDTH;
            const preferredWidth = savedRightPreferred ? parseInt(savedRightPreferred, 10) : width;

            const validWidth =
               !isNaN(width) &&
               width >= MIN_WORKSPACE_ZONE_A_PANEL_WIDTH &&
               width <= MAX_WORKSPACE_ZONE_A_PANEL_WIDTH
                  ? width
                  : DEFAULT_RIGHT_WIDTH;
            const validPreferred =
               !isNaN(preferredWidth) &&
               preferredWidth >= MIN_WORKSPACE_ZONE_A_PANEL_WIDTH &&
               preferredWidth <= MAX_WORKSPACE_ZONE_A_PANEL_WIDTH
                  ? preferredWidth
                  : validWidth;

            rightPanel = {
               isOpen,
               width: validWidth,
               preferredWidth: validPreferred,
            };
         }

         // Load workspace zone B state - only load saved preferences if they exist
         const savedBottomMode = localStorage.getItem('ui:workspaceZoneBMode');
         const savedBottomHeight = localStorage.getItem('ui:workspaceZoneBHeight');
         const savedBottomVisible = localStorage.getItem('ui:workspaceZoneBVisible');
         const savedOverlayPosition = localStorage.getItem('ui:workspaceZoneBOverlayPosition');

         let workspaceZoneBState = {
            mode: 'push' as WorkspaceZoneBMode,
            height: DEFAULT_BOTTOM_HEIGHT,
            isVisible: false,
            overlayPosition: DEFAULT_OVERLAY_POSITION,
         };

         // Only apply saved state if user has previously interacted with workspace zone B
         if (savedBottomMode || savedBottomHeight || savedBottomVisible) {
            const mode = (savedBottomMode === 'overlay' ? 'overlay' : 'push') as WorkspaceZoneBMode;
            const height = savedBottomHeight
               ? parseInt(savedBottomHeight, 10)
               : DEFAULT_BOTTOM_HEIGHT;
            const isVisible = savedBottomVisible !== null ? savedBottomVisible === 'true' : true;
            const overlayPosition = savedOverlayPosition
               ? parseInt(savedOverlayPosition, 10)
               : DEFAULT_OVERLAY_POSITION;

            const viewportHeight =
               typeof window !== 'undefined' ? window.innerHeight : FALLBACK_VIEWPORT_HEIGHT;
            const getMainTop = () => {
               if (typeof document === 'undefined') return 56;
               const el = document.querySelector('[data-main-container]') as HTMLElement | null;
               return el ? Math.round(el.getBoundingClientRect().top) : 56;
            };
            const overlayMaxHeight = Math.max(MIN_BOTTOM_HEIGHT, viewportHeight - getMainTop());
            const pushMaxHeight = getPushModeMaxHeight(viewportHeight);
            const allowedMaxHeight = mode === 'overlay' ? overlayMaxHeight : pushMaxHeight;
            const validHeight =
               !isNaN(height) && height >= MIN_BOTTOM_HEIGHT && height <= allowedMaxHeight
                  ? height
                  : DEFAULT_BOTTOM_HEIGHT;
            const validOverlayPosition =
               !isNaN(overlayPosition) && overlayPosition >= 0
                  ? overlayPosition
                  : DEFAULT_OVERLAY_POSITION;

            workspaceZoneBState = {
               mode,
               height: validHeight,
               isVisible,
               overlayPosition: validOverlayPosition,
            };
         }

         // Load center-bottom split state
         const savedCenterBottomSplit = localStorage.getItem('ui:centerBottomSplit');
         let centerBottomSplit = 0;
         if (savedCenterBottomSplit !== null) {
            const splitHeight = parseInt(savedCenterBottomSplit, 10);
            if (!isNaN(splitHeight) && splitHeight >= 0) {
               const viewportHeight =
                  typeof window !== 'undefined' ? window.innerHeight : FALLBACK_VIEWPORT_HEIGHT;
               const maxHeight = Math.max(100, Math.round(viewportHeight * 0.5));
               const validHeight = Math.min(maxHeight, Math.max(0, splitHeight));
               centerBottomSplit = validHeight;
            }
         }

         // Load fullscreen state
         const savedFullscreen = localStorage.getItem('ui:mainFullscreen');
         const isMainFullscreen = savedFullscreen === 'true';

         // Update all states at once
         setWorkspaceZoneA((prev) => ({
            ...prev,
            leftPanel,
            rightPanel,
            leftState,
         }));

         setWorkspaceZoneB(workspaceZoneBState);

         setUIState((prev) => ({
            ...prev,
            centerBottomSplit,
            isMainFullscreen,
         }));
      } catch (error) {
         console.warn('Failed to load sidebar state from localStorage:', error);
      }
   }, []);

   useEffect(() => {
      if (!uiState.isHydrated) {
         return;
      }

      try {
         localStorage.setItem('ui:leftState', workspaceZoneA.leftState);
      } catch (error) {
         console.warn('Failed to save left sidebar rail state to localStorage:', error);
      }
   }, [workspaceZoneA.leftState, uiState.isHydrated]);

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

   // CSS classes now handle layout automatically - no useEffect needed

   // Cleanup timeout on unmount
   useEffect(() => {
      return () => {
         if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
         }
      };
   }, []);

   // Save state to localStorage with debouncing
   const saveToLocalStorage = useCallback(
      (side: 'left' | 'right', state: WorkspaceZoneAPanelState) => {
         if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
         }

         saveTimeoutRef.current = setTimeout(() => {
            try {
               localStorage.setItem(`sidebar-${side}-open`, state.isOpen.toString());
               localStorage.setItem(`sidebar-${side}-width`, state.width.toString());
               localStorage.setItem(
                  `sidebar-${side}-preferred-width`,
                  state.preferredWidth.toString()
               );
            } catch (error) {
               console.warn(`Failed to save ${side} sidebar state to localStorage:`, error);
            }
         }, 500);
      },
      []
   );

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

            saveToLocalStorage('left', newLeftPanel);
            updateLeftRailState(isOpening ? 'open' : 'collapsed');

            return {
               ...prev,
               leftPanel: newLeftPanel,
               leftState: isOpening ? 'open' : 'collapsed',
            };
         });
      }
   }, [enableLeftRail, saveToLocalStorage, updateLeftRailState]);

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
               saveToLocalStorage('left', newLeftPanel);
               updateLeftRailState(open ? 'open' : 'collapsed');
               return {
                  ...prev,
                  leftPanel: newLeftPanel,
                  leftState: open ? 'open' : 'collapsed',
               };
            });
         }
      },
      [enableLeftRail, saveToLocalStorage, updateLeftRailState]
   );

   const setLeftPanelWidth = useCallback(
      (width: number) => {
         const clampedWidth = Math.max(
            MIN_WORKSPACE_ZONE_A_PANEL_WIDTH,
            Math.min(MAX_WORKSPACE_ZONE_A_PANEL_WIDTH, width)
         );

         setWorkspaceZoneA((prev) => {
            if (clampedWidth !== prev.leftPanel.width && prev.leftPanel.isOpen) {
               const newLeftPanel = {
                  ...prev.leftPanel,
                  width: clampedWidth,
                  preferredWidth: clampedWidth,
               };
               saveToLocalStorage('left', newLeftPanel);
               return {
                  ...prev,
                  leftPanel: newLeftPanel,
               };
            }
            return prev;
         });
      },
      [saveToLocalStorage]
   );

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
         saveToLocalStorage('right', newRightPanel);
         return {
            ...prev,
            rightPanel: newRightPanel,
         };
      });
   }, [saveToLocalStorage]);

   const setWorkspaceZoneAPanelCOpen = useCallback(
      (open: boolean) => {
         setWorkspaceZoneA((prev) => {
            const newRightPanel = {
               ...prev.rightPanel,
               isOpen: open,
               width: open ? prev.rightPanel.preferredWidth : prev.rightPanel.width,
               preferredWidth: open ? prev.rightPanel.preferredWidth : prev.rightPanel.width,
            };
            saveToLocalStorage('right', newRightPanel);
            return {
               ...prev,
               rightPanel: newRightPanel,
            };
         });
      },
      [saveToLocalStorage]
   );

   // Monitor viewport width changes and handle breaking point logic
   useEffect(() => {
      if (!uiState.isHydrated) return;

      const handleWindowResize = () => {
         const newViewportWidth = window.innerWidth;
         setUIState((prev) => ({ ...prev, viewportWidth: newViewportWidth }));

         // Check if right panel should be collapsed based on new viewport width
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
   }, [uiState.isHydrated, workspaceZoneA.rightPanel.isOpen, workspaceZoneA.rightPanel.width]);

   const setWorkspaceZoneAPanelCWidth = useCallback(
      (width: number) => {
         const clampedWidth = Math.max(
            MIN_WORKSPACE_ZONE_A_PANEL_WIDTH,
            Math.min(MAX_WORKSPACE_ZONE_A_PANEL_WIDTH, width)
         );

         setWorkspaceZoneA((prev) => {
            if (clampedWidth !== prev.rightPanel.width && prev.rightPanel.isOpen) {
               const newRightPanel = {
                  ...prev.rightPanel,
                  width: clampedWidth,
                  preferredWidth: clampedWidth,
               };

               // Check if the new width should trigger auto-collapse
               const currentViewportWidth =
                  typeof window !== 'undefined' ? window.innerWidth : uiState.viewportWidth;
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
                  saveToLocalStorage('right', collapsedPanel);
                  return {
                     ...prev,
                     rightPanel: collapsedPanel,
                  };
               }

               saveToLocalStorage('right', newRightPanel);
               return {
                  ...prev,
                  rightPanel: newRightPanel,
               };
            }
            return prev;
         });
      },
      [saveToLocalStorage, uiState.viewportWidth]
   );
   // Bottom bar management functions
   const setWorkspaceZoneBMode = useCallback((mode: WorkspaceZoneBMode) => {
      setWorkspaceZoneB((prev) => {
         const newState = { ...prev, mode };

         // Graceful transition from overlay to push mode
         if (prev.mode === 'overlay' && mode === 'push') {
            const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
            const pushMaxHeight = Math.max(40, Math.round(viewportHeight * 0.5));

            // Only adjust height if current height is too large for push mode
            if (prev.height > pushMaxHeight) {
               // Set to maximum push mode height for best UX
               newState.height = pushMaxHeight;
               try {
                  localStorage.setItem('ui:workspaceZoneBHeight', pushMaxHeight.toString());
               } catch (error) {
                  console.warn('Failed to save workspace zone B height to localStorage:', error);
               }
            }
         }

         try {
            localStorage.setItem('ui:workspaceZoneBMode', mode);
         } catch (error) {
            console.warn('Failed to save workspace zone B mode to localStorage:', error);
         }
         return newState;
      });
   }, []);

   const setWorkspaceZoneBHeight = useCallback(
      (height: number) => {
         // Helper function to get main container top position (same logic as WorkspaceZoneB component)
         const getMainTop = () => {
            if (typeof window === 'undefined') return 56;
            const el = document.querySelector('[data-main-container]') as HTMLElement | null;
            return el ? Math.round(el.getBoundingClientRect().top) : 56;
         };

         // For height changes, use same limits as WorkspaceZoneB full screen button
         const maxHeight =
            workspaceZoneB.mode === 'overlay'
               ? Math.max(MIN_BOTTOM_HEIGHT, window.innerHeight - getMainTop())
               : getPushModeMaxHeight();

         const clampedHeight = Math.max(MIN_BOTTOM_HEIGHT, Math.min(maxHeight, height));

         setWorkspaceZoneB((prev) => {
            const newState = { ...prev, height: clampedHeight };
            try {
               localStorage.setItem('ui:workspaceZoneBHeight', clampedHeight.toString());
            } catch (error) {
               console.warn('Failed to save workspace zone B height to localStorage:', error);
            }
            return newState;
         });
      },
      [workspaceZoneB.mode]
   );

   const setWorkspaceZoneBVisible = useCallback((visible: boolean) => {
      setWorkspaceZoneB((prev) => {
         const newState = { ...prev, isVisible: visible };
         try {
            localStorage.setItem('ui:workspaceZoneBVisible', visible.toString());
         } catch (error) {
            console.warn('Failed to save workspace zone B visibility to localStorage:', error);
         }
         return newState;
      });
   }, []);

   const setWorkspaceZoneBOverlayPosition = useCallback(
      (position: number) => {
         // For overlay position, allow from 0 (bottom) to full viewport height minus bar height
         const maxPosition =
            workspaceZoneB.mode === 'overlay'
               ? window.innerHeight - workspaceZoneB.height
               : window.innerHeight - workspaceZoneB.height;

         const clampedPosition = Math.max(0, Math.min(maxPosition, position));

         setWorkspaceZoneB((prev) => {
            const newState = { ...prev, overlayPosition: clampedPosition };
            try {
               localStorage.setItem('ui:workspaceZoneBOverlayPosition', clampedPosition.toString());
            } catch (error) {
               console.warn(
                  'Failed to save workspace zone B overlay position to localStorage:',
                  error
               );
            }
            return newState;
         });
      },
      [workspaceZoneB.mode, workspaceZoneB.height]
   );

   const toggleWorkspaceZoneB = useCallback(() => {
      setWorkspaceZoneB((prev) => {
         const newState = { ...prev, isVisible: !prev.isVisible };
         try {
            localStorage.setItem('ui:workspaceZoneBVisible', newState.isVisible.toString());
         } catch (error) {
            console.warn('Failed to save workspace zone B visibility to localStorage:', error);
         }
         return newState;
      });
   }, []);

   const setCenterBottomSplit = useCallback((height: number) => {
      setUIState((prev) => ({ ...prev, centerBottomSplit: height }));
   }, []);

   const setMainFullscreen = useCallback(
      (fullscreen: boolean) => {
         setUIState((prev) => ({ ...prev, isMainFullscreen: fullscreen }));
         try {
            localStorage.setItem('ui:mainFullscreen', fullscreen.toString());
         } catch {}
         // When entering fullscreen, close sidebars and hide workspace zone B, but remember their states via existing persistence
         if (fullscreen) {
            setLeftPanelOpen(false);
            setWorkspaceZoneAPanelCOpen(false);
            setWorkspaceZoneBVisible(false);
         } else {
            // On exit, simply show workspace zone B again; sidebars restored via persisted state on user action
            setWorkspaceZoneBVisible(true);
         }
         // CSS classes now handle layout automatically
      },
      [setLeftPanelOpen, setWorkspaceZoneAPanelCOpen, setWorkspaceZoneBVisible]
   );

   const setWorkspaceZoneAVisible = useCallback((visible: boolean) => {
      setWorkspaceZoneA((prev) => ({ ...prev, isVisible: visible }));
      try {
         localStorage.setItem('ui:workspaceZoneAVisible', visible.toString());
      } catch (error) {
         console.warn('Failed to save workspace zone A visibility to localStorage:', error);
      }
   }, []);

   const toggleWorkspaceZoneA = useCallback(() => {
      setWorkspaceZoneA((prev) => ({
         ...prev,
         isVisible: !prev.isVisible,
      }));
   }, []);

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

   // Temporary shortcut for toggling Section D until settings wiring is in place.
   useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
         const isCtrlLike = event.ctrlKey || event.metaKey;
         const isTopDigit1 = event.shiftKey && event.code === 'Digit1';
         const isNumpad1 = event.code === 'Numpad1';
         const isTopDigit2 = event.shiftKey && event.code === 'Digit2';
         const isNumpad2 = event.code === 'Numpad2';
         const isTopDigit8 = event.shiftKey && event.code === 'Digit8';
         const isNumpad8 = event.code === 'Numpad8';
         const isComma = event.shiftKey && event.key === ',';

         // Ctrl+Shift+1 or Ctrl+Numpad1 - Toggle workspace zone A
         if (isCtrlLike && !event.altKey && (isTopDigit1 || isNumpad1)) {
            event.preventDefault();
            toggleWorkspaceZoneA();
         }

         // Ctrl+Shift+, - Toggle workspace zone A
         if (isCtrlLike && !event.altKey && isComma) {
            event.preventDefault();
            toggleWorkspaceZoneA();
         }

         if (isCtrlLike && !event.altKey && (isTopDigit2 || isNumpad2)) {
            event.preventDefault();

            if (!enableBottomSplitRef.current) {
               setFeatureFlag('enableBottomSplit', true);
               setWorkspaceZoneBVisible(true);
               try {
                  setWorkspaceZoneBHeight(Math.max(workspaceZoneBHeightRef.current ?? 40, 240));
               } catch {}
               return;
            }

            toggleWorkspaceZoneB();
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
   }, [
      toggleWorkspaceZoneB,
      setWorkspaceZoneBHeight,
      setWorkspaceZoneBVisible,
      toggleControlBar,
      toggleWorkspaceZoneA,
   ]);

   // Listen for panel command events from command palette
   useEffect(() => {
      const handlePanelCommand = (event: CustomEvent) => {
         const { action, visible, height, open, fullscreen } = event.detail;

         if (action === 'setWorkspaceZoneBVisible') {
            if (visible && !workspaceZoneB.isVisible) {
               // When opening, ensure bottom split is enabled and set a reasonable height
               if (!enableBottomSplitRef.current) {
                  setFeatureFlag('enableBottomSplit', true);
               }
               const defaultHeight = 300;
               setWorkspaceZoneBHeight(defaultHeight);
            }
            setWorkspaceZoneBVisible(visible);
         }

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

         if (action === 'setWorkspaceZoneBMode') {
            const mode = event.detail.mode;
            if (mode === 'push' || mode === 'overlay') {
               setWorkspaceZoneBMode(mode);
            }
         }

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

         if (action === 'setMainFullscreen') {
            setMainFullscreen(fullscreen);
         }

         if (action === 'setWorkspaceZoneAVisible') {
            setWorkspaceZoneAVisible(visible);
         }

         if (action === 'toggleWorkspaceZoneA') {
            toggleWorkspaceZoneA();
         }

         if (action === 'setControlBarVisible') {
            setControlBarVisible(visible);
         }

         if (action === 'toggleControlBar') {
            toggleControlBar();
         }
      };

      window.addEventListener('panel-command', handlePanelCommand as EventListener);
      return () => window.removeEventListener('panel-command', handlePanelCommand as EventListener);
   }, [
      workspaceZoneB.isVisible,
      setWorkspaceZoneBHeight,
      setWorkspaceZoneBVisible,
      setCenterBottomSplit,
      setWorkspaceZoneBMode,
      setLeftPanelOpen,
      setWorkspaceZoneAPanelCOpen,
      toggleLeftPanel,
      toggleRightPanel,
      setMainFullscreen,
      setWorkspaceZoneAVisible,
      toggleWorkspaceZoneA,
      setControlBarVisible,
      toggleControlBar,
      uiState.centerBottomSplit,
   ]);

   const contextValue = React.useMemo(
      () => ({
         // Simplified state
         workspaceZoneA,
         setWorkspaceZoneA,
         toggleWorkspaceZoneA,
         workspaceZoneB,
         setWorkspaceZoneB,
         toggleWorkspaceZoneB,
         dragState,
         setDragState,
         uiState,
         setUIState,

         // Backward compatibility - individual panel controls
         leftPanel: workspaceZoneA.leftPanel,
         toggleLeftPanel,
         setLeftPanelWidth,
         setLeftPanelOpen,
         leftState: workspaceZoneA.leftState,
         setLeftState: updateLeftRailState,
         rightPanel: workspaceZoneA.rightPanel,
         toggleRightPanel,
         setWorkspaceZoneAPanelCWidth,
         setWorkspaceZoneAPanelCOpen,

         // Backward compatibility - Zone B controls
         setWorkspaceZoneBMode,
         setWorkspaceZoneBHeight,
         setWorkspaceZoneBVisible,
         setWorkspaceZoneBOverlayPosition,

         // Backward compatibility - UI controls
         centerBottomSplit: uiState.centerBottomSplit,
         setCenterBottomSplit,
         isDragging: dragState.isDragging,
         setIsDragging: (dragging: boolean) =>
            setDragState((prev) => ({ ...prev, isDragging: dragging })),
         dragSide: dragState.dragSide,
         setDragSide: (side: 'left' | 'right' | null) =>
            setDragState((prev) => ({ ...prev, dragSide: side })),
         isHydrated: uiState.isHydrated,
         isMainFullscreen: uiState.isMainFullscreen,
         setMainFullscreen,
         isWorkspaceZoneAVisible: workspaceZoneA.isVisible,
         setWorkspaceZoneAVisible: (visible: boolean) =>
            setWorkspaceZoneA((prev) => ({ ...prev, isVisible: visible })),
         isTogglingWorkspaceZoneA: false, // Removed complex toggle tracking
         isControlBarVisible: uiState.isControlBarVisible,
         setControlBarVisible,
         toggleControlBar,
      }),
      [
         workspaceZoneA,
         setWorkspaceZoneA,
         toggleWorkspaceZoneA,
         workspaceZoneB,
         setWorkspaceZoneB,
         toggleWorkspaceZoneB,
         dragState,
         setDragState,
         uiState,
         setUIState,
         toggleLeftPanel,
         setLeftPanelWidth,
         setLeftPanelOpen,
         updateLeftRailState,
         toggleRightPanel,
         setWorkspaceZoneAPanelCWidth,
         setWorkspaceZoneAPanelCOpen,
         setWorkspaceZoneBMode,
         setWorkspaceZoneBHeight,
         setWorkspaceZoneBVisible,
         setWorkspaceZoneBOverlayPosition,
         setCenterBottomSplit,
         setMainFullscreen,
         setControlBarVisible,
         toggleControlBar,
      ]
   );

   return (
      <WorkspaceZoneAPanelsContext.Provider value={contextValue}>
         {children}
      </WorkspaceZoneAPanelsContext.Provider>
   );
}
