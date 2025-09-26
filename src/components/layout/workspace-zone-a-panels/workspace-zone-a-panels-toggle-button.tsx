'use client';

import * as React from 'react';
import { Button } from '@/src/components/ui/button';
import { PanelLeft, PanelRight, PanelLeftClose, PanelRightClose } from 'lucide-react';
import { useResizablePanel } from './workspace-zone-a-panels-provider';
import { cn } from '@/src/lib/lib/utils';

interface WorkspaceZoneAPanelsToggleButtonProps {
   side: 'left' | 'right';
   variant?: 'default' | 'ghost' | 'outline';
   size?: 'default' | 'sm' | 'lg' | 'icon';
   className?: string;
   showLabel?: boolean;
}

export function WorkspaceZoneAPanelsToggleButton({
   side,
   variant = 'ghost',
   size = 'icon',
   className,
   showLabel = false,
}: WorkspaceZoneAPanelsToggleButtonProps) {
   const { leftPanel, rightPanel, toggleLeftPanel, toggleRightPanel } = useResizablePanel();

   const panelState = side === 'left' ? leftPanel : rightPanel;
   const toggle = side === 'left' ? toggleLeftPanel : toggleRightPanel;

   // Determine which icon to show based on side and state
   const getIcon = () => {
      if (side === 'left') {
         return panelState.isOpen ? PanelLeftClose : PanelLeft;
      } else {
         return panelState.isOpen ? PanelRightClose : PanelRight;
      }
   };

   const Icon = getIcon();
   const label =
      side === 'left'
         ? panelState.isOpen
            ? 'Hide Workspace Zone A Panel A'
            : 'Show Workspace Zone A Panel A'
         : panelState.isOpen
           ? 'Hide Workspace Zone A Panel C'
           : 'Show Workspace Zone A Panel C';

   // Handle keyboard shortcuts
   // React.useEffect(() => {
   //    const handleKeyDown = (e: KeyboardEvent) => {
   //       // Cmd/Ctrl + B for left sidebar
   //       if (side === 'left' && e.key === 'b' && (e.metaKey || e.ctrlKey) && !e.shiftKey) {
   //          e.preventDefault();
   //          toggle();
   //       }
   //       // Cmd/Ctrl + Shift + B for right sidebar
   //       if (side === 'right' && e.key === 'B' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
   //          e.preventDefault();
   //          toggle();
   //       }
   //    };

   //    document.addEventListener('keydown', handleKeyDown);
   //    return () => document.removeEventListener('keydown', handleKeyDown);
   // }, [side, toggle]);

   return (
      <Button
         variant={variant}
         size={size}
         onClick={toggle}
         className={cn(
            'transition-all layout-transition-short motion-reduce:transition-none',
            className
         )}
         title={label}
         aria-label={label}
      >
         <Icon className="h-4 w-4" />
         {showLabel && (
            <span className="ml-2">
               {panelState.isOpen ? 'Hide' : 'Show'} {side} panel
            </span>
         )}
      </Button>
   );
}
