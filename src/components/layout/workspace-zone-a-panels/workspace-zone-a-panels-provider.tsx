'use client';

import * as React from 'react';
import { useFeatureFlag } from '@/src/lib/hooks/use-feature-flag';
import { setFeatureFlag } from '@/src/lib/lib/feature-flags';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';

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

type WorkspaceZoneAPanelsContext = {
   // Workspace Zone A Panel A (left panel)
   leftSidebar: WorkspaceZoneAPanelState;
   toggleLeftSidebar: () => void;
   setLeftSidebarWidth: (width: number) => void;
   setLeftSidebarOpen: (open: boolean) => void;
   leftState: WorkspaceZoneAPanelAState;
   setLeftState: (state: WorkspaceZoneAPanelAState) => void;

   // Workspace Zone A Panel C (right panel)
   rightSidebar: WorkspaceZoneAPanelState;
   toggleRightSidebar: () => void;
   setRightSidebarWidth: (width: number) => void;
   setRightSidebarOpen: (open: boolean) => void;

   // Bottom bar
   workspaceZoneB: WorkspaceZoneBState;
   setWorkspaceZoneBMode: (mode: WorkspaceZoneBMode) => void;
   setWorkspaceZoneBHeight: (height: number) => void;
   setWorkspaceZoneBVisible: (visible: boolean) => void;
   setWorkspaceZoneBOverlayPosition: (position: number) => void;
   toggleWorkspaceZoneB: () => void;

   // Center-bottom split
   centerBottomSplit: number;
   setCenterBottomSplit: (height: number) => void;

   // Drag state
   isDragging: boolean;
   setIsDragging: (dragging: boolean) => void;
   dragSide: 'left' | 'right' | null;
   setDragSide: (side: 'left' | 'right' | null) => void;

   // Hydration state
   isHydrated: boolean;

   // Grid CSS custom properties
   updateGridLayout: () => void;

   // Fullscreen main content
   isMainFullscreen: boolean;
   setMainFullscreen: (fullscreen: boolean) => void;

   // Workspace Zone A visibility
   isWorkspaceZoneAVisible: boolean;
   setWorkspaceZoneAVisible: (visible: boolean) => void;
   toggleWorkspaceZoneA: () => void;

   // Top bar visibility
   isTopBarVisible: boolean;
   setTopBarVisible: (visible: boolean) => void;
   toggleTopBar: () => void;
};

const WorkspaceZoneAPanelsContext = createContext<WorkspaceZoneAPanelsContext | null>(null);

const MIN_WORKSPACE_ZONE_A_PANEL_WIDTH = 200;
const MAX_WORKSPACE_ZONE_A_PANEL_WIDTH = 500;
const DEFAULT_LEFT_WIDTH = 244;
const LEFT_COLLAPSED_WIDTH = 64;
const DEFAULT_RIGHT_WIDTH = 320;
const RIGHT_COLLAPSED_WIDTH = 64;

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

export function useResizableSidebar() {
   const context = useContext(WorkspaceZoneAPanelsContext);
   if (!context) {
      throw new Error('useResizableSidebar must be used within a WorkspaceZoneAPanelsProvider');
   }
   return context;
}

