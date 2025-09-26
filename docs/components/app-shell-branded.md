# App Shell Branded Component Documentation

> **📁 Implementation File:** [`src/components/layout/app-shell-branded.tsx`](../../src/components/layout/app-shell-branded.tsx)  
> **🔗 Related Documentation:** [App Shell Terminology](../../docs/terminology.md#11-app-shell-branded)

## Overview

The `AppShellBranded` component is a sophisticated interactive logo display that serves as the main landing page element. It creates dynamic visual effects based on mouse movement and hover states, featuring multi-layer animations, distance-based calculations, and smooth state transitions.

## File Location

```
src/components/layout/app-shell-branded.tsx
```

> **💡 Quick Reference:** The component file contains comprehensive JSDoc comments at the top with a high-level overview and cross-reference to this documentation.

## High-Level Purpose

The component provides an engaging, interactive logo experience with:

- Real-time mouse tracking and visual feedback
- Multi-layer visual effects (shadows, glows, grids)
- Animated color transitions
- Smooth state management (idle, active, fading)
- Performance-optimized calculations

## Core Functionality

### 1. Interactive Mouse Tracking System

- **Real-time mouse position tracking** with immediate visual response
- **Distance-based calculations** from mouse to logo center
- **Smooth state transitions** between idle, active, and fading states
- **Timeout management** for idle detection and fade effects

### 2. Multi-Layer Visual Effects System

- **Dynamic shadow effects** that follow mouse movement
- **Radial glow effects** with intensity based on distance
- **Animated color transitions** through a predefined palette
- **Grid background patterns** with opacity based on mouse proximity
- **Explosive hover effects** with CSS animations

## High-Level Functions & Methods

### State Management Functions

```typescript
// Core state setters and getters
setIsMouseOver(boolean); // Controls hover state
setIsMouseMoving(boolean); // Tracks active mouse movement
setIsIdle(boolean); // Manages idle timeout state
setIsFading(boolean); // Controls fade-out animation
setMousePosition({ x, y }); // Updates mouse coordinates
```

### Event Handlers

```typescript
handleMouseMove(e); // Primary mouse tracking function
handleMouseLeave(); // Mouse exit handler
clearAllTimeouts(); // Cleanup function for timeouts
```

### Calculation Functions (All Memoized)

```typescript
getLogoCenterAndDistance(); // Calculates logo center and mouse distance
getShadowOffset(); // Computes shadow position, blur, opacity
getSwirlingColor(); // Generates animated color transitions
getGlowIntensity(); // Calculates glow effect intensity
getGridLineOpacity(); // Determines grid pattern opacity
```

## Configuration Objects

### VISUAL_CONSTANTS - Core Configuration

```typescript
const VISUAL_CONSTANTS = {
   // Shadow effects
   SHADOW_OFFSET_DIVISOR: 20,
   MAX_SHADOW_DISTANCE: 3000,
   MAX_SHADOW_BLUR: 15,
   OPACITY_FADE_DISTANCE: 400,
   MIN_OPACITY: 0.1,

   // Edge effects
   EDGE_FADE_DISTANCE: 100,

   // Glow effects
   GLOW_MAX_DISTANCE: 200,
   GLOW_MIN_INTENSITY: 0.1,

   // Grid effects
   GRID_MAX_DISTANCE: 300,

   // Timing
   IDLE_TIMEOUT: 500,
   FADE_DELAY: 0,

   // Color animation
   COLOR_ROTATION_SPEED: 0.3,

   // Logo dimensions
   LOGO_WIDTH: 300,
   LOGO_HEIGHT: 273,

   // Color palette (6 colors for smooth transitions)
   COLOR_PALETTE: [
      [59, 130, 246], // Blue
      [34, 197, 94], // Green
      [147, 51, 234], // Purple
      [236, 72, 153], // Pink
      [249, 115, 22], // Orange
      [234, 179, 8], // Yellow
   ],

   // Additional constants for effects, transitions, and styling
   // ... (see source for complete list)
};
```

### MASK_STYLES - CSS Mask Configuration

```typescript
const MASK_STYLES = {
   backgroundSize: '100vw 100vh, 100vw 100vh, 100vw 100vh, 100vw 100vh',
   backgroundPosition: '0 0, 0 0, 0 0, 0 0',
   backgroundRepeat: 'repeat',
   maskImage: `/* Complex gradient patterns for visual texture */`,
   maskSize: '800px 800px, 800px 800px, 400px 400px, 600px 600px',
   maskPosition: '0 0, 0 0, 50px 50px, 100px 100px',
   maskRepeat: 'repeat',
};
```

### COMPONENT_STYLES - Reusable Style Objects

```typescript
const COMPONENT_STYLES = {
   glowEffect: {
      zIndex: VISUAL_CONSTANTS.GLOW_Z_INDEX,
      mixBlendMode: 'screen',
      ...MASK_STYLES,
   },
   solidBlackLogo: {
      filter: 'brightness(0)',
      WebkitFilter: 'brightness(0)',
   },
   explosiveGlow: {
      width: '0px',
      height: '0px',
      borderRadius: '50%',
      position: 'absolute',
      // ... additional styles
   },
   kbdButton: 'px-2 py-1 text-sm font-semibold...',
};
```

### STYLE_GENERATORS - Dynamic Style Functions

```typescript
const STYLE_GENERATORS = {
  getGlowRadialGradient(x, y, intensity)     // Creates radial glow gradients
  getExplosiveGlowBackground()               // Generates hover explosion effect
  getGridBackgroundImage(baseOpacity)        // Creates multi-layer grid patterns
  getLogoFilter(isFading, isMouseOver, ...) // Applies dynamic filters to logo
  getTransitionStyle(isFading)               // Manages transition timing
}
```

## Component Structure

### 1. Container Structure

```jsx
<div ref={containerRef} className="...">
   {' '}
   // Main container with mouse tracking
   {/* Grid background layer */}
   {/* Glow effect layer */}
   {/* Logo group with effects */}
   {/* Instruction text */}
</div>
```

### 2. Background Effects Layer

- **Grid background div** with dynamic opacity and gradients
- **Mouse-following glow div** with radial gradients and blend modes

### 3. Logo Group Structure

```jsx
<div className="mb-6 group cursor-pointer relative">
   {' '}
   // Logo container
   {/* Black shadow base - creates shadow effect */}
   {/* Explosive radial glow - hover only */}
   {/* Main logo with animated shadow */}
</div>
```

### 4. Logo Sub-Elements

- **Black shadow base** - Creates the shadow foundation
- **Explosive radial glow** - CSS-animated hover effect
- **Main logo** - Primary image with dynamic filters

## Animation & Transition System

### CSS Classes for Animations

- `radial-glow-explosion` - Base explosion effect
- `group-hover:radial-glow-explosion-active` - Hover trigger

### Dynamic Style Calculations

- **Filter transitions** based on state (brightness, drop-shadow)
- **Opacity transitions** for fade effects
- **Background transitions** for glow effects
- **Transform calculations** for shadow positioning

## Performance Optimizations

### Memoization Strategy

- All calculation functions are memoized with `useCallback`
- Style objects are memoized with `useMemo`
- Dependencies are carefully managed to prevent unnecessary re-renders

### Timeout Management

- Centralized timeout clearing function
- Proper cleanup on component unmount
- State-based timeout control

## Dependencies

### React Hooks Used

- `useState` - State management for all interactive states
- `useRef` - DOM references for calculations and cleanup
- `useCallback` - Memoized event handlers and calculations
- `useMemo` - Memoized style calculations
- `useEffect` - Cleanup on unmount

### External Dependencies

- `next/image` - Optimized image component
- `@/src/lib/lib/utils` - Utility functions (cn for className merging)

## Critical Refactoring Considerations

### ⚠️ DO NOT REMOVE OR MODIFY:

1. **VISUAL_CONSTANTS object** - Contains all magic numbers and configuration
2. **Memoized calculation functions** - Critical for performance
3. **Timeout management system** - Prevents memory leaks
4. **Mouse position tracking logic** - Core functionality
5. **State management structure** - Controls all visual effects
6. **Style generator functions** - Creates all dynamic styles
7. **Container refs** - Required for position calculations

### ✅ Safe to Modify:

- CSS class names (with corresponding style updates)
- Color palette values in VISUAL_CONSTANTS
- Timing values in VISUAL_CONSTANTS
- Logo dimensions
- Instruction text content

### 🔴 High-Risk Areas:

- Event handler logic (lines 220-253)
- Calculation function dependencies
- State transition logic
- Ref management system

## Usage Example

```tsx
import { AppShellBranded } from '@/src/components/layout/app-shell-branded';

function LandingPage() {
   return (
      <div className="h-screen">
         <AppShellBranded className="custom-styles" />
      </div>
   );
}
```

> **📝 Implementation Notes:** See the actual implementation in [`app-shell-branded.tsx`](../../src/components/layout/app-shell-branded.tsx) for complete code examples and detailed inline documentation.

## Props Interface

```typescript
interface AppShellBrandedProps {
   className?: string; // Optional additional CSS classes
}
```

## State Management

The component manages 5 primary states:

1. `isMouseOver` - Whether mouse is over the component
2. `isMouseMoving` - Whether mouse is actively moving
3. `isIdle` - Whether component is in idle state (after timeout)
4. `isFading` - Whether component is in fade-out state
5. `mousePosition` - Current mouse coordinates relative to container

## Visual Effects Breakdown

### Shadow Effects

- Dynamic drop-shadow that follows mouse movement
- Blur and opacity based on distance from logo center
- Color transitions through predefined palette

### Glow Effects

- Radial gradient that follows mouse position
- Intensity based on distance from logo
- Blend mode for visual integration

### Grid Effects

- Multi-layer gradient patterns
- Opacity based on mouse proximity
- Complex mask patterns for texture

### Hover Effects

- Explosive radial glow animation
- CSS transition-based scaling
- Immediate visual feedback

## Maintenance Notes

- All calculations are performance-optimized with memoization
- Timeout cleanup is critical to prevent memory leaks
- State transitions are carefully orchestrated for smooth UX
- Visual constants should be modified carefully to maintain effect quality
- Component is designed for full-screen usage with proper aspect ratios

---

## Related Files & Documentation

- **📁 Component Implementation:** [`src/components/layout/app-shell-branded.tsx`](../../src/components/layout/app-shell-branded.tsx)
- **📚 Terminology Definition:** [App Shell Branded](../../docs/terminology.md#11-app-shell-branded)
- **🏗️ Layout System:** [Layout System Specification](../../docs/layout-system.md)
- **📋 Component Standards:** [Component Architecture Standards](../../components/standards/component-architecture.md)

> **🔄 Cross-References:** This documentation and the component file contain bidirectional references for easy navigation between implementation details and conceptual understanding.
