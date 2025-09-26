# Branded Component Configuration

This document describes how to configure and switch between different branded component variants in HeySpex.

## Overview

HeySpex supports multiple branded component variants to optimize performance and provide flexibility during development:

- **Full Component** (`AppShellBranded`): Complete interactive experience with all visual effects
- **Simple Component** (`AppShellBrandedSimple`): Minimal version with just logo and help text

## Configuration Methods

### 1. Environment Variables

Create a `.env.local` file in your project root:

```bash
# .env.local
NEXT_PUBLIC_BRANDED_COMPONENT=simple  # or 'full'
```

**Available Values:**

- `full` - Uses the full interactive AppShellBranded component (default)
- `simple` - Uses the minimal AppShellBrandedSimple component

### 2. NPM Scripts

Use the provided npm scripts to start the server with specific component variants:

```bash
# Start with simple branded component
pnpm dev:simple

# Start with full branded component
pnpm dev:full

# Default (uses environment variable or falls back to 'full')
pnpm dev
```

## Component Variants

### Full Component (`AppShellBranded`)

**Features:**

- Interactive mouse tracking
- Multi-layer visual effects (shadows, glows, grids)
- Animated color transitions
- Smooth state management
- Performance-optimized calculations

**Use Cases:**

- Production environments
- When you want the full visual experience
- Performance is not a primary concern

**Performance Impact:**

- Higher resource usage
- More complex calculations
- Slower initial load

### Simple Component (`AppShellBrandedSimple`)

**Features:**

- Static logo display
- Help text with keyboard shortcuts
- Black background
- No animations or effects

**Use Cases:**

- Development and testing
- Performance-critical scenarios
- Minimal UI requirements
- When debugging layout issues

**Performance Impact:**

- Minimal resource usage
- Fast loading
- No complex calculations

## Implementation Details

### Configuration System

The configuration is managed through:

```
src/lib/config/branded-component-config.ts
```

**Key Functions:**

- `getBrandedComponentConfig()` - Gets full configuration object
- `shouldUseSimpleBranded()` - Returns true if simple component should be used
- `shouldUseFullBranded()` - Returns true if full component should be used

### Component Selection

The main layout automatically selects the appropriate component:

```tsx
// In main-layout.tsx
shouldUseSimpleBranded() ? <AppShellBrandedSimple /> : <AppShellBranded />;
```

## Development Workflow

### Quick Testing

1. **Test Simple Component:**

   ```bash
   pnpm dev:simple
   ```

2. **Test Full Component:**

   ```bash
   pnpm dev:full
   ```

3. **Switch During Development:**
   - Stop the server
   - Change the environment variable in `.env.local`
   - Restart with `pnpm dev`

### Performance Comparison

| Metric       | Full Component | Simple Component |
| ------------ | -------------- | ---------------- |
| Initial Load | ~5-6 seconds   | ~1-2 seconds     |
| Bundle Size  | Larger         | Minimal          |
| Memory Usage | Higher         | Lower            |
| CPU Usage    | Higher         | Minimal          |

## Troubleshooting

### Component Not Switching

1. **Check Environment Variable:**

   ```bash
   echo $NEXT_PUBLIC_BRANDED_COMPONENT
   ```

2. **Verify .env.local File:**

   - Ensure file exists in project root
   - Check for typos in variable name
   - Restart the development server

3. **Clear Next.js Cache:**
   ```bash
   pnpm clean
   pnpm dev
   ```

### Performance Issues

If you're experiencing slow loading:

1. **Use Simple Component:**

   ```bash
   pnpm dev:simple
   ```

2. **Check Console for Errors:**

   - Look for JavaScript errors
   - Check for missing dependencies

3. **Monitor Resource Usage:**
   - Use browser dev tools
   - Check Network tab for slow requests

## File Structure

```
src/
├── components/layout/
│   ├── app-shell-branded.tsx          # Full interactive component
│   └── app-shell-branded-simple.tsx   # Simple static component
├── lib/config/
│   └── branded-component-config.ts    # Configuration system
└── components/layout/
    └── main-layout.tsx                # Component selection logic
```

## Future Enhancements

Potential improvements to the configuration system:

1. **Runtime Switching:** Allow switching components without server restart
2. **A/B Testing:** Support for randomized component selection
3. **Performance Monitoring:** Automatic performance metrics collection
4. **More Variants:** Additional component variants for specific use cases

## Related Documentation

- [App Shell Branded Component](../components/app-shell-branded.md)
- [Component Architecture Standards](../components/standards/component-architecture.md)
- [Layout System Specification](../layout-system.md)
