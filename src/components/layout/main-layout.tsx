'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import type { CommandContext } from '@/src/lib/lib/command-palette/registry';
import { PaletteProvider } from '@/src/components/command-palette/palette-provider';
import { AppSidebar } from '@/src/components/layout/sidebar/app-sidebar';
import { RightSidebar } from '@/src/components/layout/sidebar/right-sidebar';
import { RightSidebarProvider } from '@/src/components/layout/sidebar/right-sidebar-provider';
import {
   ResizableSidebarProvider,
   useResizableSidebar,
} from '@/src/components/layout/sidebar/resizable-sidebar-provider';

import { SidebarProvider } from '@/src/components/ui/sidebar';
import { CreateIssueModalProvider } from '@/src/components/shared/issues/create-issue-modal-provider';
import { TopBar } from '@/src/components/layout/top-bar';
import { BottomBar } from '@/src/components/layout/bottom-bar';
import { WorkspaceZoneBContainer } from '@/src/components/layout/workspace-zone-b-container';
import { SplitHandle } from '@/src/components/layout/split-handle';
import { PanelControlBar } from '@/src/components/layout/panel-control-bar';
import { SidebarDragHandle } from '@/src/components/layout/sidebar/sidebar-drag-handle';
import { useFeatureFlag } from '@/src/lib/hooks/use-feature-flag';
import { cn } from '@/src/lib/lib/utils';
import { CommandPaletteModal } from '@/src/components/command-palette/command-palette-modal';
import { useCommandPaletteShortcuts } from '@/src/lib/lib/command-palette/use-command-palette-shortcuts';
// Import panel commands to register them
import '@/src/lib/lib/command-palette/commands/panel-commands';

interface MainLayoutProps {
   children: React.ReactNode;
   header?: React.ReactNode;
   headersNumber?: 1 | 2;
}

const DEFAULT_PALETTE_USER = {
   id: 'demo-user',
   role: 'Admin',
} as const;

// const PUSH_MAX_HEIGHT_RATIO = 0.5; // Unused for now

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

