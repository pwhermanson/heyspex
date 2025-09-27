/**
 * Refactored Workspace Zone A Component
 *
 * Demonstrates the elegant patterns for 3-way toggle, CSS management, and state handling
 */

'use client';

import React from 'react';
import { useStateMachine } from '@/src/lib/state-machines/zone-state-machine';
import { buildWorkspaceZoneAClasses } from '@/src/lib/css/zone-class-builder';
import { useZoneStyles } from '@/src/lib/css/zone-styles';
import { WorkspaceZoneAToggle } from './shared/unified-zone-toggle';
import { cn } from '@/src/lib/lib/utils';

interface RefactoredWorkspaceZoneAProps {
   children: React.ReactNode;
   className?: string;
}

export function RefactoredWorkspaceZoneA({ children, className }: RefactoredWorkspaceZoneAProps) {
   // Elegant state management with state machine
   const { currentState, transition, setState } = useStateMachine({
      states: ['normal', 'fullscreen', 'hidden'],
      initialState: 'normal',
      transitions: {
         normal: 'fullscreen',
         fullscreen: 'hidden',
         hidden: 'normal',
      },
   });

   // Elegant CSS class generation
   const zoneClasses = buildWorkspaceZoneAClasses(currentState);

   // Elegant CSS variable management
   const { applyStyles } = useZoneStyles({
      zone: 'a',
      state: currentState === 'normal' ? 'visible' : currentState,
      dimensions: {
         leftWidth: currentState === 'normal' ? 244 : 0,
         rightWidth: currentState === 'normal' ? 320 : 0,
      },
   });

   // Elegant event handlers
   const handleStateChange = (newState: 'normal' | 'fullscreen' | 'hidden') => {
      setState(newState);
   };

   const handleCycle = () => {
      const newState = transition();
      // State is automatically updated by the state machine
   };

   return (
      <div className={cn(zoneClasses, className)}>
         {/* Elegant unified toggle */}
         <div className="flex items-center gap-2 p-2">
            <WorkspaceZoneAToggle
               currentState={currentState}
               onStateChange={handleStateChange}
               size="md"
               showLabel={true}
               data-testid="workspace-zone-a-toggle"
            />

            <span className="text-sm text-muted-foreground">
               {currentState === 'normal' && '3-Panel Layout'}
               {currentState === 'fullscreen' && 'Panel B Fullscreen'}
               {currentState === 'hidden' && 'Hidden'}
            </span>
         </div>

         {/* Zone content */}
         <div className="workspace-zone-content">{children}</div>
      </div>
   );
}

// Usage example in a parent component
export function ExampleUsage() {
   return (
      <RefactoredWorkspaceZoneA>
         <div className="grid grid-cols-3 gap-4 h-full">
            <div className="bg-blue-100 p-4">Panel A</div>
            <div className="bg-green-100 p-4">Panel B</div>
            <div className="bg-purple-100 p-4">Panel C</div>
         </div>
      </RefactoredWorkspaceZoneA>
   );
}
