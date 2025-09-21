'use client';

import React from 'react';
import { AppSidebar } from '@/components/layout/sidebar/app-sidebar';
import { RightSidebar } from '@/components/layout/sidebar/right-sidebar';
import {
   RightSidebarProvider,
   useRightSidebar,
} from '@/components/layout/sidebar/right-sidebar-provider';
import { SidebarProvider } from '@/components/ui/sidebar';
import { CreateIssueModalProvider } from '@/components/common/issues/create-issue-modal-provider';
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

function MainContent({ children, header, headersNumber = 2 }: MainLayoutProps) {
   const { isOpen: isRightSidebarOpen } = useRightSidebar();
   const height = {
      1: 'h-[calc(100svh-40px)] lg:h-[calc(100svh-56px)]',
      2: 'h-[calc(100svh-80px)] lg:h-[calc(100svh-96px)]',
   };

   return (
      <div className="h-svh overflow-hidden lg:p-2 w-full relative">
         <div
            className={cn(
               'lg:border lg:rounded-md overflow-hidden flex flex-col items-center justify-start bg-container h-full transition-all duration-300 ease-in-out',
               isRightSidebarOpen ? 'mr-80' : 'mr-0'
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
   );
}

export default function MainLayout({ children, header, headersNumber = 2 }: MainLayoutProps) {
   return (
      <SidebarProvider>
         <RightSidebarProvider>
            <CreateIssueModalProvider />
            <AppSidebar />
            <MainContent header={header} headersNumber={headersNumber}>
               {children}
            </MainContent>
            <RightSidebar />
         </RightSidebarProvider>
      </SidebarProvider>
   );
}
