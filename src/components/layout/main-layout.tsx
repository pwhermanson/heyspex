'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import type { CommandContext } from '@/src/lib/lib/command-palette/registry';
import { PaletteProvider } from '@/src/components/command-palette/palette-provider';
import { WorkspaceZoneAPanelA } from '@/src/components/layout/workspace-zone-a-panels/workspace-zone-a-panel-a';
import { WorkspaceZoneAPanelC } from '@/src/components/layout/workspace-zone-a-panels/workspace-zone-a-panel-c';
import { WorkspaceZoneAPanelCProvider } from '@/src/components/layout/workspace-zone-a-panels/workspace-zone-a-panel-c-provider';
import {
   WorkspaceZoneAPanelsProvider,
   useResizablePanel,
} from '@/src/components/layout/workspace-zone-a-panels/workspace-zone-a-panels-provider';

import { PanelProvider } from '@/src/components/ui/sidebar';
import { CreateIssueModalProvider } from '@/src/components/shared/issues/create-issue-modal-provider';
import { GlobalControlBar } from '@/src/components/layout/global-control-bar';
import { WorkspaceZoneB } from '@/src/components/layout/workspace-zone-b';
import { WorkspaceZoneBContainer } from '@/src/components/layout/workspace-zone-b-container';
import { WorkspaceZoneAContainer } from '@/src/components/layout/workspace-zone-a-container';
import { SplitHandle } from '@/src/components/layout/split-handle';
import { PanelControlBar } from '@/src/components/layout/panel-control-bar';
import { WorkspaceZoneADragHandle } from '@/src/components/layout/workspace-zone-a-drag-handle';
import { useFeatureFlag } from '@/src/lib/hooks/use-feature-flag';
import { cn } from '@/src/lib/lib/utils';
import { CommandPaletteModal } from '@/src/components/command-palette/command-palette-modal';
import { useCommandPaletteShortcuts } from '@/src/lib/lib/command-palette/use-command-palette-shortcuts';
import { useWorkspaceInitialization } from '@/src/lib/hooks/use-workspace-initialization';
import { StableAppShell } from '@/src/components/layout/stable-app-shell';
// Import panel commands to register them
import '@/src/lib/lib/command-palette/commands/panel-commands';
// Import workspace commands to register them
import '@/src/lib/lib/command-palette/commands/workspace-commands';

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

