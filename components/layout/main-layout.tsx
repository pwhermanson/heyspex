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
      setBottomBarVisible
   } = useResizableSidebar();

   const height = {
      1: 'h-[calc(100svh-40px)] lg:h-[calc(100svh-56px)]',
      2: 'h-[calc(100svh-80px)] lg:h-[calc(100svh-96px)]',
   };

   // Calculate grid rows based on bottom bar mode and visibility
   const getGridRows = () => {
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

         {/* Main Area - contains the three-panel layout + optional overlay bottom bar */}
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

            {/* Overlay Bottom Bar - only rendered in overlay mode */}
            {bottomBar.isVisible && bottomBar.mode === 'overlay' && (
               <>
                  <div
                     className="absolute left-0 right-0 z-20"
                     style={{ bottom: `${bottomBar.height}px` }}
                  >
                     <SplitHandle
                        currentHeight={bottomBar.height}
                        onHeightChange={setBottomBarHeight}
                     />
                  </div>
                  <div
                     className="absolute bottom-0 left-0 right-0 z-10"
                     style={{ height: `${bottomBar.height}px` }}
                  >
                     <BottomBar
                        mode={bottomBar.mode}
                        onModeChange={setBottomBarMode}
                        height={bottomBar.height}
                        isOverlay={true}
                     />
                  </div>
               </>
            )}
         </div>

         {/* Push Bottom Bar - only rendered in push mode as separate grid row */}
         {bottomBar.isVisible && bottomBar.mode === 'push' && (
            <div className="relative overflow-hidden">
               <SplitHandle
                  currentHeight={bottomBar.height}
                  onHeightChange={setBottomBarHeight}
                  className="absolute top-0 left-0 right-0 z-10"
               />
               <div className="h-full pt-2">
                  <BottomBar
                     mode={bottomBar.mode}
                     onModeChange={setBottomBarMode}
                     height={bottomBar.height - 8} // Account for split handle
                     isOverlay={false}
                  />
               </div>
            </div>
         )}

         {/* Bottom Bar Toggle - for testing, will move to TopBar later */}
         {!bottomBar.isVisible && (
            <div className="fixed bottom-4 right-4 z-50">
               <button
                  onClick={() => setBottomBarVisible(true)}
                  className="bg-primary text-primary-foreground rounded-lg px-3 py-2 text-sm font-medium hover:bg-primary/90"
               >
                  Show Console
               </button>
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
