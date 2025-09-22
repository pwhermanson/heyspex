# Blue Drag Handle Implementation Guide

This guide explains how to implement the blue drag handles that appear on hover, matching the visual language used on the sidebar edges and the output panel splitter.

## Overview

The drag handles provide visual feedback and drag functionality for resizing panels. They rely on layered elements (hit area, indicator line, hover wash) and smooth transitions that respect the parent container's rounded corners.

## Vertical Drag Handles (Sidebar Edges)

### Implementation Structure

```tsx
<div className="absolute top-0 bottom-0 right-0 w-1 cursor-col-resize group z-50">
  {/* Visual indicator line - thin blue line */}
  <div className="absolute top-0 bottom-0 right-0 w-0.5 bg-transparent group-hover:bg-blue-500 transition-colors duration-200" />

  {/* Wider invisible hit area for easier grabbing */}
  <div className="absolute top-0 bottom-0 right-0 w-3 cursor-col-resize -right-1" />

  {/* Subtle background highlight */}
  <div className="absolute top-0 bottom-0 right-0 w-1 bg-transparent group-hover:bg-blue-500/10 transition-colors duration-200" />
</div>
```

### Key Properties

- **Container**: `absolute top-0 bottom-0 right-0` (vertical, right edge)
- **Main width**: `w-1` (4px wide)
- **Indicator**: `w-0.5` (2px thin line)
- **Cursor**: `cursor-col-resize` (horizontal resize cursor)
- **Z-index**: `z-50` (above other content)

### Visual States

- **Default**: `bg-transparent`
- **Hover**: `group-hover:bg-blue-500/30`
- **Active**: `bg-blue-500/50`
- **Indicator**: `group-hover:bg-blue-500`

### Container Requirements

The parent container must have:

```tsx
className="relative overflow-hidden lg:rounded-md"
```

- `relative` — for absolute positioning
- `overflow-hidden` — clips the drag handle to container bounds
- `lg:rounded-md` — ensures the blue line respects the rounded corners

## Horizontal Drag Handles (Bottom Output Bar)

### Implementation Snapshot

```tsx
<BottomDragHandle
  onMouseDown={onDragStart}
  isDragging={isDragging}
/>
```

The `BottomDragHandle` component lives at `components/layout/bottom-drag-handle.tsx` and encapsulates the horizontal styling + hit area logic so it can be reused by the overlay and push variants of the bottom output panel.

### Component Structure

```tsx
<div
  className={cn(
    'absolute inset-x-0 top-0 h-2 cursor-row-resize group z-50 select-none touch-none pointer-events-auto',
    'transition-all duration-200 ease-in-out hover:bg-blue-500/30',
    isDragging && 'bg-blue-500/30',
    className
  )}
  onMouseDown={handleMouseDown}
  role="separator"
  aria-orientation="horizontal"
  aria-label="Resize output panel"
>
  {/* Indicator line */}
  <div
    className={cn(
      'absolute inset-x-0 top-0 h-0.5 bg-transparent transition-colors duration-200 ease-in-out',
      'group-hover:bg-blue-500',
      isDragging && 'bg-blue-500'
    )}
  />

  {/* Invisible hit area for easier grabbing */}
  <div className="absolute inset-x-0 -top-2 h-4 cursor-row-resize" />

  {/* Hover wash */}
  <div className="absolute inset-x-0 top-0 h-full bg-transparent transition-colors duration-200 ease-in-out group-hover:bg-blue-500/10" />
</div>
```

### Key Details

- **Container positioning**: `absolute inset-x-0 top-0` keeps the handle locked to the top edge of the bottom bar so the highlight is clipped by its rounded corners.
- **Height**: `h-2` gives room for the hover wash while the line itself remains ultra thin at `h-0.5`.
- **Hit area**: an invisible `h-4` strip shifted upward (`-top-2`) makes the handle easy to grab without showing extra chrome.
- **Hover & active states**: the outer wrapper gains `hover:bg-blue-500/30`, while the indicator line swaps from transparent -> blue on hover and stays solid while dragging.
- **Accessibility**: the wrapper is a `role="separator"` with `aria-orientation="horizontal"` so assistive tech understands what it controls.

