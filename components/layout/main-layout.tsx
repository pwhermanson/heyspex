'use client';

import React from 'react';
import { AppSidebar } from '@/components/layout/sidebar/app-sidebar';
import { RightSidebar } from '@/components/layout/sidebar/right-sidebar';
import {
   RightSidebarProvider,
} from '@/components/layout/sidebar/right-sidebar-provider';
import { ResizableSidebarProvider, useResizableSidebar } from '@/components/layout/sidebar/resizable-sidebar-provider';

import { SidebarProvider } from '@/components/ui/sidebar';
import { CreateIssueModalProvider } from '@/components/common/issues/create-issue-modal-provider';
import { TopBar } from '@/components/layout/top-bar';
import { BottomBar } from '@/components/layout/bottom-bar';
import { useFeatureFlag } from '@/hooks/use-feature-flag';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
   children: React.ReactNode;
   header?: React.ReactNode;
   headersNumber?: 1 | 2;
}

const PUSH_MAX_HEIGHT_RATIO = 0.5;

const isEmptyHeader = (header: React.ReactNode | undefined): boolean => {
   if (!header) return true;

   if (React.isValidElement(header) && header.type === React.Fragment) {
      const props = header.props as { children?: React.ReactNode };

      if (!props.children) return true;

      if (Array.isArray(props.children) && props.children.length === 0) {
         return true;
      }
   }

   return false;
};