const LayoutGrid = React.memo(function LayoutGrid({ children, header }: MainLayoutProps) {
   const {
      isDragging,
      workspaceZoneB,
      setWorkspaceZoneBMode,
      // setWorkspaceZoneBHeight, // Unused for now
      isHydrated,
      isMainFullscreen,
      centerBottomSplit,
      setCenterBottomSplit,
      isWorkspaceZoneAVisible,
      isControlBarVisible,
      workspaceZoneA,
      workspaceZoneAMode,
      setWorkspaceZoneAMode,
   } = useResizablePanel();

   // Initialize workspace data
   useWorkspaceInitialization();

   // Initialize command palette keyboard shortcuts
   useCommandPaletteShortcuts();

   const isControlBarEnabled = useFeatureFlag('enableGlobalControlBar');
   const isBottomSplitEnabled = useFeatureFlag('enableBottomSplit');
   const safeBottomEnabled = isHydrated && isBottomSplitEnabled;

   // Calculate grid rows based on workspace zone B mode and visibility
   const getGridRows = () => {
      if (workspaceZoneAMode === 'fullscreen') {
         return '1fr';
      }

      const rows: string[] = [];

      if (isControlBarEnabled && isControlBarVisible) {
         rows.push('var(--control-bar-height, 56px)');
      }

      rows.push('1fr');

      const shouldReserveBottomRow =
         safeBottomEnabled &&
         workspaceZoneB.mode === 'push' &&
         workspaceZoneB.isVisible &&
         !isMainFullscreen;

      if (shouldReserveBottomRow) {
         rows.push('var(--bottombar-height, 40px)');
      }

      return rows.join(' ');
   };

   return (
      <div
         className="h-svh w-full grid relative"
         style={{ gridTemplateRows: getGridRows() }}
         data-bottom-mode={safeBottomEnabled ? workspaceZoneB.mode : undefined}
      >
         {/* App Shell - Background layer that everything renders on top of */}
         <div className="absolute inset-0 z-0">
            <StableAppShell />
         </div>

         {/* GlobalControlBar - spans full width */}
         {isControlBarEnabled && isControlBarVisible && <GlobalControlBar />}

         {/* Main Area - contains the three-panel layout - only render when Workspace Zone A is visible */}
         {workspaceZoneAMode !== 'hidden' && (
            <div className="relative overflow-hidden z-10">
               {/* Workspace Zone A - Three-panel grid */}
               <WorkspaceZoneAContainer isVisible={true} mode={workspaceZoneAMode}>
                  <div
                     className={cn(
                        'grid w-full h-full overflow-hidden relative',
                        !isDragging &&
                           'transition-[grid-template-columns] layout-transition-long motion-reduce:transition-none'
                     )}
                     style={{
                        gridTemplateColumns:
                           workspaceZoneAMode === 'fullscreen'
                              ? '0px 1fr 0px'
                              : `${workspaceZoneA.leftPanel.width}px 1fr ${workspaceZoneA.rightPanel.width}px`,
                        gridTemplateAreas: '"sidebar main right-sidebar"',
                     }}
                  >
                     {/* Left Sidebar Area */}
                     <div
                        className={cn(
                           'overflow-hidden lg:pt-2 lg:pb-2 lg:pl-2 lg:pr-1',
                           workspaceZoneAMode === 'fullscreen' && 'p-0'
                        )}
                        style={{ gridArea: 'sidebar' }}
                     >
                        <WorkspaceZoneAPanelA />
                     </div>

                     {/* Main Content Area */}
                     <div
                        className={cn(
                           'overflow-hidden lg:pt-2 lg:pb-2 lg:pl-1 lg:pr-1 w-full relative',
                           workspaceZoneAMode === 'fullscreen' && 'p-0'
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
                              <PanelControlBar />
                              {header}
                              <div
                                 className={cn(
                                    'overflow-auto w-full',
                                    workspaceZoneAMode === 'fullscreen'
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
                                       onDragStart={undefined}
                                       onDragEnd={undefined}
                                       isDragging={isDragging}
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
                           workspaceZoneAMode === 'fullscreen' && 'p-0'
                        )}
                        style={{ gridArea: 'right-sidebar' }}
                     >
                        <WorkspaceZoneAPanelC />
                     </div>

                     {/* Drag Handle between Panel A and Panel B */}
                     <WorkspaceZoneADragHandle side="left" />

                     {/* Drag Handle between Panel B and Panel C */}
                     <WorkspaceZoneADragHandle side="right" />
                  </div>
               </WorkspaceZoneAContainer>

               {/* Drag handles removed - will be re-implemented */}
            </div>
         )}

         {/* Workspace Zone B - Unified Container */}
         {isBottomSplitEnabled && isHydrated && workspaceZoneB.isVisible && (
            <WorkspaceZoneBContainer mode={workspaceZoneB.mode} height={workspaceZoneB.height}>
               <WorkspaceZoneB
                  mode={workspaceZoneB.mode}
                  onModeChange={isHydrated ? setWorkspaceZoneBMode : () => {}}
                  height={workspaceZoneB.height}
                  isOverlay={workspaceZoneB.mode === 'overlay'}
                  onClose={isHydrated ? () => setWorkspaceZoneAMode('hidden') : undefined}
                  onDragStart={undefined}
                  isDragging={isDragging}
                  isWorkspaceZoneAHidden={!isWorkspaceZoneAVisible}
               />
            </WorkspaceZoneBContainer>
         )}

         {/* Command Palette Modal */}
         <CommandPaletteModal />
      </div>
   );
});

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
         <WorkspaceZoneAPanelsProvider>
            <PanelProvider>
               <WorkspaceZoneAPanelCProvider>
                  <CreateIssueModalProvider />
                  <LayoutGrid header={header} headersNumber={headersNumber}>
                     {children}
                  </LayoutGrid>
               </WorkspaceZoneAPanelCProvider>
            </PanelProvider>
         </WorkspaceZoneAPanelsProvider>
      </PaletteProvider>
   );
}
