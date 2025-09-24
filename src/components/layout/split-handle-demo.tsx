'use client';

import * as React from 'react';
import { SplitHandle } from './split-handle';

/**
 * Demo component showing how to use the enhanced SplitHandle
 * This demonstrates Phase 3.5 - drag behavior implementation
 */
export function SplitHandleDemo() {
   const [height, setHeight] = React.useState(200);
   const [isDragging, setIsDragging] = React.useState(false);

   const handleDragStart = React.useCallback(() => {
      setIsDragging(true);
   }, []);

   const handleDragEnd = React.useCallback(() => {
      setIsDragging(false);
   }, []);

   return (
      <div className="w-full h-64 border rounded-lg overflow-hidden">
         <div className="h-full bg-muted/20 p-4">
            <h3 className="text-lg font-medium mb-2">Split Handle Demo</h3>
            <p className="text-sm text-muted-foreground mb-4">
               Drag the handle below to resize the area. Current height: {height}px
            </p>

            <div
               className="bg-background border rounded p-4 transition-all duration-200"
               style={{ height: `${height}px` }}
            >
               <p className="text-sm">This area can be resized by dragging the handle below.</p>
               <p className="text-xs text-muted-foreground mt-2">
                  {isDragging ? 'Dragging...' : 'Not dragging'}
               </p>
            </div>

            <SplitHandle
               currentHeight={height}
               minHeight={100}
               maxHeight={400}
               onHeightChange={setHeight}
               onDragStart={handleDragStart}
               onDragEnd={handleDragEnd}
               isDragging={isDragging}
               aria-label="Demo split handle"
               className="my-2"
            />

            <div className="bg-secondary/20 border rounded p-2">
               <p className="text-xs text-muted-foreground">
                  Bottom area - this would grow as the top area shrinks
               </p>
            </div>
         </div>
      </div>
   );
}
