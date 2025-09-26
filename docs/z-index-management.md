# Z-Index Management System

> **📁 Implementation File:** [`src/lib/z-index-management.ts`](../../src/lib/z-index-management.ts)  
> **🔗 Related Documentation:** [Layout System](../../docs/layout-system.md)

## Overview

The Z-Index Management System provides centralized control over z-index values across the HeySpex application to prevent conflicts and maintain a consistent layering hierarchy. This system ensures that UI elements appear in the correct order and prevents common z-index issues.

## Why Z-Index Management?

Z-index conflicts are a common source of UI bugs where elements appear behind or in front of other elements unexpectedly. Without proper management, z-index values can become scattered and inconsistent, leading to:

- Elements appearing behind others when they should be in front
- Inconsistent layering across different components
- Difficult debugging when z-index values are hardcoded
- Maintenance issues when adding new UI elements

## Z-Index Layer Hierarchy

The system organizes z-index values into logical layers with clear separation:

### Background Layers (0-9)

- **0**: Background elements, app shell
- **1**: Decorative elements
- **2**: Glow effects, visual enhancements

### Content Layers (10-19)

- **10**: Main content, panels, sidebar content, sticky headers

### Control Layers (20-29)

- **20**: Top bar, panel control bars, bottom bar, workspace zone B

### Interactive Layers (30-39)

- **30**: Interactive elements, buttons, inputs
- **50**: Drag handles (higher for interaction priority)

### Overlay Layers (40-59)

- **50**: Tooltips, dropdowns, popovers, select dropdowns, context menus, sheets
- **50**: Command palette

### Critical Overlays (60+)

- **60**: Notifications, alerts, loading overlays
- **200**: Modals, dialogs (high priority)
- **100**: Emergency overrides, workspace zone B overlay

## Usage Examples

### Basic Usage

```typescript
import { ZIndex } from '@/src/lib/z-index-management';

// Get z-index value
const topBarZIndex = ZIndex.layers.TOP_BAR; // 20

// Get Tailwind CSS class
const topBarClass = ZIndex.utils.getTailwindClass('TOP_BAR'); // "z-[20]"

// Get inline style object
const topBarStyle = ZIndex.utils.getStyle('TOP_BAR'); // { zIndex: 20 }
```

### In React Components

```tsx
import { ZIndex } from '@/src/lib/z-index-management';

function TopBar() {
   return (
      <div className="w-full h-14 border-b bg-background" style={ZIndex.utils.getStyle('TOP_BAR')}>
         {/* Top bar content */}
      </div>
   );
}

// Or using Tailwind classes
function TopBar() {
   return (
      <div
         className={`w-full h-14 border-b bg-background ${ZIndex.utils.getTailwindClass('TOP_BAR')}`}
      >
         {/* Top bar content */}
      </div>
   );
}
```

### In CSS Files

```css
/* Using CSS custom properties */
.top-bar {
   z-index: var(--z-top-bar);
}

.modal-overlay {
   z-index: var(--z-modals);
}

/* Or using the predefined values */
.panel-control-bar {
   z-index: 20; /* Z_INDEX_LAYERS.PANEL_CONTROL_BAR */
}
```

### Category-Based Access

```typescript
import { ZIndex } from '@/src/lib/z-index-management';

// Access by category
const controlLayers = ZIndex.categories.CONTROLS;
const topBarZIndex = controlLayers.TOP_BAR; // 20

// Get next available z-index in a category
const nextControlZIndex = ZIndex.utils.getNextInCategory('CONTROLS');
```

## Conflict Detection

The system includes utilities to detect and prevent z-index conflicts:

```typescript
import { ZIndex } from '@/src/lib/z-index-management';

// Check for conflicts
const usedValues = [10, 20, 25, 30];
const conflicts = ZIndex.conflictDetection.checkConflicts(usedValues);
// Returns array of conflicting values

// Get recommended z-index to avoid conflicts
const recommended = ZIndex.conflictDetection.getRecommendedValue('TOP_BAR', usedValues);
```

## Migration Guide

### From Hardcoded Values

**Before:**

```tsx
<div className="z-20">Top Bar</div>
<div style={{ zIndex: 50 }}>Modal</div>
```

**After:**

```tsx
import { ZIndex } from '@/src/lib/z-index-management';

<div className={ZIndex.utils.getTailwindClass('TOP_BAR')}>Top Bar</div>
<div style={ZIndex.utils.getStyle('MODALS')}>Modal</div>
```

### From CSS Variables

