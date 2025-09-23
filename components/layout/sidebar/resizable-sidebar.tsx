'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useResizableSidebar } from './resizable-sidebar-provider';
import { SidebarDragHandle } from './sidebar-drag-handle';
import { LeftSidebarTrigger } from './left-sidebar-trigger';
import { RightSidebarTrigger } from './right-sidebar-trigger';
import { inboxItems, workspaceItems, accountItems, featuresItems } from '@/mock-data/side-bar-nav';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useFeatureFlag } from '@/hooks/use-feature-flag';

interface ResizableSidebarProps {
  side: 'left' | 'right';
  children: React.ReactNode;
  className?: string;
}

export function ResizableSidebar({ side, children, className }: ResizableSidebarProps) {
  const {
    leftSidebar,
    rightSidebar,
    leftState,
  } = useResizableSidebar();

  const enableLeftRail = useFeatureFlag('enableLeftRail');
  const isLeft = side === 'left';
  const isExpanded = isLeft
    ? (enableLeftRail ? leftState === 'open' : leftSidebar.isOpen)
    : rightSidebar.isOpen;
  const pathname = usePathname();
  const isSettings = pathname.includes('/settings');

  // Get navigation items based on current page
  const getNavigationItems = () => {
    if (isSettings) {
      return [...accountItems, ...featuresItems];
    }
    return [...inboxItems, ...workspaceItems];
  };

  const navigationItems = isLeft ? getNavigationItems() : [];

  let content: React.ReactNode;

  if (isExpanded) {
    content = (
      <div
        className={cn(
          'bg-container flex h-full w-full flex-col border shadow-sm relative lg:rounded-md overflow-hidden',
          side === 'right' && 'border-l border-r-0'
        )}
      >
        {children}

        {/* Drag handle - positioned absolutely within the sidebar */}
        <SidebarDragHandle side={side} />
      </div>
    );
  } else if (isLeft && !enableLeftRail) {
    content = (
      <div className="flex h-full w-full flex-col bg-container border shadow-sm lg:rounded-md overflow-hidden">
        <div className="flex items-center justify-end p-2 border-b bg-background">
          <div className="flex items-center gap-2">
            <div className="w-px h-4 bg-border" />
            <LeftSidebarTrigger className="h-6 w-6" />
          </div>
        </div>
      </div>
    );
  } else if (isLeft) {
    content = (
      <div className="flex h-full w-full flex-col bg-container border shadow-sm lg:rounded-md overflow-hidden">
        <div className="flex items-center justify-end p-2 border-b bg-background">
          <div className="flex items-center gap-2">
            <div className="w-px h-4 bg-border" />
            <LeftSidebarTrigger className="h-6 w-6" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          <TooltipProvider>
            <div className="flex flex-col items-center gap-1 px-2">
              {navigationItems.map((item) => (
                <Tooltip key={item.name} delayDuration={300}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      asChild
                    >
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span className="sr-only">{item.name}</span>
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="ml-2">
                    <p>{item.name}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
        </div>

        <div className="p-2 border-t">
          <div className="flex flex-col items-center gap-1">
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <span className="sr-only">Help</span>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="ml-2">
                  <p>Help</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <a
                      href="https://github.com/pwhermanson/heyspex"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="sr-only">GitHub</span>
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="ml-2">
                  <p>GitHub</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    );
  } else {
    content = (
      <div className="flex h-full w-full flex-col bg-container border shadow-sm lg:rounded-md overflow-hidden">
        <div className="flex items-center justify-start p-2 border-b bg-background">
          <RightSidebarTrigger />
        </div>
      </div>
    );
  }

  return (
    <div
      data-resizable-sidebar={side}
      className={cn(
        'relative h-full w-full hidden md:flex flex-col',
        className
      )}
    >
      {content}
    </div>
  );
}
