'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { PanelLeft, PanelRight, PanelLeftClose, PanelRightClose } from 'lucide-react';
import { useResizableSidebar } from './resizable-sidebar-provider';
import { cn } from '@/lib/utils';

interface SidebarToggleButtonProps {
  side: 'left' | 'right';
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showLabel?: boolean;
}

export function SidebarToggleButton({
  side,
  variant = 'ghost',
  size = 'icon',
  className,
  showLabel = false,
}: SidebarToggleButtonProps) {
  const {
    leftSidebar,
    rightSidebar,
    toggleLeftSidebar,
    toggleRightSidebar,
  } = useResizableSidebar();

  const sidebarState = side === 'left' ? leftSidebar : rightSidebar;
  const toggle = side === 'left' ? toggleLeftSidebar : toggleRightSidebar;

  // Determine which icon to show based on side and state
  const getIcon = () => {
    if (side === 'left') {
      return sidebarState.isOpen ? PanelLeftClose : PanelLeft;
    } else {
      return sidebarState.isOpen ? PanelRightClose : PanelRight;
    }
  };

  const Icon = getIcon();
  const label = side === 'left'
    ? (sidebarState.isOpen ? 'Hide left sidebar' : 'Show left sidebar')
    : (sidebarState.isOpen ? 'Hide right sidebar' : 'Show right sidebar');

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + B for left sidebar
      if (side === 'left' && e.key === 'b' && (e.metaKey || e.ctrlKey) && !e.shiftKey) {
        e.preventDefault();
        toggle();
      }
      // Cmd/Ctrl + Shift + B for right sidebar
      if (side === 'right' && e.key === 'B' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault();
        toggle();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [side, toggle]);

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggle}
      className={cn(
        'transition-all duration-200',
        className
      )}
      title={label}
      aria-label={label}
    >
      <Icon className="h-4 w-4" />
      {showLabel && (
        <span className="ml-2">
          {sidebarState.isOpen ? 'Hide' : 'Show'} {side} sidebar
        </span>
      )}
    </Button>
  );
}