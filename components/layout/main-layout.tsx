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
import { cn } from '@/lib/utils';

interface MainLayoutProps {
   children: React.ReactNode;
   header?: React.ReactNode;
   headersNumber?: 1 | 2;
}

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
    const maxHeight = bottomBar.mode === 'overlay'
      ? Math.max(40, windowHeight - getMainTop())
      : 300;

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
         const maxHeight = bottomBar.mode === 'overlay'
           ? Math.max(40, newWindowHeight - getMainTop())
           : 300;
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
  // Always render with bottom bar space to ensure consistent initial load experience
  const getGridRows = () => {
    if (isMainFullscreen) {
      return '1fr';
    }
    // Always show bottom bar space for consistent initial load
    if (!bottomBar.isVisible) {
      return '56px 1fr'; // Just TopBar and MainArea
    }

    if (bottomBar.mode === 'push') {
      return `56px 1fr ${bottomBar.height}px`; // TopBar, MainArea, BottomBar
    }

    return '56px 1fr'; // Overlay mode: TopBar and MainArea (bottom bar floats)
  };

   return (
      <div
         className="h-svh w-full grid"
         style={{ gridTemplateRows: getGridRows() }}
         data-bottom-mode={bottomBar.mode}
      >
         {/* TopBar - spans full width */}
         {!isMainFullscreen && <TopBar />}

         {/* Main Area - contains the three-panel layout */}
         <div className="relative overflow-hidden">
            {/* Three-panel grid */}
            <div
               className={cn(
                  'grid w-full h-full overflow-hidden',
                  !isDragging && 'transition-[grid-template-columns] duration-300 ease-in-out'
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
         {isHydrated && !isMainFullscreen && bottomBar.isVisible && bottomBar.mode === 'overlay' && (
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
        {!isMainFullscreen && bottomBar.isVisible && bottomBar.mode === 'push' && (
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



