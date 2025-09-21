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
   const { isDragging } = useResizableSidebar();
   const height = {
      1: 'h-[calc(100svh-40px)] lg:h-[calc(100svh-56px)]',
      2: 'h-[calc(100svh-80px)] lg:h-[calc(100svh-96px)]',
   };

   return (
      <div className="h-svh w-full grid grid-rows-[56px_1fr] overflow-hidden">
         {/* TopBar - spans full width */}
         <TopBar />

         {/* Main Area - contains the three-panel layout */}
         <div
            className={cn(
               'grid w-full overflow-hidden',
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
