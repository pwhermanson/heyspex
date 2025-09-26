# HeySpex Layout Terminology

## Overview

This document defines the standardized terminology and naming conventions used throughout the HeySpex application layout system. The terminology is designed to be clear, consistent, and avoid conflicts with high-level application concepts.

## Naming Convention

- **Technical Names**: Used in code, variables, and implementation
- **Nicknames**: Used in UI/UX, user-facing text, and documentation

## Layout Component Terminology

### 1. App Shell (Layout Container)

- **Technical**: `app-shell` or `layout-container`
- **Nickname**: "App Shell"
- **Purpose**: The outermost container that holds everything. This is where the empty state logo and "get started" text will appear when all panels are closed.

#### 1.1 App Shell Branded

- **Technical**: `app-shell-branded`
- **Nickname**: "App Shell Branded"
- **Purpose**: The interactive, animated logo display component that serves as the main landing page element. It creates dynamic visual effects based on mouse movement and hover states, featuring multi-layer animations, distance-based calculations, and smooth state transitions. This component appears when all panels are closed and provides an engaging visual experience with real-time mouse tracking, shadow effects, radial glows, animated color transitions, and grid background patterns.

### 2. Global Control Bar (Navigation Bar)

- **Technical**: `control-bar` or `navigation-bar`
- **Nickname**: "Main Control Bar"
- **Purpose**: Global app bar for navigation and universal actions. Can be mounted to any side of the viewport (top/left/right/bottom) and can be hidden when panels go fullscreen.

#### 2.1 Panel Control Bar

- **Technical**: `panel-control-bar`
- **Nickname**: "Panel Control Bar"
- **Purpose**: A header-level control bar that belongs to an entire panel (e.g., Left/Center/Right panels). It typically contains panel-scoped actions like expand/collapse to fullscreen. Appears at the top edge of a panel.

#### 2.2 Screen Control Bar

- **Technical**: `screen-control-bar`
- **Nickname**: "Screen Control Bar"
- **Purpose**: A header-level control bar inside a panel that belongs to the currently loaded screen (e.g., Issues screen). It typically contains screen-scoped actions such as Filter, Display, view mode toggles, etc. It sits beneath any Panel Control Bar if both are present.

##### Fullscreen Expand Icon (Behavior Reference)

- Visual: two arrows at a 45° angle
- Default action: expands the panel to the full viewport (width and height), gracefully pushing other panels off-viewport
- Global/Main Control Bar: remains visible by default during fullscreen
- Visibility of Global/Main Control Bar during fullscreen is user-configurable via Command Palette, keyboard shortcut, and Settings → Views

### 3. Workspace Zone A (Primary Workspace Zone)

- **Technical**: `workspace-zone-a` or `primary-workspace-zone`
- **Nickname**: "Workspace Zone A"
- **Purpose**: Contains 1 workspace with 3 panels (left, center, right)

### 4. Workspace Zone A Panels (Screen Containers)

- **Left Panel**: `left-viewport` (nickname: "Left Panel")
- **Center Panel**: `center-viewport` (nickname: "Center Panel")
- **Right Panel**: `right-viewport` (nickname: "Right Panel")
- **Purpose**: Areas where users can load different screens
- **Panel Empty State**: When a panel has no screen loaded, it displays the panel's background and empty state content. This is distinct from screen backgrounds which are only shown when a screen is actively loaded.

### 5. Workspace Zone B (Secondary Workspace Zone)

- **Technical**: `workspace-zone-b` or `secondary-workspace-zone`
- **Nickname**: "Workspace Zone B"
- **Purpose**: Contains 3 different workspaces:
   - 1 workspace with 1 panel (full-width)
   - 1 workspace with 2 panels (2-split)
   - 1 workspace with 3 panels (3-split)

### 6. Workspace Zone B Panels (Screen Containers within Secondary Workspace)

- **Secondary Workspace Panel 1**: `secondary-viewport-1` (nickname: "Secondary Workspace Panel 1")
- **Secondary Workspace Panel 2**: `secondary-viewport-2` (nickname: "Secondary Workspace Panel 2")
- **Secondary Workspace Panel 3**: `secondary-viewport-3` (nickname: "Secondary Workspace Panel 3")
- **Purpose**: Individual panels within the secondary workspace that can load screens

### 7. Sections (Content Subdivisions within Screens)

- **Technical**: `section-1`, `section-2`, etc.
- **Nickname**: "Section 1", "Section 2", etc.
- **Purpose**: Content subdivisions within screens (e.g., Inbox list and detail areas)

### 8. Views (Saved Configuration Feature)

- **Technical**: `view` or `saved-view`
- **Nickname**: "View"
- **Purpose**: A feature where users can save their configuration of Workspace Zones and Panels within those zones as well as screens pre-loaded in those panels

## High-Level Application Terminology

### User Workspace (Top-Level Application Concept)

- **Technical**: `user-workspace` or `workspace`
- **Nickname**: "Workspace"
- **Purpose**: The highest-level application concept where a coder works on their project with one or more repos that all belong together. Each workspace is owned and associated with the user who created it.

## Key Terminology Distinctions

### User Workspace vs Workspace Zone

- **User Workspace**: The highest-level application concept where a coder works on their project with one or more repos. Each workspace is owned by a user and contains its own complete layout configuration.
- **Workspace Zone**: Layout container within a User Workspace that holds panels (e.g., Workspace Zone A, Workspace Zone B)

### Panel vs Section

- **Panel**: A container that can load different screens (e.g., Left Panel, Center Panel)
- **Section**: Content subdivisions within screens (e.g., Inbox list area, Inbox detail area)

### Technical vs Nickname Usage

- **Technical Names**: Always used in code, variables, functions, and implementation
- **Nicknames**: Always used in UI/UX, user-facing text, documentation, and tooltips

## Migration from Old Terminology

| Old Term  | New Technical Name | New Nickname     |
| --------- | ------------------ | ---------------- |
| Section 0 | control-bar        | Control Bar      |
| Section A | left-viewport      | Left Panel       |
| Section B | center-viewport    | Center Panel     |
| Section C | right-viewport     | Right Panel      |
| Section D | workspace-zone-b   | Workspace Zone B |

## Implementation Guidelines

- All layout components should use technical names internally
- UI components should display nicknames to users
- Type definitions should include both technical names and nicknames
- Code comments should use technical names
- User documentation should use nicknames

## Related Documents

- [Layout System Specification](./layout-system.md) - Complete system architecture and features
- [Component Architecture Standards](../components/standards/component-architecture.md)
- [Layout Configuration Store](../store/layout-config-store.ts)
