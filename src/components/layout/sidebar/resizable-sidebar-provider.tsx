'use client';

import * as React from 'react';
import { useFeatureFlag } from '@/src/lib/hooks/use-feature-flag';
import { setFeatureFlag } from '@/src/lib/lib/feature-flags';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';

type SidebarState = {
   isOpen: boolean;
   width: number;
   preferredWidth: number;
};

export type LeftSidebarState = 'open' | 'collapsed';

type BottomBarMode = 'push' | 'overlay';

type BottomBarState = {
   mode: BottomBarMode;
   height: number;
   isVisible: boolean;
   // For overlay mode - vertical position from bottom
   overlayPosition: number;
};

type EnhancedSidebarContext = {
   // Left sidebar
   leftSidebar: SidebarState;
   toggleLeftSidebar: () => void;
   setLeftSidebarWidth: (width: number) => void;
   setLeftSidebarOpen: (open: boolean) => void;
   leftState: LeftSidebarState;
   setLeftState: (state: LeftSidebarState) => void;

   // Right sidebar
   rightSidebar: SidebarState;
   toggleRightSidebar: () => void;
   setRightSidebarWidth: (width: number) => void;
   setRightSidebarOpen: (open: boolean) => void;

   // Bottom bar
   bottomBar: BottomBarState;
   setBottomBarMode: (mode: BottomBarMode) => void;
   setBottomBarHeight: (height: number) => void;
   setBottomBarVisible: (visible: boolean) => void;
   setBottomBarOverlayPosition: (position: number) => void;
   toggleBottomBar: () => void;

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
};

const EnhancedSidebarContext = createContext<EnhancedSidebarContext | null>(null);

const MIN_SIDEBAR_WIDTH = 200;
const MAX_SIDEBAR_WIDTH = 500;
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
   const context = useContext(EnhancedSidebarContext);
   if (!context) {
      throw new Error('useResizableSidebar must be used within a ResizableSidebarProvider');
   }
   return context;
}