**Before:**

```css
.top-bar {
   z-index: 20;
}
```

**After:**

```css
.top-bar {
   z-index: var(--z-top-bar);
}
```

## Best Practices

### 1. Always Use the Centralized System

```typescript
// ✅ Good
import { ZIndex } from '@/src/lib/z-index-management';
const zIndex = ZIndex.layers.TOP_BAR;

// ❌ Avoid
const zIndex = 20;
```

### 2. Use Appropriate Layer Categories

```typescript
// ✅ Good - Use specific layer for purpose
const modalZIndex = ZIndex.layers.MODALS;

// ❌ Avoid - Using wrong layer
const modalZIndex = ZIndex.layers.TOOLTIPS;
```

### 3. Check for Conflicts in Development

```typescript
// ✅ Good - Validate z-index usage
const conflicts = ZIndex.conflictDetection.checkConflicts([10, 20, 25]);
if (conflicts.length > 0) {
   console.warn('Z-index conflicts detected:', conflicts);
}
```

### 4. Use CSS Variables in Stylesheets

```css
/* ✅ Good - Using CSS variables */
.modal {
   z-index: var(--z-modals);
}

/* ❌ Avoid - Hardcoded values */
.modal {
   z-index: 200;
}
```

## Common Patterns

### Modal Overlay Pattern

```tsx
function Modal({ isOpen, children }) {
   if (!isOpen) return null;

   return (
      <div className="fixed inset-0 bg-black/80" style={ZIndex.utils.getStyle('MODALS')}>
         <div className="relative">{children}</div>
      </div>
   );
}
```

### Sticky Header Pattern

```tsx
function StickyHeader({ children }) {
   return (
      <div className="sticky top-0 bg-background" style={ZIndex.utils.getStyle('STICKY_HEADERS')}>
         {children}
      </div>
   );
}
```

### Tooltip Pattern

```tsx
function Tooltip({ children, content }) {
   return (
      <div className="relative group">
         {children}
         <div
            className="absolute opacity-0 group-hover:opacity-100 transition-opacity"
            style={ZIndex.utils.getStyle('TOOLTIPS')}
         >
            {content}
         </div>
      </div>
   );
}
```

## Troubleshooting

### Element Appears Behind Another

1. Check if both elements use the z-index system
2. Verify the layer hierarchy is correct
3. Use conflict detection to find overlapping values

```typescript
// Debug z-index issues
const elementZIndex = ZIndex.layers.TOP_BAR; // 20
const otherElementZIndex = ZIndex.layers.MODALS; // 200
// Modals should appear above top bar - this is correct
```

### Z-Index Not Working

1. Ensure the element has `position: relative`, `absolute`, or `fixed`
2. Check for stacking context issues
3. Verify the z-index value is being applied correctly

```css
/* Ensure proper positioning */
.element {
   position: relative; /* or absolute, fixed */
   z-index: var(--z-top-bar);
}
```

### Adding New Z-Index Values

1. Choose the appropriate layer category
2. Use the next available value in that range
3. Update the documentation

```typescript
// Add new layer to the system
export const Z_INDEX_LAYERS = {
   // ... existing layers
   NEW_LAYER: 25, // Choose appropriate value
} as const;
```

## Integration with Existing Code

The z-index management system is designed to work alongside existing code. You can gradually migrate hardcoded z-index values to use the centralized system.

### Gradual Migration Strategy

1. **Phase 1**: Use the system for new components
2. **Phase 2**: Migrate critical components (modals, overlays)
3. **Phase 3**: Migrate remaining components
4. **Phase 4**: Remove hardcoded values

### Compatibility

The system is compatible with:

- Tailwind CSS z-index classes
- Inline styles
- CSS custom properties
- Existing z-index values (during migration)

## Performance Considerations

- Z-index values are constants, so there's no runtime performance impact
- CSS custom properties are efficiently handled by browsers
- The conflict detection utilities are only used during development

## Future Enhancements

- Automatic conflict detection in development mode
- Z-index visualization tools
- Integration with design system tokens
- Automated migration tools

---

## Related Files

- **📁 Implementation:** [`src/lib/z-index-management.ts`](../../src/lib/z-index-management.ts)
- **🏗️ Layout System:** [Layout System Documentation](../../docs/layout-system.md)
- **🎨 Design System:** [Component Standards](../../src/components/standards/)

> **🔄 Cross-References:** This documentation and the implementation file contain bidirectional references for easy navigation between conceptual understanding and implementation details.
