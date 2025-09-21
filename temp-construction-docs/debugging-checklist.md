# Debugging Checklist for Sidebar Implementation

## Quick Visual Tests

### 1. Initial Load Test
- [ ] Page loads without JavaScript errors
- [ ] Left sidebar is visible by default
- [ ] Right sidebar is hidden by default
- [ ] Right sidebar trigger button visible on right edge
- [ ] Main content is positioned correctly between sidebars

### 2. Left Sidebar Tests
- [ ] Toggle button visible in left sidebar header
- [ ] Clicking toggle button hides/shows left sidebar
- [ ] `Ctrl/Cmd + B` keyboard shortcut works
- [ ] Drag handle appears when hovering right edge (when open)
- [ ] Drag resize works smoothly
- [ ] Main content adjusts when resizing

### 3. Right Sidebar Tests
- [ ] Floating trigger button appears when right sidebar is closed
- [ ] Clicking trigger opens right sidebar
- [ ] Toggle button in right sidebar header works
- [ ] `Ctrl/Cmd + Shift + B` keyboard shortcut works
- [ ] Drag handle appears when hovering left edge (when open)
- [ ] Drag resize works smoothly

## Common Issues and Solutions

### Issue: "Cannot read properties of undefined"
**Likely Cause**: Provider not wrapping components properly
**Check**: Verify `ResizableSidebarProvider` is the outermost sidebar provider in main-layout.tsx

### Issue: Sidebars appear but don't respond to clicks
**Likely Cause**: Event handlers not connected
**Check**:
- React Developer Tools to see if state changes on clicks
- Console for JavaScript errors
- Verify useResizableSidebar hook is being used correctly

### Issue: Layout looks broken
**Likely Cause**: CSS Grid not working properly
**Check**:
- Developer Tools → Elements → Computed styles
- Look for `grid-template-columns` property
- Verify CSS custom properties are being set

### Issue: Smooth transitions not working
**Likely Cause**: CSS classes or transitions not applied
**Check**:
- Look for `transition-[grid-template-columns]` class in developer tools
- Verify `isDragging` state toggles properly
- Check if conflicting CSS is overriding transitions

## Developer Tools Inspection Points

### 1. React Developer Tools
```
Components → MainLayout → LayoutGrid → ResizableSidebarProvider
```
**Check State:**
- `leftSidebar: { isOpen: boolean, width: number, preferredWidth: number }`
- `rightSidebar: { isOpen: boolean, width: number, preferredWidth: number }`
- `isDragging: boolean`

### 2. Browser Elements Tab
**Check CSS Custom Properties on `<html>` element:**
```css
--sidebar-left-width: 244px (or 0px when closed)
--sidebar-right-width: 320px (or 0px when closed)
--grid-template-columns: 244px 1fr 0px (dynamic values)
```

### 3. Network Tab
**Check for:**
- No 404 errors for component files
- CSS files loading properly

### 4. Console Tab
**Look for:**
- React warnings about missing keys or props
- TypeScript errors about undefined properties
- localStorage access errors

## Manual Testing Steps

### Step 1: Basic Functionality
1. Open browser to `http://localhost:3000`
2. Open React Developer Tools
3. Navigate to ResizableSidebarProvider component
4. Watch state changes while clicking toggle buttons

### Step 2: CSS Grid Inspection
1. Right-click on main layout area
2. Inspect Element
3. Look for element with `grid` display
4. Check computed `grid-template-columns` value
5. Toggle sidebars and watch values change

### Step 3: Drag Handle Testing
1. Open both sidebars
2. Hover over sidebar edges
3. Look for cursor change to `col-resize`
4. Check if drag handle elements are rendered in DOM
5. Attempt to drag and watch CSS custom properties update

## Expected DOM Structure

```html
<div class="grid h-svh w-full transition-[grid-template-columns]" style="grid-template-columns: var(--grid-template-columns, 244px 1fr 0px);">
  <!-- Left Sidebar -->
  <div style="grid-area: sidebar;">
    <div data-resizable-sidebar="left">
      <!-- Sidebar content with drag handle -->
    </div>
  </div>

  <!-- Main Content -->
  <div style="grid-area: main;">
    <!-- Main content -->
  </div>

  <!-- Right Sidebar -->
  <div style="grid-area: right-sidebar;">
    <div data-resizable-sidebar="right">
      <!-- Sidebar content with drag handle -->
    </div>
  </div>

  <!-- Right Sidebar Trigger (when closed) -->
  <button class="right-sidebar-trigger">
    <!-- Trigger button -->
  </button>
</div>
```

## State Debugging Commands

Open browser console and run:

```javascript
// Check if provider is working
window.sidebarDebug = {
  getState: () => {
    // This would need to be implemented in the provider for debugging
    console.log('Check React DevTools for state');
  },

  getCSSProps: () => {
    const style = getComputedStyle(document.documentElement);
    return {
      leftWidth: style.getPropertyValue('--sidebar-left-width'),
      rightWidth: style.getPropertyValue('--sidebar-right-width'),
      gridColumns: style.getPropertyValue('--grid-template-columns')
    };
  }
};

// Run this to check CSS properties
window.sidebarDebug.getCSSProps();
```

## If Nothing Works

### Nuclear Option: Check File Integrity
1. Verify all files were saved properly
2. Check if TypeScript compilation passes: `npx tsc --noEmit`
3. Check if there are any build errors: `npm run build`
4. Try hard refresh: `Ctrl+Shift+R` or `Cmd+Shift+R`
5. Clear browser cache and localStorage

### Alternative Testing
1. Create minimal test component to verify provider works
2. Test one sidebar at a time
3. Start with just toggle functionality, then add resize