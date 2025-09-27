'use client';

import * as React from 'react';
import { WorkspaceZoneBModeToggle, type WorkspaceZoneBMode } from './workspace-zone-b-mode-toggle';
import { WorkspaceZoneBContent } from './workspace-zone-b-content';
import { Button } from '@/src/components/ui/button';
import { X, Minus, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/src/lib/lib/utils';
import { useResizablePanel } from '@/src/components/layout/workspace-zone-a-panels/workspace-zone-a-panels-provider';
import { WorkspaceZoneBDragHandle } from '@/src/components/layout/workspace-zone-b-drag-handle';
import {
   ResizablePanelGroup,
   ResizablePanel,
   ResizableHandle,
} from '@/src/components/ui/resizable';

// Layout icons for Section D
const LayoutFullIcon = ({ className }: { className?: string }) => (
   <svg viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect
         x="1"
         y="1"
         width="14"
         height="10"
         rx="1"
         stroke="currentColor"
         strokeWidth="1.5"
         fill="none"
      />
   </svg>
);

const Layout2SplitIcon = ({ className }: { className?: string }) => (
   <svg viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect
         x="1"
         y="1"
         width="14"
         height="10"
         rx="1"
         stroke="currentColor"
         strokeWidth="1.5"
         fill="none"
      />
      <line x1="8" y1="1" x2="8" y2="11" stroke="currentColor" strokeWidth="1.5" />
   </svg>
);

const Layout3SplitIcon = ({ className }: { className?: string }) => (
   <svg viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect
         x="1"
         y="1"
         width="14"
         height="10"
         rx="1"
         stroke="currentColor"
         strokeWidth="1.5"
         fill="none"
      />
      <line x1="5.67" y1="1" x2="5.67" y2="11" stroke="currentColor" strokeWidth="1.5" />
      <line x1="10.33" y1="1" x2="10.33" y2="11" stroke="currentColor" strokeWidth="1.5" />
   </svg>
);

interface WorkspaceZoneBProps {
   mode: WorkspaceZoneBMode;
   onModeChange: (mode: WorkspaceZoneBMode) => void;
   height: number;
   isOverlay?: boolean;
   onClose?: () => void;
   onMinimize?: () => void;
   className?: string;
   children?: React.ReactNode;
   // Drag functionality props
   onDragStart?: (e: React.MouseEvent) => void;
   isDragging?: boolean;
   // Workspace Zone A visibility
   isWorkspaceZoneAHidden?: boolean;
}

export function WorkspaceZoneB({
   mode,
   onModeChange,
   height,
   isOverlay = false,
   onClose,
   onMinimize,
   className,
   children,
   onDragStart,
   isDragging = false,
   isWorkspaceZoneAHidden = false,
}: WorkspaceZoneBProps) {
   const isCollapsed = height <= 40; // Consider collapsed if height is 40px or less
   const { setWorkspaceZoneBHeight, isControlBarVisible } = useResizablePanel();

   // When Workspace Zone A is hidden, force overlay mode
   const effectiveMode = isWorkspaceZoneAHidden ? 'overlay' : mode;

   // Automatically switch to overlay mode when Workspace Zone A is hidden
   React.useEffect(() => {
      if (isWorkspaceZoneAHidden && mode !== 'overlay') {
         onModeChange('overlay');
      }
   }, [isWorkspaceZoneAHidden, mode, onModeChange]);

   // Section D layout state: 'full' | '2-split' | '3-split'
   const [sectionDLayout, setSectionDLayout] = React.useState<'full' | '2-split' | '3-split'>(
      'full'
   );

   const isClient = typeof window !== 'undefined';
   const [windowHeight, setWindowHeight] = React.useState(isClient ? window.innerHeight : 1000);

   const getMainTop = React.useCallback(() => {
      if (!isClient) return 56;
      const el = document.querySelector('[data-main-container]') as HTMLElement | null;
      return el ? Math.round(el.getBoundingClientRect().top) : 56;
   }, [isClient]);

   const pushMaxHeight = Math.max(40, Math.round(windowHeight * 0.5));
   const maxHeight =
      effectiveMode === 'overlay'
         ? isClient
            ? Math.max(40, windowHeight - getMainTop())
            : height
         : pushMaxHeight;
   const isFull = height >= maxHeight - 1;

   // Listen for control bar visibility changes and recalculate height for overlay mode
   React.useEffect(() => {
      if (effectiveMode !== 'overlay' || !isClient) return;

      // Calculate the new max height based on current control bar visibility
      const newMaxHeight = Math.max(40, windowHeight - getMainTop());

      // If we're currently at full height, update to the new max height
      // to take advantage of the additional space when control bar visibility changes
      if (height >= maxHeight - 1) {
         setWorkspaceZoneBHeight(newMaxHeight);
      }
   }, [
      isControlBarVisible,
      effectiveMode,
      isClient,
      windowHeight,
      height,
      maxHeight,
      setWorkspaceZoneBHeight,
      getMainTop,
   ]);

   const handleToggleFull = () => {
      const target = isFull ? 40 : maxHeight;
      // Preserve the current mode when toggling full screen
      // Both push and overlay modes should maintain their mode when expanding/collapsing
      setWorkspaceZoneBHeight(target);
   };

   // Layout handlers for Section D
   const handleFullWidthLayout = () => {
      setSectionDLayout('full');
   };

   const handle2SplitLayout = () => {
      setSectionDLayout('2-split');
   };

   const handle3SplitLayout = () => {
      setSectionDLayout('3-split');
   };

   // Handle window resize to keep maxHeight responsive
   React.useEffect(() => {
      if (!isClient) return;

      const handleWindowResize = () => {
         setWindowHeight(window.innerHeight);
      };

      window.addEventListener('resize', handleWindowResize);
      return () => window.removeEventListener('resize', handleWindowResize);
   }, [isClient]);

   return (
      <div
         className={cn(
            'relative overflow-hidden workspace-zone-b flex flex-col w-full',
            'z-20',
            isOverlay ? 'shadow-lg border-x' : 'border-x rounded-t-lg',
            'pointer-events-auto',
            className
         )}
         style={{
            height: `${height}px`,
            backgroundColor: isOverlay ? 'var(--workspace-zone-b-bg)' : undefined,
            background: isOverlay ? 'var(--workspace-zone-b-bg)' : undefined,
         }}
         role="contentinfo"
      >
         {/* Workspace Zone B Header with Controls */}
         <div className="workspace-zone-control-bar flex items-center justify-between px-4 py-2 border-b min-h-[40px] bg-muted">
            <div className="flex items-center gap-3">
               <span className="text-xs text-muted-foreground">Workspace Zone B</span>
            </div>

            <div className="flex items-center gap-2">
               {/* Layout Icons */}
               <div className="flex items-center gap-1 border-r border-gray-200 dark:border-gray-700 pr-2 mr-1">
                  <Button
                     variant={sectionDLayout === 'full' ? 'default' : 'ghost'}
                     size="icon"
                     className={cn(
                        'h-6 w-6',
                        sectionDLayout === 'full'
                           ? 'text-primary-foreground'
                           : 'text-muted-foreground hover:!text-icon-hover'
                     )}
                     onClick={handleFullWidthLayout}
                     aria-label="Full width layout"
                     title="Full width layout"
                  >
                     <LayoutFullIcon className="h-3 w-4" />
                  </Button>
                  <Button
                     variant={sectionDLayout === '2-split' ? 'default' : 'ghost'}
                     size="icon"
                     className={cn(
                        'h-6 w-6',
                        sectionDLayout === '2-split'
                           ? 'text-primary-foreground'
                           : 'text-muted-foreground hover:!text-icon-hover'
                     )}
                     onClick={handle2SplitLayout}
                     aria-label="2-split layout"
                     title="2-split layout"
                  >
                     <Layout2SplitIcon className="h-3 w-4" />
                  </Button>
                  <Button
                     variant={sectionDLayout === '3-split' ? 'default' : 'ghost'}
                     size="icon"
                     className={cn(
                        'h-6 w-6',
                        sectionDLayout === '3-split'
                           ? 'text-primary-foreground'
                           : 'text-muted-foreground hover:!text-icon-hover'
                     )}
                     onClick={handle3SplitLayout}
                     aria-label="3-split layout"
                     title="3-split layout"
                  >
                     <Layout3SplitIcon className="h-3 w-4" />
                  </Button>
               </div>

               {/* Mode Toggle - hidden when Workspace Zone A is hidden */}
               {!isWorkspaceZoneAHidden && (
                  <WorkspaceZoneBModeToggle mode={mode} onChange={onModeChange} className="h-6" />
               )}

               {/* Fullscreen / Collapse Toggle */}
               <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleToggleFull}
                  className="h-6 w-6 text-muted-foreground hover:!text-icon-hover"
                  aria-label={isFull ? 'Collapse panel' : 'Fullscreen panel'}
                  title={isFull ? 'Collapse' : 'Fullscreen'}
               >
                  {isFull ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
               </Button>

               {/* Minimize Button */}
               {onMinimize && (
                  <Button
                     variant="ghost"
                     size="icon"
                     onClick={onMinimize}
                     className="h-6 w-6 text-muted-foreground hover:!text-icon-hover"
                     aria-label="Minimize panel"
                  >
                     <Minus className="h-3 w-3" />
                  </Button>
               )}

               {/* Close Button */}
               {onClose && (
                  <Button
                     variant="ghost"
                     size="icon"
                     onClick={onClose}
                     className="h-6 w-6 text-muted-foreground hover:!text-icon-hover"
                     aria-label="Close panel"
                  >
                     <X className="h-3 w-3" />
                  </Button>
               )}
            </div>
         </div>

         {/* Workspace Zone B Drag Handle - available in both overlay and push modes */}
         <WorkspaceZoneBDragHandle
            onMouseDown={onDragStart}
            isDragging={isDragging}
            mode={effectiveMode}
         />

         {/* Workspace Zone B Content - only show if not collapsed */}
         {!isCollapsed && (
            <div className="flex-1 overflow-auto">
               {children ? (
                  <div className="p-4">{children}</div>
               ) : (
                  <div className="h-full">
                     {sectionDLayout === 'full' && <WorkspaceZoneBContent />}

                     {sectionDLayout === '2-split' && (
                        <div className="h-full">
                           <ResizablePanelGroup
                              direction="horizontal"
                              autoSaveId="section-d-2-split"
                              className="h-full"
                           >
                              <ResizablePanel defaultSize={50} minSize={5}>
                                 <div className="bg-muted/20 border h-full overflow-hidden">
                                    <div className="h-full overflow-y-auto">
                                       <div className="p-4 space-y-3">
                                          <div className="p-2 bg-background/50 rounded border">
                                             <p className="text-sm font-medium line-clamp-1">
                                                Section D2A
                                             </p>
                                             <p className="text-xs text-muted-foreground line-clamp-1">
                                                Left content area - resizes responsively
                                             </p>
                                          </div>

                                          {/* Sample responsive content */}
                                          <div className="space-y-2">
                                             {Array.from({ length: 10 }, (_, i) => (
                                                <div
                                                   key={i}
                                                   className="p-2 bg-background/50 rounded border"
                                                >
                                                   <p className="text-xs font-medium line-clamp-1">
                                                      Item {i + 1}
                                                   </p>
                                                   <p className="text-xs text-muted-foreground line-clamp-1">
                                                      Content adapts to width changes
                                                   </p>
                                                </div>
                                             ))}
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                              </ResizablePanel>
                              <ResizableHandle withHandle />
                              <ResizablePanel defaultSize={50} minSize={5}>
                                 <div className="bg-muted/20 border h-full overflow-hidden">
                                    <div className="h-full overflow-y-auto">
                                       <div className="p-4 space-y-3">
                                          <div className="p-2 bg-background/50 rounded border">
                                             <p className="text-sm font-medium line-clamp-1">
                                                Section D2B
                                             </p>
                                             <p className="text-xs text-muted-foreground line-clamp-1">
                                                Right content area - resizes responsively
                                             </p>
                                          </div>

                                          {/* Sample responsive content */}
                                          <div className="space-y-2">
                                             {Array.from({ length: 15 }, (_, i) => (
                                                <div
                                                   key={i}
                                                   className="p-2 bg-background/50 rounded border"
                                                >
                                                   <p className="text-xs font-medium line-clamp-1">
                                                      Item {i + 1}
                                                   </p>
                                                   <p className="text-xs text-muted-foreground line-clamp-1">
                                                      Content adapts to width changes
                                                   </p>
                                                </div>
                                             ))}
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                              </ResizablePanel>
                           </ResizablePanelGroup>
                        </div>
                     )}

                     {sectionDLayout === '3-split' && (
                        <div className="h-full">
                           <ResizablePanelGroup
                              direction="horizontal"
                              autoSaveId="section-d-3-split"
                              className="h-full"
                           >
                              <ResizablePanel defaultSize={33.33} minSize={3.75}>
                                 <div className="bg-muted/20 border h-full overflow-hidden">
                                    <div className="h-full overflow-y-auto">
                                       <div className="p-3 space-y-2">
                                          <div className="p-1.5 bg-background/50 rounded text-xs">
                                             <p className="font-medium line-clamp-1">Section D3A</p>
                                             <p className="text-muted-foreground line-clamp-1">
                                                Left panel - responsive
                                             </p>
                                          </div>

                                          {/* Sample responsive content */}
                                          <div className="space-y-1">
                                             {Array.from({ length: 8 }, (_, i) => (
                                                <div
                                                   key={i}
                                                   className="p-1.5 bg-background/50 rounded text-xs"
                                                >
                                                   <p className="font-medium line-clamp-1">
                                                      Item {i + 1}
                                                   </p>
                                                   <p className="text-muted-foreground line-clamp-1">
                                                      Adapts to width
                                                   </p>
                                                </div>
                                             ))}
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                              </ResizablePanel>
                              <ResizableHandle withHandle />
                              <ResizablePanel defaultSize={33.33} minSize={3.75}>
                                 <div className="bg-muted/20 border h-full overflow-hidden">
                                    <div className="h-full overflow-y-auto">
                                       <div className="p-3 space-y-2">
                                          <div className="p-1.5 bg-background/50 rounded text-xs">
                                             <p className="font-medium line-clamp-1">Section D3B</p>
                                             <p className="text-muted-foreground line-clamp-1">
                                                Center panel - responsive
                                             </p>
                                          </div>

                                          {/* Sample responsive content */}
                                          <div className="space-y-1">
                                             {Array.from({ length: 12 }, (_, i) => (
                                                <div
                                                   key={i}
                                                   className="p-1.5 bg-background/50 rounded text-xs"
                                                >
                                                   <p className="font-medium line-clamp-1">
                                                      Item {i + 1}
                                                   </p>
                                                   <p className="text-muted-foreground line-clamp-1">
                                                      Adapts to width
                                                   </p>
                                                </div>
                                             ))}
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                              </ResizablePanel>
                              <ResizableHandle withHandle />
                              <ResizablePanel defaultSize={33.34} minSize={3.75}>
                                 <div className="bg-muted/20 border h-full overflow-hidden">
                                    <div className="h-full overflow-y-auto">
                                       <div className="p-3 space-y-2">
                                          <div className="p-1.5 bg-background/50 rounded text-xs">
                                             <p className="font-medium line-clamp-1">Section D3C</p>
                                             <p className="text-muted-foreground line-clamp-1">
                                                Right panel - responsive
                                             </p>
                                          </div>

                                          {/* Sample responsive content */}
                                          <div className="space-y-1">
                                             {Array.from({ length: 10 }, (_, i) => (
                                                <div
                                                   key={i}
                                                   className="p-1.5 bg-background/50 rounded text-xs"
                                                >
                                                   <p className="font-medium line-clamp-1">
                                                      Item {i + 1}
                                                   </p>
                                                   <p className="text-muted-foreground line-clamp-1">
                                                      Adapts to width
                                                   </p>
                                                </div>
                                             ))}
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                              </ResizablePanel>
                           </ResizablePanelGroup>
                        </div>
                     )}
                  </div>
               )}
            </div>
         )}
      </div>
   );
}