function LayoutGrid({ children, header, headersNumber = 2 }: MainLayoutProps) {
   const {
      isDragging,
      bottomBar,
      setBottomBarMode,
      setBottomBarHeight,
      isHydrated,
      isMainFullscreen
   } = useResizableSidebar();

   const isTopBarEnabled = useFeatureFlag('enableTopBar');
   const isBottomSplitEnabled = useFeatureFlag('enableBottomSplit');
   const safeBottomEnabled = isHydrated && isBottomSplitEnabled;
   const initialTopBarHeightRef = React.useRef<string | null>(null);

  // Drag state for bottom bar overlay positioning
  const [isDraggingBottomBar, setIsDraggingBottomBar] = React.useState(false);
  const dragStartYRef = React.useRef(0);
  const dragStartHeightRef = React.useRef(0);
  const isDraggingRef = React.useRef(false);

  // Window height state for responsive calculations
  const [windowHeight, setWindowHeight] = React.useState(
    typeof window !== 'undefined' ? window.innerHeight : 1000
  );

  // Use refs to maintain consistent function references for event listener cleanup
  const dragMoveRef = React.useRef<((e: MouseEvent) => void) | null>(null);
  const dragEndRef = React.useRef<(() => void) | null>(null);

   const height = {
      1: 'h-[calc(100svh-40px)] lg:h-[calc(100svh-56px)]',
      2: 'h-[calc(100svh-80px)] lg:h-[calc(100svh-96px)]',
   };

  React.useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const root = document.documentElement;
    const rootStyle = root.style;

    if (initialTopBarHeightRef.current === null) {
      const computed = getComputedStyle(root).getPropertyValue('--topbar-height');
      initialTopBarHeightRef.current = computed?.trim() || '56px';
    }

    const restore = () => {
      const fallback = initialTopBarHeightRef.current ?? '56px';
      rootStyle.setProperty('--topbar-height', fallback);
    };

    if (!isTopBarEnabled || isMainFullscreen) {
      rootStyle.setProperty('--topbar-height', '0px');
      return restore;
    }

    const topBarElement = document.querySelector('[data-top-bar]') as HTMLElement | null;
    const applyHeight = (height: number) => {
      const safeHeight = Number.isFinite(height) ? Math.max(0, Math.round(height)) : 56;
      rootStyle.setProperty('--topbar-height', `${safeHeight}px`);
    };

    if (!topBarElement) {
      applyHeight(56);
      return restore;
    }

    applyHeight(topBarElement.offsetHeight);

    if (typeof ResizeObserver === 'undefined') {
      return restore;
    }

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.target === topBarElement) {
          const height = entry.contentRect?.height ?? topBarElement.offsetHeight;
          applyHeight(height);
        }
      }
    });

    observer.observe(topBarElement);

    return () => {
      observer.disconnect();
      restore();
    };
  }, [isTopBarEnabled, isMainFullscreen]);


  // Helper function to get main container top position (same logic as BottomBar component)
  const getMainTop = () => {
    if (typeof window === 'undefined') return 56;
    const el = document.querySelector('[data-main-container]') as HTMLElement | null;
    return el ? Math.round(el.getBoundingClientRect().top) : 56;
  };

  // Drag handlers for bottom bar resizing (works for both push and overlay modes)
  const handleBottomBarDragMove = React.useCallback((event: MouseEvent) => {
    if (!isDraggingRef.current) return;

    // Dragging up (smaller clientY) increases height; dragging down (larger clientY) decreases height
    const deltaY = dragStartYRef.current - event.clientY; // Positive when dragging up
    const proposedHeight = Math.max(40, dragStartHeightRef.current + deltaY);

    // Calculate max height based on mode (same logic as BottomBar full screen button)
    const pushMaxHeight = Math.max(40, Math.round(windowHeight * PUSH_MAX_HEIGHT_RATIO));
    const maxHeight = bottomBar.mode === 'overlay'
      ? Math.max(40, windowHeight - getMainTop())
      : pushMaxHeight;

    setBottomBarHeight(Math.min(maxHeight, proposedHeight));
  }, [bottomBar.mode, windowHeight, setBottomBarHeight]);

  const handleBottomBarDragEnd = React.useCallback(() => {
    if (!isDraggingRef.current) return;

    isDraggingRef.current = false;
    setIsDraggingBottomBar(false);
    document.body.classList.remove('sidebar-dragging');

    // Remove global mouse event listeners using refs
    if (dragMoveRef.current) {
      document.removeEventListener('mousemove', dragMoveRef.current);
      dragMoveRef.current = null;
    }
    if (dragEndRef.current) {
      document.removeEventListener('mouseup', dragEndRef.current);
      dragEndRef.current = null;
    }
  }, []);

  const handleBottomBarDragStart = React.useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation(); // Prevent event bubbling

    isDraggingRef.current = true;
    setIsDraggingBottomBar(true);
    dragStartYRef.current = event.clientY;
    dragStartHeightRef.current = bottomBar.height; // Start from current height

    document.body.classList.add('sidebar-dragging');

    // Store function references for cleanup
    dragMoveRef.current = handleBottomBarDragMove;
    dragEndRef.current = handleBottomBarDragEnd;

    // Add global mouse event listeners
    document.addEventListener('mousemove', handleBottomBarDragMove);
    document.addEventListener('mouseup', handleBottomBarDragEnd);
  }, [bottomBar.height, handleBottomBarDragMove, handleBottomBarDragEnd]);

   // Handle window resize to keep bottom bar responsive
   React.useEffect(() => {
      const handleWindowResize = () => {
         const newWindowHeight = window.innerHeight;
         setWindowHeight(newWindowHeight);

         // Recalculate max height based on current window size and mode (same logic as full screen button)
        const pushMaxHeight = Math.max(40, Math.round(newWindowHeight * PUSH_MAX_HEIGHT_RATIO));
        const maxHeight = bottomBar.mode === 'overlay'
          ? Math.max(40, newWindowHeight - getMainTop())
          : pushMaxHeight;
         const currentHeight = bottomBar.height;

         // If current height exceeds new max height, clamp it
         if (currentHeight > maxHeight) {
            setBottomBarHeight(Math.max(40, maxHeight));
         }
      };

      window.addEventListener('resize', handleWindowResize);
      return () => window.removeEventListener('resize', handleWindowResize);
   }, [bottomBar.mode, bottomBar.height, setBottomBarHeight]);

  // Cleanup on unmount - only need to clean up if drag is in progress
  React.useEffect(() => {
    return () => {
      if (dragMoveRef.current) {
        document.removeEventListener('mousemove', dragMoveRef.current);
      }
      if (dragEndRef.current) {
        document.removeEventListener('mouseup', dragEndRef.current);
      }
      document.body.classList.remove('sidebar-dragging');
      isDraggingRef.current = false;
    };
  }, []);

  // Calculate grid rows based on bottom bar mode and visibility
  // Leverage shared CSS variables so top/bottom rails stay in sync
  const getGridRows = () => {
    if (isMainFullscreen) {
      return '1fr';
    }

    const rows: string[] = [];

    if (isTopBarEnabled) {
      rows.push('var(--topbar-height, 56px)');
    }

    rows.push('1fr');

    const shouldReserveBottomRow = safeBottomEnabled && bottomBar.mode === 'push' && bottomBar.isVisible && !isMainFullscreen;

    if (shouldReserveBottomRow) {
      rows.push('var(--bottombar-height, 40px)');
    }

    return rows.join(' ');
  };

   return (
      <div
         className="h-svh w-full grid"
         style={{ gridTemplateRows: getGridRows() }}
         data-bottom-mode={safeBottomEnabled ? bottomBar.mode : undefined}
      >
         {/* TopBar - spans full width */}
         {!isMainFullscreen && isTopBarEnabled && <TopBar />}

         {/* Main Area - contains the three-panel layout */}
         <div className="relative overflow-hidden">
            {/* Three-panel grid */}
            <div
               className={cn(
                  'grid w-full h-full overflow-hidden',
                  !isDragging && 'transition-[grid-template-columns] layout-transition-long motion-reduce:transition-none'
               )}
               style={{
                  gridTemplateColumns: 'var(--grid-template-columns, 244px 1fr 0px)',
                  gridTemplateAreas: '"sidebar main right-sidebar"',
               }}
            >
               {/* Left Sidebar Area */}
              <div
                 className={cn('overflow-hidden lg:pt-2 lg:pb-2 lg:pl-2 lg:pr-1', isMainFullscreen && 'p-0')}
                  style={{ gridArea: 'sidebar' }}
               >
                  <AppSidebar />
               </div>

               {/* Main Content Area */}
              <div
                 className={cn('overflow-hidden lg:pt-2 lg:pb-2 lg:pl-1 lg:pr-1 w-full relative', isMainFullscreen && 'p-0')}
                  style={{ gridArea: 'main' }}
               >
               <div
                  className={cn(
                    'overflow-hidden flex flex-col items-center justify-start bg-container h-full',
                    !isMainFullscreen && 'lg:border lg:rounded-md'
                  )}
                  data-main-container
               >
                    {header}
                     <div
                        className={cn(
                           'overflow-auto w-full',
                           isMainFullscreen
                             ? 'h-full'
                             : (isEmptyHeader(header) ? 'h-full' : height[headersNumber as keyof typeof height])
                        )}
                     >
                        {children}
                     </div>
                  </div>
               </div>

               {/* Right Sidebar Area */}
              <div
                 className={cn('overflow-hidden lg:pt-2 lg:pb-2 lg:pl-1 lg:pr-2', isMainFullscreen && 'p-0')}
                  style={{ gridArea: 'right-sidebar' }}
               >
                  <RightSidebar />
               </div>
            </div>
         </div>

         {/* Overlay Bottom Bar - positioned outside main area for true overlay */}
         {isBottomSplitEnabled && isHydrated && !isMainFullscreen && bottomBar.isVisible && bottomBar.mode === 'overlay' && (
            <div
               className="fixed left-2 right-2 z-[100]"
               style={{
                  bottom: `0px`,
                  height: `${bottomBar.height}px`
               }}
            >

               {/* Bottom Bar Content */}
               <BottomBar
                  mode={bottomBar.mode}
                  onModeChange={setBottomBarMode}
                  height={bottomBar.height}
                  isOverlay={true}
                  onDragStart={handleBottomBarDragStart}
                  isDragging={isDraggingBottomBar}
               />
            </div>
         )}

         {/* Bottom Bar - push mode rendered as separate grid row */}
        {!isMainFullscreen && safeBottomEnabled && bottomBar.isVisible && bottomBar.mode === 'push' && (
            <div className="relative overflow-hidden z-[50]">
               <BottomBar
                  mode={bottomBar.mode}
                  onModeChange={isHydrated ? setBottomBarMode : () => {}}
                  height={bottomBar.height}
                  isOverlay={false}
                  onDragStart={handleBottomBarDragStart}
                  isDragging={isDraggingBottomBar}
               />
            </div>
         )}

      </div>
   );
}

export default function MainLayout({ children, header, headersNumber = 2 }: MainLayoutProps) {
   return (
      <ResizableSidebarProvider>
         <SidebarProvider>
            <RightSidebarProvider>
               <CreateIssueModalProvider />
               <LayoutGrid header={header} headersNumber={headersNumber}>
                  {children}
               </LayoutGrid>
            </RightSidebarProvider>
         </SidebarProvider>
      </ResizableSidebarProvider>
   );
}
