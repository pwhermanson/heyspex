# UI Main Layout Design - Spotify-Inspired Redesign

> **IMPORTANT:** Implement ONE PHASE AT A TIME for review. After each phase completion, we will discuss the plan for the next phase.

## Overview

This document outlines the complete redesign of the main layout to match a Spotify-inspired interface with full-width top and bottom bars, ChatGPT-style collapsible left sidebar, and a draggable bottom split area.

## Current State Analysis

### Current Layout Structure
- Three-panel layout with resizable left/right sidebars
- Headers embedded within the main content area
- Left sidebar with header section containing `OrgSwitcher`/`BackToApp` and a toggle button
- Right sidebar trigger in the top navigation area
- No dedicated top/bottom bars spanning full width

### Screenshot Analysis (main-layout-ui.jpg)
From the Spotify-inspired wireframe provided:
- **Top Bar**: Full-width dark header with navigation controls, search, and profile area
- **Left Sidebar**: Collapsed to icon-only state (like ChatGPT), showing vertical icons
- **Main Content**: Central content area with its own header
- **Right Sidebar**: Visible on the far right
- **Bottom Bar**: Full-width footer with what appears to be a drag handle above it

### Issues to Resolve
1. **Duplicate Left Sidebar Toggles**: Currently two toggle buttons exist (one in sidebar header, one in content header)
2. **No Global Navigation**: Headers are embedded in content instead of spanning full width
3. **Complete Sidebar Hide**: Left sidebar completely disappears when collapsed instead of icon-only rail
4. **No Bottom Bar**: Missing global status area and draggable split functionality

## Implementation Phases

### Phase 1: Create TopBar Component and Move Header Functionality ⏳
**Objective**: Create a full-width TopBar that spans above the three-panel layout and consolidate existing header functionality.

**Tasks**:
1. Create `components/layout/top-bar.tsx`
2. Move `OrgSwitcher`/`BackToApp` from left sidebar header to TopBar
3. Integrate existing header-nav functionality (search, notifications)
4. Add profile circle menu placeholder
5. Update main layout to include TopBar in grid structure

### Phase 2: Icon-Only Left Sidebar Collapse
**Objective**: Change left sidebar collapse behavior to ChatGPT-style icon rail instead of complete hiding.

**Tasks**:
1. Modify sidebar collapse logic to support 'collapsed' vs 'open' (remove 'hidden')
2. Implement 64px icon-only rail with tooltips
3. Add smooth text fade animations
4. Update state management for new collapse behavior

### Phase 3: BottomBar with Draggable Split
**Objective**: Add full-width bottom bar with adjustable split area above it.

**Tasks**:
1. Create `components/layout/bottom-bar.tsx`
2. Implement draggable split handle component
3. Add state management for center-bottom-split (0-300px)
4. Add keyboard accessibility for split adjustment

### Phase 4: Cleanup and Enhancement
**Objective**: Remove duplicate controls, enhance profile menu, and polish interactions.

**Tasks**:
1. Remove duplicate left sidebar toggle from sidebar header
2. Move demo user dropdown into profile circle menu
3. Polish animations and accessibility
4. Final testing and refinement

## Detailed Implementation Plan

### 1. App Shell Structure Redesign
**Current**: Single grid with three panels
**New**: Three-row layout with TopBar, MainArea, BottomBar

```css
.app-shell {
  height: 100vh;
  display: grid;
  grid-template-rows: 56px 1fr 56px; /* TopBar, MainArea, BottomBar */
}
```

### 2. TopBar Implementation
**Purpose**: Global navigation and controls spanning full width

**Content Migration**:
- **From Left Sidebar Header**: Move `OrgSwitcher`/`BackToApp` to TopBar left section
- **From Current Headers**: Integrate existing header-nav functionality
- **Add**: Profile circle menu on the right side

**Structure**:
```
TopBar Layout:
[App Logo] [OrgSwitcher] [Navigation] [Center Search] [Notifications] [Profile Circle]
```

**Components to Create**:
- `components/layout/top-bar.tsx` - Main TopBar component
- Move demo user dropdown into profile circle menu (Phase 4)

### 3. Left Sidebar Icon-Only Collapse
**Current**: Completely hides when collapsed
**New**: ChatGPT-style icon rail (64px width)

**Implementation Details**:
- **Collapsed State**: 64px width with icons only, no text labels
- **Open State**: 280px width with full content
- **Transition**: Smooth width animation with text fade
- **Tooltips**: Show on hover when collapsed

**State Management Updates**:
```typescript
type LeftState = 'open' | 'collapsed'; // Remove 'hidden' state
const COLLAPSED_WIDTH = 64;
```

### 4. BottomBar with Draggable Split
**Purpose**: Global status area with resizable content above

**Features**:
- Full-width bottom bar (56px height)
- Draggable split handle above BottomBar
- Adjustable space (0-300px) for future features (logs, timeline, etc.)
- Keyboard accessible with arrow key controls

**CSS Variables**:
```css
:root {
  --center-bottom-split: 0px; /* Adjustable split height */
  --bottombar-height: 56px;
}
```

### 5. Remove Duplicate Left Sidebar Toggle
**Problem**: Two toggle buttons (one in sidebar header, one in content header)
**Solution**: Keep only the one in the top-left corner of MainContent area, remove the one from sidebar header