export function WorkspaceZoneAPanelsProvider({ children }: { children: React.ReactNode }) {
   const [leftSidebar, setLeftSidebar] = useState<WorkspaceZoneAPanelState>({
      isOpen: true,
      width: DEFAULT_LEFT_WIDTH,
      preferredWidth: DEFAULT_LEFT_WIDTH,
   });
   const [leftState, setLeftState] = useState<WorkspaceZoneAPanelAState>('open');

   const [rightSidebar, setRightSidebar] = useState<WorkspaceZoneAPanelState>({
      isOpen: true,
      width: DEFAULT_RIGHT_WIDTH,
      preferredWidth: DEFAULT_RIGHT_WIDTH,
   });

   const [workspaceZoneB, setWorkspaceZoneB] = useState<WorkspaceZoneBState>({
      mode: 'push',
      height: DEFAULT_BOTTOM_HEIGHT, // 40px collapsed
      isVisible: false, // Start hidden for empty state
      overlayPosition: DEFAULT_OVERLAY_POSITION, // Start at bottom
   });

   const [isHydrated, setIsHydrated] = useState(false);
   const [isMainFullscreen, setIsMainFullscreen] = useState(false);

   const [isDragging, setIsDragging] = useState(false);
   const [dragSide, setDragSide] = useState<'left' | 'right' | null>(null);

   // Center-bottom split height (0 = no split, >0 = split height)
   const [centerBottomSplit, setCenterBottomSplit] = useState(0);

   // Workspace Zone A visibility state - start visible by default
   const [isWorkspaceZoneAVisible, setIsWorkspaceZoneAVisible] = useState(true);

   // Top bar visibility state - start hidden for empty state by default
   const [isTopBarVisible, setIsTopBarVisible] = useState(false);

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

   // Debounced save to localStorage
   const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

   // Update CSS Grid layout
   const updateGridLayout = useCallback(() => {
      if (typeof document === 'undefined') {
         return;
      }

      const rootElement = document.documentElement;
      const rootStyle = rootElement.style;

      const leftCollapsedWidth = LEFT_COLLAPSED_WIDTH;
      const rightCollapsedWidth = RIGHT_COLLAPSED_WIDTH;

      const leftWidth = isMainFullscreen
         ? 0
         : enableLeftRail
           ? leftState === 'open'
              ? leftSidebar.width
              : LEFT_COLLAPSED_WIDTH
           : leftSidebar.isOpen
             ? leftSidebar.width
             : leftCollapsedWidth;

      const rightWidth = isMainFullscreen
         ? 0
         : rightSidebar.isOpen
           ? rightSidebar.width
           : rightCollapsedWidth;

      rootStyle.setProperty('--left-width', `${leftWidth}px`);
      rootStyle.setProperty('--right-width', `${rightWidth}px`);
      rootStyle.setProperty('--sidebar-left-width', `${leftWidth}px`);
      rootStyle.setProperty('--sidebar-right-width', `${rightWidth}px`);
      rootStyle.setProperty('--grid-template-columns', `${leftWidth}px 1fr ${rightWidth}px`);

      if (enableLeftRail) {
         rootStyle.setProperty('--left-open', `${leftSidebar.width}px`);
         rootStyle.setProperty('--left-collapsed', `${LEFT_COLLAPSED_WIDTH}px`);
      }

      const shouldShowWorkspaceZoneB =
         enableBottomSplit &&
         !isMainFullscreen &&
         workspaceZoneB.isVisible &&
         workspaceZoneB.mode === 'push';

      const effectiveBottomHeight = shouldShowWorkspaceZoneB ? workspaceZoneB.height : 0;

      rootStyle.setProperty('--bottombar-height', `${effectiveBottomHeight}px`);
      rootStyle.setProperty('--bottombar-mode', enableBottomSplit ? workspaceZoneB.mode : 'push');
      rootStyle.setProperty('--center-bottom-split', `${centerBottomSplit}px`);
   }, [
      enableLeftRail,
      enableBottomSplit,
      leftState,
      leftSidebar.isOpen,
      leftSidebar.width,
      rightSidebar.isOpen,
      rightSidebar.width,
      workspaceZoneB.height,
      workspaceZoneB.isVisible,
      workspaceZoneB.mode,
      isMainFullscreen,
      centerBottomSplit,
   ]);

   const updateLeftRailState = useCallback(
      (state: WorkspaceZoneAPanelAState) => {
         setLeftState((prev) => (prev === state ? prev : state));
      },
      [setLeftState]
   );

   // Hydration effect - load saved state after client-side hydration
   useEffect(() => {
      setIsHydrated(true);

      try {
         // Load left sidebar state
         const savedLeftOpen = localStorage.getItem('sidebar-left-open');
         const savedLeftWidth = localStorage.getItem('sidebar-left-width');
         const savedLeftPreferred = localStorage.getItem('sidebar-left-preferred-width');

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

            setLeftSidebar({
               isOpen,
               width: validWidth,
               preferredWidth: validPreferred,
            });
         }

         const savedLeftState = localStorage.getItem('ui:leftState');
         if (savedLeftState === 'open' || savedLeftState === 'collapsed') {
            setLeftState(savedLeftState);
         }

         // Load right sidebar state
         const savedRightOpen = localStorage.getItem('sidebar-right-open');
         const savedRightWidth = localStorage.getItem('sidebar-right-width');
         const savedRightPreferred = localStorage.getItem('sidebar-right-preferred-width');

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

            setRightSidebar({
               isOpen,
               width: validWidth,
               preferredWidth: validPreferred,
            });
         }

         // Load workspace zone B state - only load saved preferences if they exist
         const savedBottomMode = localStorage.getItem('ui:workspaceZoneBMode');
         const savedBottomHeight = localStorage.getItem('ui:workspaceZoneBHeight');
         const savedBottomVisible = localStorage.getItem('ui:workspaceZoneBVisible');
         const savedOverlayPosition = localStorage.getItem('ui:workspaceZoneBOverlayPosition');

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

            setWorkspaceZoneB({
               mode,
               height: validHeight,
               isVisible,
               overlayPosition: validOverlayPosition,
            });
         }
         // If no saved state, keep the default collapsed state (40px)

         // Load center-bottom split state
         const savedCenterBottomSplit = localStorage.getItem('ui:centerBottomSplit');
         if (savedCenterBottomSplit !== null) {
            const splitHeight = parseInt(savedCenterBottomSplit, 10);
            if (!isNaN(splitHeight) && splitHeight >= 0) {
               const viewportHeight =
                  typeof window !== 'undefined' ? window.innerHeight : FALLBACK_VIEWPORT_HEIGHT;
               const maxHeight = Math.max(100, Math.round(viewportHeight * 0.5));
               const validHeight = Math.min(maxHeight, Math.max(0, splitHeight));
               setCenterBottomSplit(validHeight);
            }
         }

         // Load Workspace Zone A visibility state - always start with empty state
         // Don't restore from localStorage to ensure app always starts with empty state
         // Users must explicitly open workspace via command palette or keyboard shortcut
         // const savedWorkspaceZoneAVisible = localStorage.getItem('ui:workspaceZoneAVisible');
         // if (savedWorkspaceZoneAVisible !== null) {
         //    setIsWorkspaceZoneAVisible(savedWorkspaceZoneAVisible === 'true');
         // }
         // Keep the default empty state (false) - workspace only opens on user action

         // Load Top Bar visibility state - always start hidden for empty state
         // Don't restore from localStorage to ensure app always starts with empty state
         // Top bar will show when workspace is opened
         // const savedTopBarVisible = localStorage.getItem('ui:topBarVisible');
         // if (savedTopBarVisible !== null) {
         //    setIsTopBarVisible(savedTopBarVisible === 'true');
         // }
         // Keep the default empty state (false) - top bar only shows when workspace is opened
      } catch (error) {
         console.warn('Failed to load sidebar state from localStorage:', error);
      }
      try {
         const savedFullscreen = localStorage.getItem('ui:mainFullscreen');
         if (savedFullscreen !== null) {
            setIsMainFullscreen(savedFullscreen === 'true');
         }
      } catch {}
   }, []);

   useEffect(() => {
      if (!isHydrated) {
         return;
      }

      try {
         localStorage.setItem('ui:leftState', leftState);
      } catch (error) {
         console.warn('Failed to save left sidebar rail state to localStorage:', error);
      }
   }, [leftState, isHydrated]);

   useEffect(() => {
      if (!isHydrated) {
         return;
      }

      try {
         localStorage.setItem('ui:centerBottomSplit', centerBottomSplit.toString());
      } catch (error) {
         console.warn('Failed to save center-bottom split state to localStorage:', error);
      }
   }, [centerBottomSplit, isHydrated]);

   // Update grid layout whenever sidebar states change
   useEffect(() => {
      updateGridLayout();
   }, [updateGridLayout]);

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

   const toggleLeftSidebar = useCallback(() => {
      if (enableLeftRail) {
         // When left rail is enabled, toggle between 'open' and 'collapsed' states
         // Keep isOpen: true in both cases for proper width calculations
         setLeftState((prev) => (prev === 'open' ? 'collapsed' : 'open'));

         // Ensure sidebar remains "open" from the legacy perspective for width calculations
         if (!leftSidebar.isOpen) {
            setLeftSidebar((prev) => ({
               ...prev,
               isOpen: true,
            }));
         }
      } else {
         // Legacy behavior: toggle isOpen state
         setLeftSidebar((prev) => {
            const isOpening = !prev.isOpen;
            const width = isOpening ? prev.preferredWidth : prev.width;
            const preferredWidth = isOpening ? prev.preferredWidth : prev.width;

            const newState = {
               ...prev,
               isOpen: isOpening,
               width,
               preferredWidth,
            };

            saveToLocalStorage('left', newState);
            updateLeftRailState(isOpening ? 'open' : 'collapsed');

            return newState;
         });
      }
   }, [enableLeftRail, leftSidebar.isOpen, saveToLocalStorage, updateLeftRailState]);

   const setLeftSidebarOpen = useCallback(
      (open: boolean) => {
         if (enableLeftRail) {
            // When left rail is enabled, set the leftState directly
            setLeftState(open ? 'open' : 'collapsed');

            // Ensure sidebar remains "open" from the legacy perspective for width calculations
            if (!leftSidebar.isOpen) {
               setLeftSidebar((prev) => ({
                  ...prev,
                  isOpen: true,
               }));
            }
         } else {
            // Legacy behavior
            setLeftSidebar((prev) => {
               const newState = {
                  ...prev,
                  isOpen: open,
                  width: open ? prev.preferredWidth : prev.width,
                  preferredWidth: open ? prev.preferredWidth : prev.width,
               };
               saveToLocalStorage('left', newState);
               updateLeftRailState(open ? 'open' : 'collapsed');
               return newState;
            });
         }
      },
      [enableLeftRail, leftSidebar.isOpen, saveToLocalStorage, updateLeftRailState]
   );

   const setLeftSidebarWidth = useCallback(
      (width: number) => {
         const clampedWidth = Math.max(
            MIN_WORKSPACE_ZONE_A_PANEL_WIDTH,
            Math.min(MAX_WORKSPACE_ZONE_A_PANEL_WIDTH, width)
         );

         setLeftSidebar((prev) => {
            if (clampedWidth !== prev.width && prev.isOpen) {
               const newState = {
                  ...prev,
                  width: clampedWidth,
                  preferredWidth: clampedWidth,
               };
               saveToLocalStorage('left', newState);
               return newState;
            }
            return prev;
         });
      },
      [saveToLocalStorage]
   );

   const toggleRightSidebar = useCallback(() => {
      setRightSidebar((prev) => {
         const newState = {
            ...prev,
            isOpen: !prev.isOpen,
            width: !prev.isOpen ? prev.preferredWidth : prev.width,
            preferredWidth: !prev.isOpen ? prev.preferredWidth : prev.width,
         };
         saveToLocalStorage('right', newState);
         return newState;
      });
   }, [saveToLocalStorage]);

   const setRightSidebarOpen = useCallback(
      (open: boolean) => {
         setRightSidebar((prev) => {
            const newState = {
               ...prev,
               isOpen: open,
               width: open ? prev.preferredWidth : prev.width,
               preferredWidth: open ? prev.preferredWidth : prev.width,
            };
            saveToLocalStorage('right', newState);
            return newState;
         });
      },
      [saveToLocalStorage]
   );

   const setRightSidebarWidth = useCallback(
      (width: number) => {
         const clampedWidth = Math.max(
            MIN_WORKSPACE_ZONE_A_PANEL_WIDTH,
            Math.min(MAX_WORKSPACE_ZONE_A_PANEL_WIDTH, width)
         );

         setRightSidebar((prev) => {
            if (clampedWidth !== prev.width && prev.isOpen) {
               const newState = {
                  ...prev,
                  width: clampedWidth,
                  preferredWidth: clampedWidth,
               };
               saveToLocalStorage('right', newState);
               return newState;
            }
            return prev;
         });
      },
      [saveToLocalStorage]
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

   const setMainFullscreen = useCallback(
      (fullscreen: boolean) => {
         setIsMainFullscreen(fullscreen);
         try {
            localStorage.setItem('ui:mainFullscreen', fullscreen.toString());
         } catch {}
         // When entering fullscreen, close sidebars and hide workspace zone B, but remember their states via existing persistence
         if (fullscreen) {
            setLeftSidebarOpen(false);
            setRightSidebarOpen(false);
            setWorkspaceZoneBVisible(false);
         } else {
            // On exit, simply show workspace zone B again; sidebars restored via persisted state on user action
            setWorkspaceZoneBVisible(true);
         }
         // Update CSS variables immediately
         setTimeout(updateGridLayout, 0);
      },
      [setLeftSidebarOpen, setRightSidebarOpen, setWorkspaceZoneBVisible, updateGridLayout]
   );

   const setWorkspaceZoneAVisible = useCallback((visible: boolean) => {
      setIsWorkspaceZoneAVisible(visible);
      try {
         localStorage.setItem('ui:workspaceZoneAVisible', visible.toString());
      } catch (error) {
         console.warn('Failed to save workspace zone A visibility to localStorage:', error);
      }
   }, []);

   const toggleWorkspaceZoneA = useCallback(() => {
      setWorkspaceZoneAVisible(!isWorkspaceZoneAVisible);
   }, [isWorkspaceZoneAVisible, setWorkspaceZoneAVisible]);

   const setTopBarVisible = useCallback((visible: boolean) => {
      setIsTopBarVisible(visible);
      try {
         localStorage.setItem('ui:topBarVisible', visible.toString());
      } catch (error) {
         console.warn('Failed to save top bar visibility to localStorage:', error);
      }
   }, []);

   const toggleTopBar = useCallback(() => {
      setTopBarVisible(!isTopBarVisible);
   }, [isTopBarVisible, setTopBarVisible]);

   // Temporary shortcut for toggling Section D until settings wiring is in place.
   useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
         const isCtrlLike = event.ctrlKey || event.metaKey;
         const isTopDigit2 = event.shiftKey && event.code === 'Digit2';
         const isNumpad2 = event.code === 'Numpad2';
         const isTopDigit8 = event.shiftKey && event.code === 'Digit8';
         const isNumpad8 = event.code === 'Numpad8';
         const isComma = event.shiftKey && event.key === ',';

         // Ctrl+Shift+, - Toggle workspace zone A
         if (isCtrlLike && !event.altKey && isComma) {
            event.preventDefault();
            setWorkspaceZoneAVisible(true);
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

         // Ctrl+Shift+8 or Ctrl+Numpad8 - Toggle top bar
         if (isCtrlLike && !event.altKey && (isTopDigit8 || isNumpad8)) {
            event.preventDefault();
            toggleTopBar();
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
      toggleTopBar,
      setWorkspaceZoneAVisible,
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
            if (centerBottomSplit > 0) {
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

         if (action === 'setLeftSidebarOpen') {
            setLeftSidebarOpen(open);
         }

         if (action === 'setRightSidebarOpen') {
            setRightSidebarOpen(open);
         }

         if (action === 'toggleLeftSidebar') {
            toggleLeftSidebar();
         }

         if (action === 'toggleRightSidebar') {
            toggleRightSidebar();
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

         if (action === 'setTopBarVisible') {
            setTopBarVisible(visible);
         }

         if (action === 'toggleTopBar') {
            toggleTopBar();
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
      setLeftSidebarOpen,
      setRightSidebarOpen,
      toggleLeftSidebar,
      toggleRightSidebar,
      setMainFullscreen,
      setWorkspaceZoneAVisible,
      toggleWorkspaceZoneA,
      setTopBarVisible,
      toggleTopBar,
      centerBottomSplit,
   ]);

   const contextValue = React.useMemo(
      () => ({
         leftSidebar,
         toggleLeftSidebar,
         setLeftSidebarWidth,
         setLeftSidebarOpen,
         leftState,
         setLeftState: updateLeftRailState,
         rightSidebar,
         toggleRightSidebar,
         setRightSidebarWidth,
         setRightSidebarOpen,
         workspaceZoneB,
         setWorkspaceZoneBMode,
         setWorkspaceZoneBHeight,
         setWorkspaceZoneBVisible,
         setWorkspaceZoneBOverlayPosition,
         toggleWorkspaceZoneB,
         centerBottomSplit,
         setCenterBottomSplit,
         isDragging,
         setIsDragging,
         dragSide,
         setDragSide,
         isHydrated,
         updateGridLayout,
         isMainFullscreen,
         setMainFullscreen,
         isWorkspaceZoneAVisible,
         setWorkspaceZoneAVisible,
         toggleWorkspaceZoneA,
         isTopBarVisible,
         setTopBarVisible,
         toggleTopBar,
      }),
      [
         leftSidebar,
         toggleLeftSidebar,
         setLeftSidebarWidth,
         setLeftSidebarOpen,
         leftState,
         updateLeftRailState,
         rightSidebar,
         toggleRightSidebar,
         setRightSidebarWidth,
         setRightSidebarOpen,
         workspaceZoneB,
         setWorkspaceZoneBMode,
         setWorkspaceZoneBHeight,
         setWorkspaceZoneBVisible,
         setWorkspaceZoneBOverlayPosition,
         toggleWorkspaceZoneB,
         centerBottomSplit,
         setCenterBottomSplit,
         isDragging,
         setIsDragging,
         dragSide,
         setDragSide,
         isHydrated,
         updateGridLayout,
         isMainFullscreen,
         setMainFullscreen,
         isWorkspaceZoneAVisible,
         setWorkspaceZoneAVisible,
         toggleWorkspaceZoneA,
         isTopBarVisible,
         setTopBarVisible,
         toggleTopBar,
      ]
   );

   return (
      <WorkspaceZoneAPanelsContext.Provider value={contextValue}>
         {children}
      </WorkspaceZoneAPanelsContext.Provider>
   );
}
