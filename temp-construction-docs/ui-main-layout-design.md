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
- **Top Bar (Section 0)**: Full-width dark header with navigation controls, search, and profile area
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

#### 2.1 Terminology and Contracts: Section vs Screen Control Bars
**Goal**: Prevent feature drift and keep controls consistent across Sections A/B/C and any loaded screen.

- **Section control bar (A/B/C)**: The top-most bar inside each section. Owns section-level controls only.
  - Contains: tabs (or just a “+” and title when only one tab), section title, and the section’s expand icon (top-right).
  - Does NOT contain: global search, notification bell, or screen-specific filters.
- **Screen control bar (per-screen, optional)**: Renders immediately below the Section control bar when the loaded screen provides one.
  - Contains: screen-specific actions such as Filter, Display, view modes, screen-local search if that screen defines its own narrow-scoped search (not global search).
  - Never contains: section expand, global search, or global notifications.

Specifics for Section B (currently showing Projects):
- The expand icon belongs to the top Section control bar (not the Projects bar).
- The Projects Filter/Display controls remain in the Screen control bar below the Section control bar.
- The notification bell has been removed from Section B’s bars; global bell remains in Section 0 (Top Bar).
- Global search is in Section 0 (Top Bar) at the right, not in Section B.

Layout guidance for Section control bar:
- Left: tabs or a single “+” and section title when only one tab exists.
- Right: section expand icon (top-right alignment is required).

Quality checks:
- Expand icon appears only in the Section control bar for A/B/C.
- If a screen has its own control bar, it renders exactly one row below the Section control bar.

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

### 6. Expand / Fullscreen Behavior (Sections A/B/C)
**Objective**: A one-click expand for any section that hides global chrome visually but preserves state for restoration.

- Introduce `fullscreenSection: null | 'A' | 'B' | 'C'` in layout provider.
- When `fullscreenSection` is set:
  - Hide Section 0 (Top Bar) and Section D (Bottom Bar) visually by driving CSS variables (do not mutate their persisted settings).
  - Visually set other sections’ widths to 0 using CSS variables only; do not change A/C `isOpen` or `preferredWidth`.
  - Remove container borders/radius for the expanded section’s main container so it truly fills the viewport.
- On exit (set `fullscreenSection = null`):
  - Restore previous CSS variable widths and show Section 0/D again.
  - A/C sidebars return to their prior widths/open state from persistence.

Quality checks:
- Toggling expand on B does not erase A/C widths or states.
- Bottom bar returns to the precise prior height/mode after exit.
- Keyboard focus remains within the expanded section and returns gracefully on exit.

### 7. Tabs and Screen Selector (Sections A/B/C)
**Objective**: Load any screen into any section using tabs.

- Tabs per section with persistence: `tabs: Record<'A'|'B'|'C', ScreenTab[]>`, `activeTab: Record<'A'|'B'|'C', string|null>`.
- Single-tab UX: show only a “+” at far-left plus section title; no visible tab strip.
- Multiple tabs UX: visible tabs with close buttons and an always-visible “+” at far-left.
- Screen Selector modal (opens on “+”): pre-selects the clicked section, searchable registry of screens (id, label, icon, component).
- Avoid global controls in tabs; tabs only switch screens for the section.

Quality checks:
- Creating, closing, and switching tabs do not alter Section control bar contents/placement.
- Projects screen shows its Screen control bar beneath the Section control bar when active.

#### 7.1 Screen Registry (Central Catalog)
The Screen Selector reads from a typed registry of all screens that can be loaded into A/B/C. This keeps discovery, loading, and UX consistent.

Type shape:
```ts
export type ScreenId =
  | 'issues' | 'features' | 'roadmap' | 'projects' | 'teams'
  | 'members' | 'inbox' | 'ai-chat' | 'unit-tests' | 'flows';

export interface ScreenDefinition {
  id: ScreenId;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  // Prefer lazy loading to keep initial bundle small
  load: () => Promise<{ default: React.ComponentType<any> }>;
  hasScreenControlBar?: boolean; // e.g., Projects, Issues
  keywords?: string[]; // Modal search
  enabled?: boolean; // Feature flag
}

export const screenRegistry: Record<ScreenId, ScreenDefinition> = {
  projects: {
    id: 'projects',
    label: 'Projects',
    icon: ProjectsIcon,
    load: () => import('@/components/screens/projects-screen'),
    hasScreenControlBar: true,
    keywords: ['board', 'initiatives', 'plans'],
    enabled: true,
  },
  issues: {
    id: 'issues',
    label: 'Issues',
    icon: IssuesIcon,
    load: () => import('@/components/screens/issues-screen'),
    hasScreenControlBar: true,
    keywords: ['bugs', 'tickets'],
    enabled: true,
  },
  // ...others
};
```

Notes:
- Unique `id` values enable stable tab persistence and restoration.
- `hasScreenControlBar` determines whether to render a Screen control bar below the Section control bar.
- Use `keywords` for modal search quality; use `enabled` for gradual rollout.

### 8. Sidebars A/C Collapsed Rail Spec (Predictable, independent)
**Objective**: Ensure reliable collapsed rails that are always visible and independent of loaded content.

