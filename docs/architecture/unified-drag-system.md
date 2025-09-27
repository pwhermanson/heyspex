# Unified Drag System Architecture

## Overview

The unified drag system provides consistent, performant drag functionality across all workspace zones (Zone A and Zone B) in the HeySpex application. This system eliminates code duplication, ensures consistent behavior, and provides a robust foundation for future drag interactions.

## Architecture Components

### 1. Core Utilities (`src/lib/drag-utilities.ts`)

The drag utilities module provides:

- **Shared Types**: `DragConfig`, `DragCallbacks`, `DragOptions`
- **Utility Functions**: CSS class management, value clamping, drag calculations
- **Specialized Hooks**: `useHorizontalDragHandler`, `useVerticalDragHandler`
- **CSS Variable Management**: Unified panel width updates

### 2. Zone-Specific Implementations

#### Workspace Zone A (Horizontal Panels)

- **File**: `src/components/layout/workspace-zone-a-panels/workspace-zone-a-panels-drag-handle.tsx`
- **Direction**: Horizontal (left/right panel resizing)
- **CSS Classes**: `workspace-zone-a-panels-dragging`
- **Variables**: `--left-width`, `--right-width`, `--grid-template-columns`

#### Workspace Zone B (Vertical Panel)

- **File**: `src/components/layout/workspace-zone-b-drag-handle.tsx`
- **Direction**: Vertical (bottom panel height resizing)
- **CSS Classes**: `sidebar-dragging`
- **Variables**: Height-based resizing

## Key Features

### Performance Optimizations

1. **Throttled Updates**: 60fps throttling (16ms intervals) for smooth performance
2. **Transition Disabling**: CSS transitions disabled during drag for immediate feedback
3. **Efficient DOM Updates**: Direct CSS custom property manipulation
4. **Event Cleanup**: Proper event listener cleanup on drag end

### Accessibility

1. **ARIA Roles**: `role="separator"` with appropriate orientation
2. **Keyboard Support**: Prevents default behavior and stops propagation
3. **Screen Reader Labels**: Descriptive `aria-label` attributes
4. **Focus Management**: Proper focus handling during drag operations

### State Management

1. **Unified State**: Consistent state management across zones
2. **CSS Variable Sync**: Real-time synchronization with CSS custom properties
3. **Fallback Values**: Graceful handling of missing or invalid values
4. **Cleanup**: Proper cleanup on component unmount

## Usage Examples

### Horizontal Drag (Zone A)

```typescript
import { useHorizontalDragHandler, updatePanelWidths } from '@/src/lib/drag-utilities';

const createDragHandler = useHorizontalDragHandler(
   {
      min: 200,
      max: 500,
      startValue: currentWidth,
      currentValue: currentWidth,
      isDragging: isDragging,
   },
   {
      onDragStart: () => {
         // Open panel if closed
         setPanelOpen(true);
      },
      onDrag: (newWidth) => {
         // Update CSS variables for immediate feedback
         updatePanelWidths(newWidth, otherWidth, isOpen, otherIsOpen);
      },
      onDragEnd: (finalWidth) => {
         // Update state with final value
         setPanelWidth(finalWidth);
      },
   }
);
```

### Vertical Drag (Zone B)

```typescript
import { useVerticalDragHandler } from '@/src/lib/drag-utilities';

const createDragHandler = useVerticalDragHandler(
   {
      min: 40,
      max: maxHeight,
      startValue: currentHeight,
      currentValue: currentHeight,
      isDragging: isDragging,
   },
   {
      onDrag: (newHeight) => {
         setPanelHeight(newHeight);
      },
      onDragEnd: (finalHeight) => {
         setPanelHeight(finalHeight);
      },
   }
);
```

## CSS Integration

### Drag State Classes

```css
/* Disable transitions during drag */
.sidebar-dragging,
.sidebar-dragging *,
.workspace-zone-a-panels-dragging,
.workspace-zone-a-panels-dragging * {
   transition: none !important;
}

/* Prevent text selection during drag */
.sidebar-dragging,
.workspace-zone-a-panels-dragging {
   user-select: none;
   -webkit-user-select: none;
   -moz-user-select: none;
   -ms-user-select: none;
}
```

### CSS Custom Properties

The system manages these CSS variables for consistent layout:

```css
:root {
   --left-width: 244px;
   --right-width: 320px;
   --sidebar-left-width: var(--left-width);
   --sidebar-right-width: var(--right-width);
   --grid-template-columns: var(--left-width) 1fr var(--right-width);
}
```

## Best Practices

### 1. Performance

- Always use throttled updates (16ms for 60fps)
- Disable transitions during drag operations
- Use direct CSS custom property manipulation for immediate feedback

### 2. Accessibility

- Provide proper ARIA roles and labels
- Ensure keyboard navigation works correctly
- Test with screen readers

### 3. State Management

- Keep drag state separate from component state
- Use callbacks for state updates rather than direct manipulation
- Clean up event listeners properly

### 4. Error Handling

- Provide fallback values for CSS property reading
- Handle edge cases (very small/large values)
- Graceful degradation for missing elements

## Migration Guide

### From Legacy Drag Handlers

1. **Replace manual event handling** with `useHorizontalDragHandler` or `useVerticalDragHandler`
2. **Use `updatePanelWidths`** for CSS variable management
3. **Implement proper cleanup** in useEffect hooks
4. **Add accessibility attributes** (role, aria-label, etc.)

### Example Migration

**Before:**

```typescript
const handleMouseDown = (e: React.MouseEvent) => {
   // Manual event handling
   const startX = e.clientX;
   // ... complex drag logic
};
```

**After:**

```typescript
const createDragHandler = useHorizontalDragHandler(config, callbacks, options);
const handleMouseDown = createDragHandler(side);
```

## Future Enhancements

1. **Touch Support**: Add touch event handling for mobile devices
2. **Keyboard Navigation**: Arrow key resizing support
3. **Snap Points**: Automatic snapping to common sizes
4. **Animation**: Smooth animations when drag ends
5. **Multi-panel**: Support for dragging multiple panels simultaneously

## Troubleshooting

### Common Issues

1. **Drag not working**: Check that event listeners are properly attached
2. **Performance issues**: Ensure throttling is enabled and transitions are disabled
3. **State not updating**: Verify callback functions are properly implemented
4. **CSS not updating**: Check that CSS custom properties are being set correctly

### Debug Tools

- Use browser dev tools to inspect CSS custom properties
- Check console for any JavaScript errors
- Verify event listeners are properly cleaned up
- Test with different panel states (open/closed)

## Testing

The drag system should be tested for:

1. **Functionality**: Drag operations work correctly
2. **Performance**: Smooth 60fps updates
3. **Accessibility**: Screen reader compatibility
4. **Edge Cases**: Very small/large values, rapid dragging
5. **State Management**: Proper state updates and cleanup
6. **Cross-browser**: Works in all supported browsers