function LayoutGrid({ children, header }: MainLayoutProps) {
   const {
      isDragging,
      bottomBar,
      setBottomBarMode,
      // setBottomBarHeight, // Unused for now
      isHydrated,
      isMainFullscreen,
      centerBottomSplit,
      setCenterBottomSplit,
      leftSidebar,
      rightSidebar,
      isWorkspaceZoneAVisible,
   } = useResizableSidebar();

   // Initialize command palette keyboard shortcuts
   useCommandPaletteShortcuts();

   const isTopBarEnabled = useFeatureFlag('enableTopBar');
   const isBottomSplitEnabled = useFeatureFlag('enableBottomSplit');
   const safeBottomEnabled = isHydrated && isBottomSplitEnabled;

   // Calculate grid rows based on bottom bar mode and visibility
   const getGridRows = () => {
      if (isMainFullscreen) {
         return '1fr';
      }

      const rows: string[] = [];

      if (isTopBarEnabled) {
         rows.push('var(--topbar-height, 56px)');
      }

      rows.push('1fr');

      const shouldReserveBottomRow =
         safeBottomEnabled && bottomBar.mode === 'push' && bottomBar.isVisible && !isMainFullscreen;

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
            {/* Workspace Zone A - Three-panel grid */}
            {isWorkspaceZoneAVisible ? (
               <div
                  className={cn(
                     'grid w-full h-full overflow-hidden',
                     !isDragging &&
                        'transition-[grid-template-columns] layout-transition-long motion-reduce:transition-none'
                  )}
                  style={{
                     gridTemplateColumns: 'var(--grid-template-columns, 244px 1fr 0px)',
                     gridTemplateAreas: '"sidebar main right-sidebar"',
                  }}
               >
                  {/* Left Sidebar Area */}
                  <div
                     className={cn(
                        'overflow-hidden lg:pt-2 lg:pb-2 lg:pl-2 lg:pr-1',
                        isMainFullscreen && 'p-0'
                     )}
                     style={{ gridArea: 'sidebar' }}
                  >
                     <AppSidebar />
                  </div>

                  {/* Main Content Area */}
                  <div
                     className={cn(
                        'overflow-hidden lg:pt-2 lg:pb-2 lg:pl-1 lg:pr-1 w-full relative',
                        isMainFullscreen && 'p-0'
                     )}
                     style={{ gridArea: 'main' }}
                  >
                     <div
                        className={cn(
                           'overflow-hidden workspace-zone-a-panel h-full',
                           !isMainFullscreen && 'lg:border lg:rounded-md',
                           centerBottomSplit > 0
                              ? 'grid'
                              : 'flex flex-col items-center justify-start'
                        )}
                        style={
                           centerBottomSplit > 0
                              ? {
                                   gridTemplateRows: `1fr var(--center-bottom-split, ${centerBottomSplit}px)`,
                                   gridTemplateAreas: '"center" "bottom"',
                                }
                              : undefined
                        }
                        data-main-container
                     >
                        {/* Center Content Area */}
                        <div
                           className={cn(
                              'overflow-hidden',
                              centerBottomSplit > 0
                                 ? 'flex flex-col items-center justify-start w-full'
                                 : 'contents'
                           )}
                           style={centerBottomSplit > 0 ? { gridArea: 'center' } : undefined}
                        >
                           {!isMainFullscreen && <PanelControlBar />}
                           {header}
                           <div
                              className={cn(
                                 'overflow-auto w-full',
                                 isMainFullscreen
                                    ? 'h-full'
                                    : isEmptyHeader(header)
                                      ? 'h-full'
                                      : centerBottomSplit > 0
                                        ? 'h-full'
                                        : 'h-full'
                              )}
                           >
                              {children}
                           </div>
                        </div>

                        {/* Split Handle - only rendered when split is active */}
                        {centerBottomSplit > 0 && (
                           <div className="relative">
                              <div className="absolute inset-x-0 -top-1 z-10">
                                 <SplitHandle
                                    currentHeight={centerBottomSplit}
                                    minHeight={0}
                                    maxHeight={Math.max(100, Math.round(800 * 0.5))}
                                    onHeightChange={setCenterBottomSplit}
                                    onDragStart={() => {}}
                                    onDragEnd={() => {}}
                                    isDragging={false}
                                    aria-label="Adjust center-bottom split"
                                 />
                              </div>
                           </div>
                        )}

                        {/* Bottom Content Area - only rendered when split is active */}
                        {centerBottomSplit > 0 && (
                           <div
                              className="overflow-hidden border-t bg-muted/30"
                              style={{ gridArea: 'bottom' }}
                           >
                              <div className="h-full overflow-auto p-4">
                                 <div className="text-sm text-muted-foreground">
                                    <p>Bottom split area</p>
                                    <p className="mt-2">
                                       Height: <strong>{centerBottomSplit}px</strong>
                                    </p>
                                 </div>
                              </div>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Right Sidebar Area */}
                  <div
                     className={cn(
                        'overflow-hidden lg:pt-2 lg:pb-2 lg:pl-1 lg:pr-2',
                        isMainFullscreen && 'p-0'
                     )}
                     style={{ gridArea: 'right-sidebar' }}
                  >
                     <RightSidebar />
                  </div>
               </div>
            ) : null}

            {/* Drag handles positioned between sections */}
            {!isMainFullscreen && isWorkspaceZoneAVisible && (
               <>
                  {/* Left drag handle - between Section A and B - only show when left sidebar is open */}
                  {leftSidebar.isOpen && (
                     <div
                        className="absolute top-0 bottom-0 w-1 z-50 pointer-events-auto"
                        style={{
                           left: 'var(--left-width, 244px)',
                           transform: 'translateX(-50%)',
                        }}
                     >
                        <SidebarDragHandle side="left" />
                     </div>
                  )}

                  {/* Right drag handle - between Section B and C - only show when right sidebar is open */}
                  {rightSidebar.isOpen && (
                     <div
                        className="absolute top-0 bottom-0 w-1 z-50 pointer-events-auto"
                        style={{
                           right: 'var(--right-width, 0px)',
                           transform: 'translateX(50%)',
                        }}
                     >
                        <SidebarDragHandle side="right" />
                     </div>
                  )}
               </>
            )}
         </div>

         {/* Workspace Zone B - Unified Container */}
         {isBottomSplitEnabled && isHydrated && !isMainFullscreen && bottomBar.isVisible && (
            <WorkspaceZoneBContainer mode={bottomBar.mode} height={bottomBar.height}>
               <BottomBar
                  mode={bottomBar.mode}
                  onModeChange={isHydrated ? setBottomBarMode : () => {}}
                  height={bottomBar.height}
                  isOverlay={bottomBar.mode === 'overlay'}
                  onDragStart={() => {}}
                  isDragging={false}
                  isWorkspaceZoneAHidden={!isWorkspaceZoneAVisible}
               />
            </WorkspaceZoneBContainer>
         )}

         {/* Command Palette Modal */}
         <CommandPaletteModal />
      </div>
   );
}

export default function MainLayout({ children, header, headersNumber = 2 }: MainLayoutProps) {
   const pathname = usePathname();
   const paletteContext = React.useMemo<CommandContext>(
      () => ({
         route: pathname ?? '/',
         user: DEFAULT_PALETTE_USER,
      }),
      [pathname]
   );

   return (
      <PaletteProvider context={paletteContext}>
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
      </PaletteProvider>
   );
}
