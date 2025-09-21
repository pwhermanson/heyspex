'use client';

import React from 'react';
import { AppSidebar } from '@/components/layout/sidebar/app-sidebar';
import { RightSidebar } from '@/components/layout/sidebar/right-sidebar';
import {
   RightSidebarProvider,
} from '@/components/layout/sidebar/right-sidebar-provider';
import { ResizableSidebarProvider, useResizableSidebar } from '@/components/layout/sidebar/resizable-sidebar-provider';

const DEFAULT_BOTTOM_HEIGHT = 40; // Collapsed state height
import { SidebarProvider } from '@/components/ui/sidebar';
import { CreateIssueModalProvider } from '@/components/common/issues/create-issue-modal-provider';
import { TopBar } from '@/components/layout/top-bar';
import { BottomBar } from '@/components/layout/bottom-bar';
import { SplitHandle } from '@/components/layout/split-handle';
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
      setBottomBarVisible,
      setBottomBarOverlayPosition,
      isHydrated
   } = useResizableSidebar();

   // Drag state for bottom bar overlay positioning
   const [isDraggingBottomBar, setIsDraggingBottomBar] = React.useState(false);
   const [dragStartY, setDragStartY] = React.useState(0);
   const [dragStartPosition, setDragStartPosition] = React.useState(0);
   const dragHandleRef = React.useRef<HTMLDivElement>(null);

   const height = {
      1: 'h-[calc(100svh-40px)] lg:h-[calc(100svh-56px)]',
      2: 'h-[calc(100svh-80px)] lg:h-[calc(100svh-96px)]',
   };

   // Drag handlers for bottom bar overlay resizing (expand upward / contract downward)
   const handleBottomBarDragStart = React.useCallback((e: React.MouseEvent) => {
      console.log('Drag start triggered', { mode: bottomBar.mode, isOverlay: bottomBar.mode === 'overlay' });
      if (bottomBar.mode !== 'overlay') return;

      e.preventDefault();
      setIsDraggingBottomBar(true);
      setDragStartY(e.clientY);
      setDragStartPosition(bottomBar.height); // Start from current height

      console.log('Starting drag', { startY: e.clientY, startHeight: bottomBar.height });

      // Add global mouse event listeners
      document.addEventListener('mousemove', handleBottomBarDragMove);
      document.addEventListener('mouseup', handleBottomBarDragEnd);
   }, [bottomBar.mode, bottomBar.height]);

   const handleBottomBarDragMove = React.useCallback((e: MouseEvent) => {
      if (!isDraggingBottomBar) return;

      // Dragging up increases height; dragging down decreases height
      const deltaY = dragStartY - e.clientY;
      const newHeight = Math.max(40, dragStartPosition + deltaY);
      const maxHeight = window.innerHeight - 56; // Leave space for TopBar
      const clampedHeight = Math.min(maxHeight, newHeight);

      console.log('Dragging', { deltaY, newHeight, clampedHeight, windowHeight: window.innerHeight });
      setBottomBarHeight(clampedHeight);
   }, [isDraggingBottomBar, dragStartY, dragStartPosition, setBottomBarHeight]);

   const handleBottomBarDragEnd = React.useCallback(() => {
      setIsDraggingBottomBar(false);
      
      // Remove global mouse event listeners
      document.removeEventListener('mousemove', handleBottomBarDragMove);
      document.removeEventListener('mouseup', handleBottomBarDragEnd);
   }, [handleBottomBarDragMove]);

   // Cleanup on unmount
   React.useEffect(() => {
      return () => {
         document.removeEventListener('mousemove', handleBottomBarDragMove);
         document.removeEventListener('mouseup', handleBottomBarDragEnd);
      };
   }, [handleBottomBarDragMove, handleBottomBarDragEnd]);

  // Calculate grid rows based on bottom bar mode and visibility
  // Always render with bottom bar space to ensure consistent initial load experience
  const getGridRows = () => {
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
         className="h-svh w-full grid overflow-hidden"
         style={{ gridTemplateRows: getGridRows() }}
         data-bottom-mode={bottomBar.mode}
      >
         {/* TopBar - spans full width */}
         <TopBar />

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
                  className="overflow-hidden"
                  style={{ gridArea: 'sidebar' }}
               >
                  <AppSidebar />
               </div>

               {/* Main Content Area */}
               <div
                  className="overflow-hidden lg:p-2 w-full relative"
                  style={{ gridArea: 'main' }}
               >
               <div
                  className={cn(
                     'lg:border lg:rounded-md overflow-hidden flex flex-col items-center justify-start bg-container h-full'
                  )}
                  data-main-container
               >
                     {header}
                     <div
                        className={cn(
                           'overflow-auto w-full',
                           isEmptyHeader(header) ? 'h-full' : height[headersNumber as keyof typeof height]
                        )}
                     >
                        {children}
                     </div>
                  </div>
               </div>

               {/* Right Sidebar Area */}
               <div
                  className="overflow-hidden"
                  style={{ gridArea: 'right-sidebar' }}
               >
                  <RightSidebar />
               </div>
            </div>
         </div>

         {/* Overlay Bottom Bar - positioned outside main area for true overlay */}
         {isHydrated && bottomBar.isVisible && bottomBar.mode === 'overlay' && (
            console.log('Rendering overlay bottom bar', {
               isHydrated,
               isVisible: bottomBar.isVisible,
               mode: bottomBar.mode,
               overlayPosition: bottomBar.overlayPosition,
               height: bottomBar.height
            }) || true
         ) && (
            <div
               className="fixed left-0 right-0 z-50"
               style={{
                  bottom: `0px`,
                  height: `${bottomBar.height}px`
               }}
            >
               {/* Split Handle - positioned at the top of the bottom bar */}
               <div
                  className="absolute top-0 left-0 right-0"
                  style={{ transform: `translateY(-100%)` }}
                  data-main-container
               >
                  <SplitHandle
                     currentHeight={bottomBar.height}
                     onHeightChange={setBottomBarHeight}
                     minHeight={40}
                     maxHeight={typeof window !== 'undefined' ? (window.innerHeight - 56) : 10000}
                  />
               </div>

               {/* Bottom Bar Content */}
               <BottomBar
                  mode={bottomBar.mode}
                  onModeChange={setBottomBarMode}
                  height={bottomBar.height}
                  isOverlay={true}
                  onDragStart={handleBottomBarDragStart}
                  onDragEnd={handleBottomBarDragEnd}
                  isDragging={isDraggingBottomBar}
                  dragHandleRef={dragHandleRef}
               />
            </div>
         )}

         {/* Bottom Bar - always rendered when visible */}
         {bottomBar.isVisible && bottomBar.mode === 'push' && (
            <div className="relative overflow-hidden">
               {isHydrated && (
                  <SplitHandle
                     currentHeight={bottomBar.height}
                     onHeightChange={setBottomBarHeight}
                     className="absolute top-0 left-0 right-0 z-10"
                  />
               )}
               <div className="h-full pt-2">
                  <BottomBar
                     mode={bottomBar.mode}
                     onModeChange={isHydrated ? setBottomBarMode : () => {}}
                     height={bottomBar.height - (isHydrated ? 8 : 0)} // Account for split handle only when hydrated
                     isOverlay={false}
                  />
               </div>
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
