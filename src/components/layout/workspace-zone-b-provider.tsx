'use client';

import * as React from 'react';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useFeatureFlag } from '@/src/lib/hooks/use-feature-flag';
import { setFeatureFlag } from '@/src/lib/lib/feature-flags';

// Zone B specific types
export type WorkspaceZoneBMode = 'push' | 'overlay';

export type WorkspaceZoneBState = {
   mode: WorkspaceZoneBMode;
   height: number;
   isVisible: boolean;
   // For overlay mode - vertical position from bottom
   overlayPosition: number;
};

// Zone B context type
type WorkspaceZoneBContext = {
   // Zone B state
   workspaceZoneB: WorkspaceZoneBState;
   setWorkspaceZoneB: (
      state: WorkspaceZoneBState | ((prev: WorkspaceZoneBState) => WorkspaceZoneBState)
   ) => void;
   toggleWorkspaceZoneB: () => void;

   // Zone B controls
   setWorkspaceZoneBMode: (mode: WorkspaceZoneBMode) => void;
   setWorkspaceZoneBHeight: (height: number) => void;
   setWorkspaceZoneBVisible: (visible: boolean) => void;
   setWorkspaceZoneBOverlayPosition: (position: number) => void;
};

const WorkspaceZoneBContext = createContext<WorkspaceZoneBContext | null>(null);

// Constants for Zone B
const MIN_BOTTOM_HEIGHT = 40; // Collapsed state height
const MAX_BOTTOM_HEIGHT_RATIO = 0.5;
const DEFAULT_BOTTOM_HEIGHT = 200; // Start with reasonable height for push mode
const DEFAULT_OVERLAY_POSITION = 0; // Start at bottom

const FALLBACK_VIEWPORT_HEIGHT = 800;
const getPushModeMaxHeight = (viewportHeight?: number) => {
   const viewport =
      viewportHeight ??
      (typeof window !== 'undefined' ? window.innerHeight : FALLBACK_VIEWPORT_HEIGHT);
   return Math.max(MIN_BOTTOM_HEIGHT, Math.round(viewport * MAX_BOTTOM_HEIGHT_RATIO));
};

export function useWorkspaceZoneB() {
   const context = useContext(WorkspaceZoneBContext);
   if (!context) {
      throw new Error('useWorkspaceZoneB must be used within a WorkspaceZoneBProvider');
   }
   return context;
}

export function WorkspaceZoneBProvider({ children }: { children: React.ReactNode }) {
   const [workspaceZoneB, setWorkspaceZoneB] = useState<WorkspaceZoneBState>({
      mode: 'push',
      height: DEFAULT_BOTTOM_HEIGHT,
      isVisible: false, // Start hidden for empty state
      overlayPosition: DEFAULT_OVERLAY_POSITION,
   });

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

   // Hydration effect - load saved state after client-side hydration
   useEffect(() => {
      try {
         // Load workspace zone B state - only load saved preferences if they exist
         const savedBottomMode = localStorage.getItem('ui:workspaceZoneBMode');
         const savedBottomHeight = localStorage.getItem('ui:workspaceZoneBHeight');
         const savedBottomVisible = localStorage.getItem('ui:workspaceZoneBVisible');
         const savedOverlayPosition = localStorage.getItem('ui:workspaceZoneBOverlayPosition');

         // Calculate a reasonable default height for push mode
         const viewportHeight =
            typeof window !== 'undefined' ? window.innerHeight : FALLBACK_VIEWPORT_HEIGHT;
         const pushModeDefaultHeight = Math.max(
            200,
            Math.min(400, Math.round(viewportHeight * 0.25))
         ); // 25% of viewport, min 200px, max 400px

         let workspaceZoneBState = {
            mode: 'push' as WorkspaceZoneBMode,
            height: pushModeDefaultHeight,
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
                  : pushModeDefaultHeight;
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

         setWorkspaceZoneB(workspaceZoneBState);
      } catch (error) {
         console.warn('Failed to load workspace zone B state from localStorage:', error);
      }
   }, []);

   // Zone B management functions
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

         console.log('🔧 setWorkspaceZoneBHeight:', {
            requestedHeight: height,
            maxHeight,
            clampedHeight,
            mode: workspaceZoneB.mode,
            currentHeight: workspaceZoneB.height,
         });

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
      [workspaceZoneB.mode, workspaceZoneB.height]
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

   // Keyboard shortcuts for Zone B controls
   useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
         const isCtrlLike = event.ctrlKey || event.metaKey;
         const isTopDigit2 = event.shiftKey && event.code === 'Digit2';
         const isNumpad2 = event.code === 'Numpad2';

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
      };

      document.addEventListener('keydown', handleKeyDown, { capture: true });
      return () =>
         document.removeEventListener('keydown', handleKeyDown, {
            capture: true,
         } as AddEventListenerOptions);
   }, [toggleWorkspaceZoneB, setWorkspaceZoneBHeight, setWorkspaceZoneBVisible]);

   // Listen for Zone B command events from command palette
   useEffect(() => {
      const handlePanelCommand = (event: CustomEvent) => {
         const { action, visible, mode } = event.detail;

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

         if (action === 'setWorkspaceZoneBMode') {
            if (mode === 'push' || mode === 'overlay') {
               setWorkspaceZoneBMode(mode);
            }
         }
      };

      window.addEventListener('panel-command', handlePanelCommand as EventListener);
      return () => window.removeEventListener('panel-command', handlePanelCommand as EventListener);
   }, [
      workspaceZoneB.isVisible,
      setWorkspaceZoneBHeight,
      setWorkspaceZoneBVisible,
      setWorkspaceZoneBMode,
   ]);

   const contextValue = React.useMemo(
      () => ({
         workspaceZoneB,
         setWorkspaceZoneB,
         toggleWorkspaceZoneB,
         setWorkspaceZoneBMode,
         setWorkspaceZoneBHeight,
         setWorkspaceZoneBVisible,
         setWorkspaceZoneBOverlayPosition,
      }),
      [
         workspaceZoneB,
         setWorkspaceZoneB,
         toggleWorkspaceZoneB,
         setWorkspaceZoneBMode,
         setWorkspaceZoneBHeight,
         setWorkspaceZoneBVisible,
         setWorkspaceZoneBOverlayPosition,
      ]
   );

   return (
      <WorkspaceZoneBContext.Provider value={contextValue}>
         {children}
      </WorkspaceZoneBContext.Provider>
   );
}