### 6. Content Layout Updates
**MainArea Structure**:
```
MainArea (middle row of app-shell):
├── main-grid (contains 3 panels)
│   ├── LeftSidebar (icon-only when collapsed)
│   ├── MainContent
│   └── RightSidebar
├── split-handle (draggable)
└── [adjustable space above BottomBar]
```

### 7. CSS Grid Variables System
```css
:root {
  --left-open: 280px;
  --left-collapsed: 64px;
  --right-open: 320px;
  --right-hidden: 0px;
  --topbar-height: 56px;
  --bottombar-height: 56px;
  --center-bottom-split: 0px;
}

.main-grid {
  grid-template-columns: var(--left-width) 1fr var(--right-width);
  transition: grid-template-columns 200ms ease;
}
```

### 8. Profile Menu Enhancement
**Migration**: Move demo user dropdown from its current location into the profile circle menu
**New Structure**: Profile circle opens menu containing:
- User profile options
- Demo user switcher (relocated)
- Account settings
- Sign out

### 9. State Management Updates
**ResizableSidebarProvider Enhancements**:
- Add `centerBottomSplit` state (0-300px range)
- Add `setCenterBottomSplit` function
- Add localStorage persistence for split height
- Update left sidebar states to remove 'hidden', add 'collapsed'

### 10. Accessibility Implementation
- TopBar: `role="banner"`
- BottomBar: `role="contentinfo"`
- Split handle: `role="separator"` with `aria-orientation="horizontal"`
- Icon tooltips: `aria-label` for collapsed sidebar icons
- Keyboard navigation: Arrow keys for split adjustment

## Files to Modify/Create

### New Components (Per Phase):
**Phase 1**:
- `components/layout/top-bar.tsx` - Global top navigation

**Phase 2**:
- Update `components/layout/sidebar/app-sidebar.tsx` for icon-only mode

**Phase 3**:
- `components/layout/bottom-bar.tsx` - Global bottom bar
- `components/layout/split-handle.tsx` - Draggable split component

**Phase 4**:
- `components/layout/profile-menu.tsx` - Enhanced profile dropdown

### Major Updates (Per Phase):
**Phase 1**:
- `components/layout/main-layout.tsx` - Add TopBar to grid structure
- All `header-nav.tsx` files - Integration with TopBar

**Phase 2**:
- `components/layout/sidebar/app-sidebar.tsx` - Icon-only collapse mode
- `components/layout/sidebar/resizable-sidebar-provider.tsx` - Update collapse logic

**Phase 3**:
- `components/layout/main-layout.tsx` - Add BottomBar and split area
- `components/layout/sidebar/resizable-sidebar-provider.tsx` - Add bottom split state

**Phase 4**:
- Remove duplicate controls and cleanup
- Move demo user dropdown to profile menu

### CSS Updates:
- `app/globals.css` - Add new CSS custom properties and grid system
- Update component styles for new layout structure

## Technical Implementation Details

### State Management
```typescript
type LeftState = 'open' | 'collapsed';
type RightState = 'open' | 'hidden';

const [leftState, setLeftState] = useState<LeftState>('open');
const [rightState, setRightState] = useState<RightState>('hidden');
const [centerBottomSplit, setCenterBottomSplit] = useState(0);
```

### CSS Grid Layout
```css
.app-shell {
  height: 100vh;
  display: grid;
  grid-template-rows: var(--topbar-height) 1fr var(--bottombar-height);
}

.main-area {
  display: grid;
  grid-template-rows: 1fr var(--center-bottom-split);
  height: 100%;
}

.main-grid {
  display: grid;
  grid-template-columns:
    var(--left-width) var(--gutter) 1fr var(--gutter) var(--right-width);
  height: 100%;
  transition: grid-template-columns 200ms ease;
}
```

### Persistence
All layout states will be persisted to localStorage:
- `ui:leftState`
- `ui:leftWidth`
- `ui:rightState`
- `ui:rightWidth`
- `ui:centerBottomSplit`

## Acceptance Criteria

### Phase 1: TopBar
- ✅ TopBar renders above all content and spans full width
- ✅ Contains items previously in LeftSidebar top section (OrgSwitcher/BackToApp)
- ✅ Integrates existing header-nav functionality (search, notifications)
- ✅ Profile circle placeholder is present on the right side
- ✅ Main layout structure updated to accommodate TopBar

### Phase 2: Icon-Only Sidebar
- ✅ Left sidebar collapses to 64px icon-only rail
- ✅ Icons remain visible with text labels hidden when collapsed
- ✅ Smooth transitions and animations
- ✅ Tooltips show on hover for collapsed icons
- ✅ Toggle between open (280px) and collapsed (64px) states

### Phase 3: BottomBar & Split
- ✅ BottomBar renders below all content and spans full width
- ✅ Draggable split handle above BottomBar adjusts content area
- ✅ Split height persists across browser sessions
- ✅ Keyboard accessibility for split adjustment
- ✅ Range: 0-300px adjustable space

### Phase 4: Polish & Cleanup
- ✅ Single left sidebar toggle (duplicate removed)
- ✅ Demo user dropdown moved to profile circle menu
- ✅ All animations smooth and performant
- ✅ No layout jank or scroll issues
- ✅ Full accessibility compliance

---

**Current Phase**: Phase 1 - TopBar Implementation
**Next Review**: After TopBar component creation and basic integration