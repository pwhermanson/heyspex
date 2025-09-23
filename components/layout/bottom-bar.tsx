'use client';

import * as React from 'react';
import { BottomBarModeToggle, type BottomBarMode } from './bottom-bar-mode-toggle';
import { Button } from '@/components/ui/button';
import { X, Minus, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useResizableSidebar } from '@/components/layout/sidebar/resizable-sidebar-provider';
import { BottomDragHandle } from '@/components/layout/bottom-drag-handle';

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
               <div className="p-4">
                  {children || (
                     <div className="text-sm text-muted-foreground">
                        <p>Output panel content area</p>
                        <p className="mt-2">
                           Mode: <strong className="capitalize">{mode}</strong> | Height:{' '}
                           <strong>{height}px</strong>
                        </p>
                        <p className="mt-1 text-xs">
                           This area can be used for logs, terminal output, debugging info, or other
                           developer tools.
                        </p>
                     </div>
                  )}
               </div>
            </div>
         )}
      </div>
   );
}
