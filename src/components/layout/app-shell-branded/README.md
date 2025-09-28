# App Shell Branded System

This directory contains all components and utilities related to the interactive logo display and visual effects system.

## 📁 Directory Structure

```
app-shell-branded/
├── index.ts                    # Centralized exports
├── README.md                   # This documentation
├── app-shell-branded.tsx       # Main interactive component
├── app-shell-branded-simple.tsx # Simplified fallback component
├── stable-app-shell.tsx        # Wrapper component with SSR handling
└── shadow/                     # Shadow system module
    ├── index.ts               # Shadow system exports
    ├── shadow-constants.ts    # Configuration constants
    ├── shadow-calculations.ts # Math calculations & utilities
    ├── shadow-layer.tsx       # Shadow rendering component
    └── use-shadow.ts          # Custom hook for shadow logic
```

## 🎯 Component Hierarchy

```
StableAppShell
├── AppShellBranded (full interactive version)
└── AppShellBrandedSimple (simplified fallback)
```

## 🔧 Key Features

- **Interactive Visual Effects**: Mouse-following glow, grid lines, shadows
- **Performance Optimized**: Memoization, throttling, hardware acceleration
- **SSR Compatible**: Graceful hydration with fallback components
- **Modular Architecture**: Separated concerns with dedicated shadow system
- **Error Resilient**: Comprehensive error handling and graceful fallbacks

## 📦 Usage

```tsx
import { StableAppShell } from '@/src/components/layout/app-shell-branded';

// Use in your layout
<StableAppShell />;
```

## 🎨 Visual Effects

- **Glow Effect**: Radial gradient that follows mouse movement
- **Grid Lines**: Animated grid background with distance-based opacity
- **Shadow System**: Dynamic drop shadows with color transitions
- **Logo Brightness**: Interactive brightness changes on hover

## ⚡ Performance

- Throttled mouse events (60fps)
- Memoized calculations to prevent unnecessary re-renders
- Hardware-accelerated transforms
- Efficient state management with change detection
