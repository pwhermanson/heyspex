'use client';

import * as React from 'react';
import { BottomBarModeToggle, type BottomBarMode } from './bottom-bar-mode-toggle';
import { Button } from '@/components/ui/button';
import { X, Minus, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useResizableSidebar } from '@/components/layout/sidebar/resizable-sidebar-provider';
import { BottomDragHandle } from '@/components/layout/bottom-drag-handle';

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

interface BottomBarProps {
   mode: BottomBarMode;
   onModeChange: (mode: BottomBarMode) => void;
   height: number;
   isOverlay?: boolean;
   onClose?: () => void;
   onMinimize?: () => void;
   className?: string;
   children?: React.ReactNode;
   // Drag functionality props
   onDragStart?: (e: React.MouseEvent) => void;
   isDragging?: boolean;
}

export function BottomBar({
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
}: BottomBarProps) {
   const isCollapsed = height <= 40; // Consider collapsed if height is 40px or less
   const {
      bottomBar: layoutBottomBar,
      setBottomBarHeight,
      setBottomBarMode,
   } = useResizableSidebar();

   // Section D layout state: 'full' | '2-split' | '3-split'
   const [sectionDLayout, setSectionDLayout] = React.useState<'full' | '2-split' | '3-split'>(
      'full'
   );

   const isClient = typeof window !== 'undefined';
   const [windowHeight, setWindowHeight] = React.useState(isClient ? window.innerHeight : 1000);

   const getMainTop = () => {
      if (!isClient) return 56;
      const el = document.querySelector('[data-main-container]') as HTMLElement | null;
      return el ? Math.round(el.getBoundingClientRect().top) : 56;
   };

   const pushMaxHeight = Math.max(40, Math.round(windowHeight * 0.5));
   const maxHeight =
      layoutBottomBar.mode === 'overlay'
         ? isClient
            ? Math.max(40, windowHeight - getMainTop())
            : height
         : pushMaxHeight;
   const isFull = height >= maxHeight - 1;

   const handleToggleFull = () => {
      const target = isFull ? 40 : maxHeight;
      // For push mode, stay in push mode when toggling full screen
      // For overlay mode, switch to push mode when expanding to full screen for consistency
      if (!isFull && layoutBottomBar.mode === 'push') {
         // Stay in push mode - no mode change needed
      } else if (!isFull && layoutBottomBar.mode === 'overlay') {
         setBottomBarMode('push');
      }
      setBottomBarHeight(target);
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
            'relative overflow-hidden bg-background border-t flex flex-col w-full',
            isOverlay ? 'shadow-lg border-x' : 'border-x rounded-t-lg', // Different styling for overlay vs push mode
            'pointer-events-auto', // Ensure mouse events work
            className
         )}
         style={{ height: `${height}px` }}
         role="contentinfo"
      >
         {/* Bottom Bar Header with Controls */}
         <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30 min-h-[40px]">
            <div className="flex items-center gap-3">
               <span className="text-sm font-medium text-foreground">
                  Output Panel {isOverlay && '(OVERLAY MODE)'}
               </span>
               {isOverlay && (
                  <span className="text-xs text-muted-foreground">
                     Pos: {layoutBottomBar?.overlayPosition || 0}px
                  </span>
               )}
            </div>

            <div className="flex items-center gap-2">
               {/* Layout Icons */}
               <div className="flex items-center gap-1 border-r border-border pr-2 mr-1">
                  <Button
                     variant={sectionDLayout === 'full' ? 'default' : 'ghost'}
                     size="icon"
                     className={cn(
                        'h-6 w-6',
                        sectionDLayout === 'full'
                           ? 'text-primary-foreground'
                           : 'text-muted-foreground hover:text-foreground'
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
                           : 'text-muted-foreground hover:text-foreground'
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
                           : 'text-muted-foreground hover:text-foreground'
                     )}
                     onClick={handle3SplitLayout}
                     aria-label="3-split layout"
                     title="3-split layout"
                  >
                     <Layout3SplitIcon className="h-3 w-4" />
                  </Button>
               </div>

               {/* Mode Toggle - moved to the right side */}
               <BottomBarModeToggle mode={mode} onChange={onModeChange} className="h-6" />

               {/* Fullscreen / Collapse Toggle */}
               <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleToggleFull}
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
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
                     className="h-6 w-6 text-muted-foreground hover:text-foreground"
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
                     className="h-6 w-6 text-muted-foreground hover:text-foreground"
                     aria-label="Close panel"
                  >
                     <X className="h-3 w-3" />
                  </Button>
               )}
            </div>
         </div>

         {/* Bottom Drag Handle - available in both overlay and push modes */}
         <BottomDragHandle onMouseDown={onDragStart} isDragging={isDragging} mode={mode} />

         {/* Bottom Bar Content - only show if not collapsed */}
         {!isCollapsed && (
            <div className="flex-1 overflow-auto">
               {children ? (
                  <div className="p-4">{children}</div>
               ) : (
                  <div className="h-full">
                     {sectionDLayout === 'full' && (
                        <div className="h-full p-4">
                           <div className="text-sm text-muted-foreground">
                              <p>Output panel - Full width layout</p>
                              <p className="mt-2">
                                 Mode: <strong className="capitalize">{mode}</strong> | Height:{' '}
                                 <strong>{height}px</strong>
                              </p>
                              <p className="mt-1 text-xs">
                                 Single content area spanning the full width of the panel.
                              </p>
                           </div>
                        </div>
                     )}

                     {sectionDLayout === '2-split' && (
                        <div className="h-full grid grid-cols-2 gap-4 p-4">
                           <div className="bg-muted/20 border rounded-lg p-3">
                              <div className="text-sm text-muted-foreground">
                                 <p className="font-medium">Section D2A</p>
                                 <p className="mt-1 text-xs">Left content area</p>
                              </div>
                           </div>
                           <div className="bg-muted/20 border rounded-lg p-3">
                              <div className="text-sm text-muted-foreground">
                                 <p className="font-medium">Section D2B</p>
                                 <p className="mt-1 text-xs">Right content area</p>
                              </div>
                           </div>
                        </div>
                     )}

                     {sectionDLayout === '3-split' && (
                        <div className="h-full grid grid-cols-3 gap-4 p-4">
                           <div className="bg-muted/20 border rounded-lg p-3">
                              <div className="text-sm text-muted-foreground">
                                 <p className="font-medium">Section D3A</p>
                                 <p className="mt-1 text-xs">Left content area</p>
                              </div>
                           </div>
                           <div className="bg-muted/20 border rounded-lg p-3">
                              <div className="text-sm text-muted-foreground">
                                 <p className="font-medium">Section D3B</p>
                                 <p className="mt-1 text-xs">Center content area</p>
                              </div>
                           </div>
                           <div className="bg-muted/20 border rounded-lg p-3">
                              <div className="text-sm text-muted-foreground">
                                 <p className="font-medium">Section D3C</p>
                                 <p className="mt-1 text-xs">Right content area</p>
                              </div>
                           </div>
                        </div>
                     )}
                  </div>
               )}
            </div>
         )}
      </div>
   );
}
