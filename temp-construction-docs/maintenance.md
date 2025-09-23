# HeySpex Maintenance Guide

## Performance Optimizations

This document outlines the performance optimizations applied to the HeySpex project and maintenance recommendations.

## Applied Optimizations

### 1. Next.js Configuration Optimizations

- **Package Import Optimization**: Added `optimizePackageImports` for Radix UI components and icon libraries
- **Font Loading Optimization**: Improved font loading with fallbacks and selective preloading
- **Compiler Optimizations**: Added console removal in production
- **Image Optimization**: Added modern image formats (WebP, AVIF)

### 2. Bundle Size Results

- **First Load JS**: 101 kB (shared by all pages)
- **Largest page**: `/[orgId]/team/[teamId]/all` at 282 kB total
- **Smallest page**: `/[orgId]/teams` at 204 kB total

## Maintenance Commands

### Development Server

```bash
# Standard development server
pnpm dev

# Optimized development server (includes experimental HTTPS)
pnpm dev:fast
```

### Build and Analysis

```bash
# Production build
pnpm build

# Build with bundle analysis
pnpm build:analyze

# Clean build artifacts
pnpm clean
```

### Code Quality

```bash
# Type checking
npx tsc --noEmit

# Linting
pnpm lint

# Formatting
pnpm format
```

## Performance Monitoring

### Bundle Size Monitoring

- Use `pnpm build:analyze` to analyze bundle composition
- Monitor the "First Load JS" size in build output
- Check individual page sizes for optimization opportunities

### Regular Maintenance

- Clean build artifacts regularly: `pnpm clean`
- Monitor for unused dependencies
- Review bundle analysis reports for optimization opportunities

## Troubleshooting

### Build Issues

- If build stalls, clean `.next` directory: `Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue`
- Or use the clean script: `pnpm clean`
- Check for TypeScript errors: `npx tsc --noEmit`
- Verify linting: `pnpm lint`

### Server Startup Issues

- Kill existing processes on port 3000: `taskkill /F /IM node.exe`
- Use optimized dev script: `pnpm dev:fast`
- Check for permission issues with `.next` directory
- Clean build artifacts: `pnpm clean`

## Notes

- The optimizations focus on reducing bundle size and improving loading efficiency
- Dynamic imports were avoided in Server Components to prevent build issues
- Package import optimization helps with tree shaking and bundle splitting