export function ResizableSidebarProvider({ children }: { children: React.ReactNode }) {
   const [leftSidebar, setLeftSidebar] = useState<SidebarState>({
      isOpen: true,
      width: DEFAULT_LEFT_WIDTH,
      preferredWidth: DEFAULT_LEFT_WIDTH,
   });
   const [leftState, setLeftState] = useState<LeftSidebarState>('open');

   const [rightSidebar, setRightSidebar] = useState<SidebarState>({
      isOpen: true,
      width: DEFAULT_RIGHT_WIDTH,
      preferredWidth: DEFAULT_RIGHT_WIDTH,
   });

   const [bottomBar, setBottomBar] = useState<BottomBarState>({
      mode: 'push',
      height: DEFAULT_BOTTOM_HEIGHT, // 40px collapsed
      isVisible: true, // Always visible
      overlayPosition: DEFAULT_OVERLAY_POSITION, // Start at bottom
   });

   const [isHydrated, setIsHydrated] = useState(false);
   const [isMainFullscreen, setIsMainFullscreen] = useState(false);

   const [isDragging, setIsDragging] = useState(false);
   const [dragSide, setDragSide] = useState<'left' | 'right' | null>(null);

   // Center-bottom split height (0 = no split, >0 = split height)
   const [centerBottomSplit, setCenterBottomSplit] = useState(0);

   // Workspace Zone A visibility state
   const [isWorkspaceZoneAVisible, setIsWorkspaceZoneAVisible] = useState(true);

   const enableLeftRail = useFeatureFlag('enableLeftRail');
   const enableBottomSplit = useFeatureFlag('enableBottomSplit');
   // Keep latest values in refs for a stable keydown listener
   const enableBottomSplitRef = React.useRef(enableBottomSplit);
   useEffect(() => {
      enableBottomSplitRef.current = enableBottomSplit;
   }, [enableBottomSplit]);
   const bottomBarHeightRef = React.useRef(bottomBar.height);
   useEffect(() => {
      bottomBarHeightRef.current = bottomBar.height;
   }, [bottomBar.height]);

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

      const shouldShowBottomBar =
         enableBottomSplit && !isMainFullscreen && bottomBar.isVisible && bottomBar.mode === 'push';

      const effectiveBottomHeight = shouldShowBottomBar ? bottomBar.height : 0;

      rootStyle.setProperty('--bottombar-height', `${effectiveBottomHeight}px`);
      rootStyle.setProperty('--bottombar-mode', enableBottomSplit ? bottomBar.mode : 'push');
      rootStyle.setProperty('--center-bottom-split', `${centerBottomSplit}px`);
   }, [
      enableLeftRail,
      enableBottomSplit,
      leftState,
      leftSidebar.isOpen,
      leftSidebar.width,
      rightSidebar.isOpen,
      rightSidebar.width,
      bottomBar.height,
      bottomBar.isVisible,
      bottomBar.mode,
      isMainFullscreen,
      centerBottomSplit,
   ]);

   const updateLeftRailState = useCallback(
      (state: LeftSidebarState) => {
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
               !isNaN(width) && width >= MIN_SIDEBAR_WIDTH && width <= MAX_SIDEBAR_WIDTH
                  ? width
                  : DEFAULT_LEFT_WIDTH;
            const validPreferred =
               !isNaN(preferredWidth) &&
               preferredWidth >= MIN_SIDEBAR_WIDTH &&
               preferredWidth <= MAX_SIDEBAR_WIDTH
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
               !isNaN(width) && width >= MIN_SIDEBAR_WIDTH && width <= MAX_SIDEBAR_WIDTH
                  ? width
                  : DEFAULT_RIGHT_WIDTH;
            const validPreferred =
               !isNaN(preferredWidth) &&
               preferredWidth >= MIN_SIDEBAR_WIDTH &&
               preferredWidth <= MAX_SIDEBAR_WIDTH
                  ? preferredWidth
                  : validWidth;

            setRightSidebar({
               isOpen,
               width: validWidth,
               preferredWidth: validPreferred,
            });
         }

         // Load bottom bar state - only load saved preferences if they exist
         const savedBottomMode = localStorage.getItem('ui:bottomBarMode');
         const savedBottomHeight = localStorage.getItem('ui:bottomBarHeight');
         const savedBottomVisible = localStorage.getItem('ui:bottomBarVisible');
         const savedOverlayPosition = localStorage.getItem('ui:bottomBarOverlayPosition');

         // Only apply saved state if user has previously interacted with bottom bar
         if (savedBottomMode || savedBottomHeight || savedBottomVisible) {
            const mode = (savedBottomMode === 'overlay' ? 'overlay' : 'push') as BottomBarMode;
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

            setBottomBar({
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

         // Load Workspace Zone A visibility state
         const savedWorkspaceZoneAVisible = localStorage.getItem('ui:workspaceZoneAVisible');
         if (savedWorkspaceZoneAVisible !== null) {
            setIsWorkspaceZoneAVisible(savedWorkspaceZoneAVisible === 'true');
         }
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
   const saveToLocalStorage = useCallback((side: 'left' | 'right', state: SidebarState) => {
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
   }, []);

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
         const clampedWidth = Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, width));

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
         const clampedWidth = Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, width));

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
   const setBottomBarMode = useCallback((mode: BottomBarMode) => {
      setBottomBar((prev) => {
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
                  localStorage.setItem('ui:bottomBarHeight', pushMaxHeight.toString());
               } catch (error) {
                  console.warn('Failed to save bottom bar height to localStorage:', error);
               }
            }
         }

         try {
            localStorage.setItem('ui:bottomBarMode', mode);
         } catch (error) {
            console.warn('Failed to save bottom bar mode to localStorage:', error);
         }
         return newState;
      });
   }, []);

   const setBottomBarHeight = useCallback(
      (height: number) => {
         // Helper function to get main container top position (same logic as BottomBar component)
         const getMainTop = () => {
            if (typeof window === 'undefined') return 56;
            const el = document.querySelector('[data-main-container]') as HTMLElement | null;
            return el ? Math.round(el.getBoundingClientRect().top) : 56;
         };

         // For height changes, use same limits as BottomBar full screen button
         const maxHeight =
            bottomBar.mode === 'overlay'
               ? Math.max(MIN_BOTTOM_HEIGHT, window.innerHeight - getMainTop())
               : getPushModeMaxHeight();

         const clampedHeight = Math.max(MIN_BOTTOM_HEIGHT, Math.min(maxHeight, height));

         setBottomBar((prev) => {
            const newState = { ...prev, height: clampedHeight };
            try {
               localStorage.setItem('ui:bottomBarHeight', clampedHeight.toString());
            } catch (error) {
               console.warn('Failed to save bottom bar height to localStorage:', error);
            }
            return newState;
         });
      },
      [bottomBar.mode]
   );

   const setBottomBarVisible = useCallback((visible: boolean) => {
      setBottomBar((prev) => {
         const newState = { ...prev, isVisible: visible };
         try {
            localStorage.setItem('ui:bottomBarVisible', visible.toString());
         } catch (error) {
            console.warn('Failed to save bottom bar visibility to localStorage:', error);
         }
         return newState;
      });
   }, []);

   const setBottomBarOverlayPosition = useCallback(
      (position: number) => {
         // For overlay position, allow from 0 (bottom) to full viewport height minus bar height
         const maxPosition =
            bottomBar.mode === 'overlay'
               ? window.innerHeight - bottomBar.height
               : window.innerHeight - bottomBar.height;

         const clampedPosition = Math.max(0, Math.min(maxPosition, position));

         setBottomBar((prev) => {
            const newState = { ...prev, overlayPosition: clampedPosition };
            try {
               localStorage.setItem('ui:bottomBarOverlayPosition', clampedPosition.toString());
            } catch (error) {
               console.warn('Failed to save bottom bar overlay position to localStorage:', error);
            }
            return newState;
         });
      },
      [bottomBar.mode, bottomBar.height]
   );

   const toggleBottomBar = useCallback(() => {
      setBottomBar((prev) => {
         const newState = { ...prev, isVisible: !prev.isVisible };
         try {
            localStorage.setItem('ui:bottomBarVisible', newState.isVisible.toString());
         } catch (error) {
            console.warn('Failed to save bottom bar visibility to localStorage:', error);
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
         // When entering fullscreen, close sidebars and hide bottom bar, but remember their states via existing persistence
         if (fullscreen) {
            setLeftSidebarOpen(false);
            setRightSidebarOpen(false);
            setBottomBarVisible(false);
         } else {
            // On exit, simply show bottom bar again; sidebars restored via persisted state on user action
            setBottomBarVisible(true);
         }
         // Update CSS variables immediately
         setTimeout(updateGridLayout, 0);
      },
      [setLeftSidebarOpen, setRightSidebarOpen, setBottomBarVisible, updateGridLayout]
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

   // Temporary shortcut for toggling Section D until settings wiring is in place.
   useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
         const isCtrlLike = event.ctrlKey || event.metaKey;
         const isTopDigit2 = event.shiftKey && event.code === 'Digit2';
         const isNumpad2 = event.code === 'Numpad2';
         if (isCtrlLike && !event.altKey && (isTopDigit2 || isNumpad2)) {
            event.preventDefault();

            if (!enableBottomSplitRef.current) {
               setFeatureFlag('enableBottomSplit', true);
               setBottomBarVisible(true);
               try {
                  setBottomBarHeight(Math.max(bottomBarHeightRef.current ?? 40, 240));
               } catch {}
               return;
            }

            toggleBottomBar();
         }
      };

      document.addEventListener('keydown', handleKeyDown, { capture: true });
      return () =>
         document.removeEventListener('keydown', handleKeyDown, {
            capture: true,
         } as AddEventListenerOptions);
   }, [toggleBottomBar, setBottomBarHeight, setBottomBarVisible]);

   // Listen for panel command events from command palette
   useEffect(() => {
      const handlePanelCommand = (event: CustomEvent) => {
         const { action, visible, height, open, fullscreen } = event.detail;

         if (action === 'setBottomBarVisible') {
            if (visible && !bottomBar.isVisible) {
               // When opening, ensure bottom split is enabled and set a reasonable height
               if (!enableBottomSplitRef.current) {
                  setFeatureFlag('enableBottomSplit', true);
               }
               const defaultHeight = 300;
               setBottomBarHeight(defaultHeight);
            }
            setBottomBarVisible(visible);
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

         if (action === 'setBottomBarMode') {
            const mode = event.detail.mode;
            if (mode === 'push' || mode === 'overlay') {
               setBottomBarMode(mode);
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
      };

      window.addEventListener('panel-command', handlePanelCommand as EventListener);
      return () => window.removeEventListener('panel-command', handlePanelCommand as EventListener);
   }, [
      bottomBar.isVisible,
      setBottomBarHeight,
      setBottomBarVisible,
      setCenterBottomSplit,
      setBottomBarMode,
      setLeftSidebarOpen,
      setRightSidebarOpen,
      toggleLeftSidebar,
      toggleRightSidebar,
      setMainFullscreen,
      setWorkspaceZoneAVisible,
      toggleWorkspaceZoneA,
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
         bottomBar,
         setBottomBarMode,
         setBottomBarHeight,
         setBottomBarVisible,
         setBottomBarOverlayPosition,
         toggleBottomBar,
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
         bottomBar,
         setBottomBarMode,
         setBottomBarHeight,
         setBottomBarVisible,
         setBottomBarOverlayPosition,
         toggleBottomBar,
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
      ]
   );

   return (
      <EnhancedSidebarContext.Provider value={contextValue}>
         {children}
      </EnhancedSidebarContext.Provider>
   );
}