### Container Requirements

The bottom bar host (`components/layout/bottom-bar.tsx`) sets:

```tsx
<div
  className="relative overflow-hidden bg-background border-t flex flex-col w-full ..."
  style={{ height: `${height}px` }}
>
  <BottomDragHandle ... />
  {/* panel content */}
</div>
```

`overflow-hidden` ensures the blue line is clipped by the rounded corners in overlay mode, mirroring the vertical handles.

### Interaction Wiring

- `BottomBar` passes `onDragStart` and `isDragging` flags down to the handle so the visual states stay in sync with drag lifecycle events.
- `components/layout/main-layout.tsx` tracks the drag using refs (`dragStartYRef`, `dragStartHeightRef`, `isDraggingRef`) and adds/removes the shared `sidebar-dragging` body class used across the layout system.
- Both overlay and push modes reuse the same component, ensuring a single visual implementation across modes.

## Key Differences

### Vertical vs Horizontal

| Aspect | Vertical (Sidebar) | Horizontal (Bottom Bar) |
|--------|-------------------|-------------------------|
| **Orientation** | `w-1` (vertical) | `h-2` wrapper with `h-0.5` indicator |
| **Position** | `right-0` or `left-0` | `top-0 inset-x-0` |
| **Cursor** | `cursor-col-resize` | `cursor-row-resize` |
| **Visibility** | Invisible by default | Transparent wrapper, line appears on hover |
| **Hit Area** | 3px wide invisible strip offset sideways | 4px tall invisible strip offset upward |

### Visual Behavior

**Vertical Handles:**
- Idle: fully transparent
- Hover: wash + solid indicator line
- Dragging: elevated opacity and body gets `sidebar-dragging`

**Horizontal Handle:**
- Idle: wrapper transparent, line hidden
- Hover: faint blue wash + indicator line ramps in
- Dragging: wrapper/line both stay solid blue until mouseup

## Positioning Logic

### For Sidebars (Vertical)

```tsx
// Left sidebar - drag handle at right edge
className="absolute top-0 bottom-0 right-0"

// Right sidebar - drag handle at left edge
className="absolute top-0 bottom-0 left-0"
```

### For Bottom Bar (Horizontal)

```tsx
// Output panel - drag handle along the top edge
className="absolute inset-x-0 top-0"
```

## CSS Custom Properties

The drag interactions rely on CSS custom properties to keep layout updates snappy:

```css
:root {
  --sidebar-left-width: 244px;
  --sidebar-right-width: 0px;
  --grid-template-columns: 244px 1fr 0px;
  --bottombar-height: 40px;
}
```

`main-layout.tsx` updates these values during drag to provide immediate feedback even before React state settles.

## Performance Optimizations

1. **Ref-driven drag state**: avoids re-render churn during `mousemove`.
2. **Throttled DOM updates** (sidebar) and clamped heights (bottom bar) to maintain 60fps.
3. **CSS transitions** disabled while `sidebar-dragging` is active for smoother feedback.
4. **Global cleanup**: `mouseup` listeners and body class removed on drag end and component unmount.

## Usage Examples

```tsx
// Sidebar drag handle
<div className="relative h-full w-full overflow-hidden lg:rounded-md">
  <SidebarDragHandle side="left" />
</div>

// Bottom bar drag handle
<div className="relative overflow-hidden rounded-t-lg">
  <BottomDragHandle onMouseDown={startDrag} isDragging={isDragging} />
</div>
```

## Best Practices

1. Always wrap drag handles in a `relative` + `overflow-hidden` container.
2. Match the container's border radius so the blue line clips cleanly.
3. Use appropriate cursors (`col-resize` vs `row-resize`).
4. Keep the indicator line thin (`0.5px` or `h-0.5`) for a refined look.
5. Add ARIA metadata for accessibility.
6. Share the same body drag class (`sidebar-dragging`) so the whole layout responds consistently.