- Collapsed width: maintain a minimal, consistent rail (e.g., 64px) across A and C.
- The rail must always display the open/close trigger and icons with tooltips.
- Content from any screen must not overlap the rail; enforce via z-index and container padding where necessary.
- A and C operate independently; toggling one never mutates the other.
- Persistence: remember `isOpen`, `width`, and `preferredWidth` per side.

Quality checks:
- With arbitrary screens loaded, the rail remains visible and interactive.
- Resizing works only when open; rails remain fixed-width when collapsed.

### 9. State Model and CSS Variables (Contract)
**Canonical CSS variables** (set on `:root`):
- `--sidebar-left-width`, `--sidebar-right-width`, `--grid-template-columns`, `--bottombar-height`.
- Fullscreen drives visual zeroing via these variables; it does not overwrite persisted store values.

Persistence keys:
- Left/Right: open, width, preferredWidth.
- Bottom bar: mode, height, visibility, overlay position (as applicable).
- Optionally: `fullscreenSection` if persistence is desired (otherwise session-only).

Quality checks:
- On reload, sidebars and bottom bar restore from persistence without layout jank.
- Reduced motion preference respected for transitions.

### 10. Top Bar (Section 0) Specifics
- Global search is on the right side of Section 0 (Top Bar). The old center search is removed.
- Global notifications remain on the right in Section 0.
- Section B (and others) must not reintroduce global search or bell in their bars.

### 11. Animations and Timing
- Grid column transitions: 200–300ms ease-in-out.
- Sidebar drag disables transitions while dragging; re-enable after mouseup.
- Respect `prefers-reduced-motion` to minimize or disable animations.

### 12. Responsive and Accessibility
- Responsive: on small screens, rails may hide under a breakpoint-specific rule, but toggles must remain accessible (e.g., Top Bar triggers).
- Accessibility: roles for Top Bar (`banner`), Bottom Bar (`contentinfo`), split handle (`separator` + `aria-orientation`), tooltips with `aria-label`.
- Keyboard shortcuts (future phase): toggles for A/C and expand per section; ensure focus management when entering/exiting fullscreen.

### 13. Cross-Feature QA Checklist
- Expand B while A is collapsed: rails remain visible; exit restores correctly.
- Expand with Bottom Bar in push/overlay modes and non-zero height: exit restores exact height/mode.
- Switch tabs in B while expanded: no layout shift in Section control bar; Screen control bar changes appropriately.
- Load a screen without a Screen control bar: only Section control bar is visible; layout does not shift vertically.

### 14. Context from Feature Ideas (Alignment)
This layout plan aligns with the broader goals captured in the feature ideas document and brings forward the minimal context needed to keep implementation coherent:

- Views and Settings integration (future phases):
  - A settings UI will expose Section enable/disable, Views create/save/access, default view selection, and keyboard shortcut customization.
  - The layout should keep state shape compatible with future Views (e.g., tabs per section, activeTab, sectionVisibility, widths) to allow saving/restoring.

- Keyboard shortcuts (roadmap):
  - Global: toggle left/right sidebars; focus sections; expand/exit fullscreen for A/B/C; quick open Screen Selector.
  - Ensure focus management and ARIA roles added above are compatible with future shortcut handling.

- AI layout control (roadmap):
  - Natural-language commands (e.g., “show Issues in right sidebar”, “expand Section B”) should map to the same provider APIs (`setLeftSidebarOpen`, `setRightSidebarOpen`, `setFullscreenSection`, tab operations).
  - Keep provider APIs deterministic and idempotent to support AI-driven flows.

- Screen registry (for Screen Selector):
  - Define a typed registry listing screens the user can load into any section (Issues, Features, Roadmap, Projects, Teams, Members, Inbox, AI Chat, Unit Tests, Flows, etc.).
  - Each entry includes: `id`, `label`, `icon`, `component`, and optional `hasScreenControlBar` flag.

- Naming of layout areas (reference):
  - Section 0 (Top Bar), A (Left), B (Center), C (Right), D (Bottom). This doc’s terminology and control-bar contracts reflect that model.

Quality checks:
- Provider state and UI contracts remain compatible with saving/loading Views.
- Shortcuts and AI can call the same provider APIs without special cases.

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

### Global (Cross-Feature)
- ✅ Section vs Screen control bars are distinct: expand icon only in Section control bars (top-right), screen actions only in Screen control bars below.
- ✅ Section B uses two bars correctly: Section (top) with expand; Projects screen bar (bottom) with Filter/Display; no bell/search in Section B.
- ✅ A/C collapsed rails: fixed minimal width, always visible, triggers accessible, independent behavior.
- ✅ Fullscreen: `fullscreenSection` hides Section 0/D visually, zeroes other sections via CSS vars, and restores prior widths/modes on exit.
- ✅ Tabs: single-tab “+” behavior, modal screen selector, persistence, no interference with Section control bar layout.
 - ✅ Layout state compatible with future Views, keyboard shortcuts, and AI control.

---

**Current Phase**: Phase 1 - TopBar Implementation
**Next Review**: After TopBar component creation and basic integration