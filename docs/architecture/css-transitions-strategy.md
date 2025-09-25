# CSS Transitions Strategy

## Overview

This document outlines the recommended approach for handling CSS transitions in the HeySpex project, based on lessons learned from debugging server hanging issues caused by problematic CSS custom property transitions.

## Problem Summary

**Issue**: Commit `9957ceb` introduced CSS custom property transitions that caused server hanging:

```css
/* ❌ PROBLEMATIC - Causes infinite loops and server hanging */
:root {
   transition:
      --left-width var(--layout-motion-duration-medium) var(--layout-motion-easing),
      --right-width var(--layout-motion-duration-medium) var(--layout-motion-easing),
      --grid-template-columns var(--layout-motion-duration-medium) var(--layout-motion-easing);
}
```

**Root Cause**:

- CSS custom property transitions are not well-supported
- Can cause infinite loops during CSS compilation
- Incompatible with Turbopack and modern build tools
- Performance issues with TypeScript 5.9.2

## Recommended Solutions

### 1. Element-Level Transitions (Primary Approach)

Transition actual CSS properties on elements, not CSS custom properties:

```css
/* ✅ CORRECT - Transition actual properties */
.sidebar {
   width: var(--sidebar-width);
   transition:
      width 240ms ease,
      transform 240ms ease;
}

.sidebar-content {
   transition: opacity 160ms ease;
}

.sidebar--dragging {
   transition: none; /* Disable during drag for performance */
}
```

### 2. CSS Classes for State Management

Use CSS classes to control different states:

```css
/* Base state */
.sidebar {
   width: var(--left-width);
   transition: width 240ms ease;
}

/* State classes */
.sidebar--collapsed {
   width: var(--left-collapsed);
}

.sidebar--dragging {
   transition: none;
}

.sidebar--animating {
   transition:
      width 240ms ease,
      transform 240ms ease;
}
```

### 3. JavaScript-Controlled Transitions

Handle complex state changes in JavaScript:

```typescript
// Example: Sidebar width management
const updateSidebarWidth = (width: number) => {
   const sidebar = document.querySelector('.sidebar');
   if (sidebar) {
      sidebar.style.setProperty('--left-width', `${width}px`);
      // CSS handles the transition automatically
   }
};

// Example: Drag state management
const setDraggingState = (isDragging: boolean) => {
   const sidebar = document.querySelector('.sidebar');
   if (sidebar) {
      sidebar.classList.toggle('sidebar--dragging', isDragging);
   }
};
```

### 4. Framer Motion for Complex Animations

For advanced animations, use Framer Motion (already installed):

```typescript
import { motion } from 'motion/react';

const Sidebar = ({ isCollapsed }: { isCollapsed: boolean }) => (
  <motion.div
    animate={{
      width: isCollapsed ? 64 : 280,
      opacity: isCollapsed ? 0.8 : 1
    }}
    transition={{
      duration: 0.24,
      ease: "easeOut",
      type: "tween"
    }}
    className="sidebar"
  >
    {/* content */}
  </motion.div>
);
```

### 5. CSS Custom Properties for Values Only

Keep CSS custom properties for values, not transitions:

```css
:root {
   /* ✅ Good - Values only */
   --sidebar-width: 280px;
   --sidebar-width-collapsed: 64px;
   --transition-duration: 240ms;
   --transition-easing: cubic-bezier(0.32, 0.72, 0, 1);

   /* ❌ Bad - Don't transition CSS variables */
   /* transition: --sidebar-width 240ms ease; */
}

.sidebar {
   /* ✅ Good - Use variables for values, transition properties */
   width: var(--sidebar-width);
   transition: width var(--transition-duration) var(--transition-easing);
}
```

## Implementation Guidelines

### Do's ✅

1. **Transition actual CSS properties** (width, height, opacity, transform, etc.)
2. **Use CSS classes for state management**
3. **Keep CSS custom properties for values only**
4. **Use JavaScript for complex state logic**
5. **Consider Framer Motion for advanced animations**
6. **Test transitions in development frequently**

### Don'ts ❌

1. **Don't transition CSS custom properties** (`--variable-name`)
2. **Don't use `:root` transitions**
3. **Don't rely on CSS variable transitions for critical functionality**
4. **Don't mix transition approaches inconsistently**

## Current Project Status

### Fixed Issues

- ✅ Disabled `src/styles/tokens.css` import (caused hanging)
- ✅ Removed `tailwindcss-animate` plugin (TypeScript 5.9.2 incompatibility)
- ✅ Downgraded TypeScript to 5.6.3 (temporary)
- ✅ Server now starts and runs without hanging

### Working Transitions

- ✅ Element-level transitions in `globals.css`
- ✅ Sidebar drag handle hover effects
- ✅ Basic CSS animations in `tailwind.config.ts`

## Future Considerations

1. **Monitor TypeScript compatibility** - Upgrade when `tailwindcss-animate` supports TS 5.9+
2. **Consider CSS Container Queries** for responsive behavior
3. **Evaluate Framer Motion** for complex animations
4. **Implement consistent transition patterns** across components

## Related Files

- `src/app/globals.css` - Main CSS file with working transitions
- `src/styles/tokens.css` - Disabled (caused hanging)
- `tailwind.config.ts` - Animation keyframes and configuration
- `src/components/layout/` - Layout components that use transitions

## References

- [CSS Custom Properties MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [CSS Transitions MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Transitions)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Tailwind CSS Animations](https://tailwindcss.com/docs/animation)

---

**Last Updated**: September 25, 2025  
**Author**: AI Assistant  
**Status**: Active - Server hanging issue resolved
