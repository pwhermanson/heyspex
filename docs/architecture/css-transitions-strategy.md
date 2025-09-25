# CSS Transitions Strategy

## Overview

This document outlines the recommended approach for handling CSS transitions in the HeySpex project, based on lessons learned from debugging server hanging issues caused by problematic CSS custom property transitions.

**⚠️ CRITICAL**: This document must be referenced before making ANY changes to CSS transitions to prevent server hanging issues from recurring.

## Problem Summary

**Issue**: Multiple commits have introduced CSS custom property transitions that caused server hanging:

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

**⚠️ RECURRING ISSUE**: This problem has happened multiple times despite documentation. The most recent occurrence was after commit `caf605eb` when the problematic code was re-added to `src/app/globals.css`.

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

## Prevention Strategies

### Pre-Development Checklist

Before making ANY CSS changes, especially to `src/app/globals.css`:

1. **Read this document completely**
2. **Search for existing `:root` transitions** in the codebase
3. **Check for `tailwindcss-animate` plugin usage**
4. **Test server startup** after any CSS changes

### Code Review Checklist

When reviewing CSS changes, look for:

- [ ] `:root { transition: --variable-name ... }` patterns
- [ ] `@plugin "tailwindcss-animate"` directives
- [ ] Any transitions on CSS custom properties
- [ ] Changes to `src/app/globals.css` without proper testing

### Automated Prevention

Add these patterns to your IDE/editor to catch issues early:

```regex
# Search patterns to avoid:
:root\s*\{[^}]*transition[^}]*--[^}]*\}
@plugin\s*["']tailwindcss-animate["']
transition\s*:\s*--[a-zA-Z-]+
```

## Implementation Guidelines

### Do's ✅

1. **Transition actual CSS properties** (width, height, opacity, transform, etc.)
2. **Use CSS classes for state management**
3. **Keep CSS custom properties for values only**
4. **Use JavaScript for complex state logic**
5. **Consider Framer Motion for advanced animations**
6. **Test transitions in development frequently**
7. **Always test server startup after CSS changes**
8. **Use element-level transitions instead of `:root` transitions**

### Don'ts ❌

1. **Don't transition CSS custom properties** (`--variable-name`)
2. **Don't use `:root` transitions**
3. **Don't rely on CSS variable transitions for critical functionality**
4. **Don't mix transition approaches inconsistently**
5. **Don't re-enable `tailwindcss-animate` plugin without TypeScript compatibility check**
6. **Don't add transitions to `:root` selector under any circumstances**

## Current Project Status

### Fixed Issues (Latest: December 2024)

- ✅ Disabled `src/styles/tokens.css` import (caused hanging)
- ✅ Removed `tailwindcss-animate` plugin (TypeScript 5.9.2 incompatibility)
- ✅ Downgraded TypeScript to 5.6.3 (temporary)
- ✅ **FIXED (Dec 2024)**: Removed re-added `:root` transitions from `src/app/globals.css`
- ✅ **FIXED (Dec 2024)**: Disabled re-added `tailwindcss-animate` plugin
- ✅ Server now starts and runs without hanging

### Working Transitions

- ✅ Element-level transitions in `globals.css`
- ✅ Sidebar drag handle hover effects
- ✅ Basic CSS animations in `tailwind.config.ts`

### Known Problematic Patterns

These patterns have caused server hanging and should NEVER be used:

```css
/* ❌ NEVER USE - Causes server hanging */
:root {
   transition: --any-variable-name...;
}

/* ❌ NEVER USE - TypeScript incompatibility */
@plugin "tailwindcss-animate";
```

## Troubleshooting

### Server Hanging Symptoms

If the server hangs during startup:

1. **Check for `:root` transitions**:

   ```bash
   grep -r ":root" src/app/globals.css | grep transition
   ```

2. **Check for tailwindcss-animate plugin**:

   ```bash
   grep -r "tailwindcss-animate" src/app/globals.css
   ```

3. **Look for CSS custom property transitions**:
   ```bash
   grep -r "transition.*--" src/
   ```

### Quick Fix Commands

If server is hanging, run these commands to fix:

```bash
# Remove :root transitions
sed -i '/:root {/,/}/ { /transition:/d; }' src/app/globals.css

# Disable tailwindcss-animate plugin
sed -i 's/@plugin "tailwindcss-animate";/\/\* @plugin "tailwindcss-animate"; \*\//' src/app/globals.css
```

## Future Considerations

1. **Monitor TypeScript compatibility** - Upgrade when `tailwindcss-animate` supports TS 5.9+
2. **Consider CSS Container Queries** for responsive behavior
3. **Evaluate Framer Motion** for complex animations
4. **Implement consistent transition patterns** across components
5. **Add automated linting rules** to prevent problematic patterns

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

**Last Updated**: December 2024  
**Author**: AI Assistant  
**Status**: Active - Server hanging issue resolved (recurring problem fixed)

## ⚠️ CRITICAL WARNING

**This document MUST be read before making ANY CSS changes to prevent server hanging.**

The server hanging issue has occurred **multiple times** despite this documentation existing. The most recent fix was in December 2024 when problematic code was re-added to `src/app/globals.css`.

**Before touching any CSS files, especially `src/app/globals.css`:**

1. Read this entire document
2. Check for existing `:root` transitions
3. Test server startup after changes
4. Never add transitions to CSS custom properties
