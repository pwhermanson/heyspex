# HeySpex Layout System

## Overview

This document defines the complete layout system specification for the HeySpex application, including architectural hierarchy, positioning capabilities, feature specifications, and system behavior. For terminology and naming conventions, see [Layout Terminology](./terminology.md).

## High-Level Application Structure

### User Workspace (Top-Level Application Concept)

- **Technical**: `user-workspace` or `workspace`
- **Nickname**: "Workspace"
- **Purpose**: The highest-level application concept where a coder works on their project with one or more repos that all belong together. Each workspace is owned and associated with the user who created it.
- **Features**:
   - Users can create multiple workspaces
   - Users can switch between workspaces
   - Each workspace has its own complete layout configuration
   - Workspace switching is triggered from the main account settings/profile icon dropdown menu

## Complete Hierarchy Structure

```
User Workspace (user-workspace) - Top-level application concept
├── Workspace Management Features
│   ├── Create New Workspace (triggered from profile dropdown)
│   ├── Switch Workspace (triggered from profile dropdown)
│   └── Workspace Settings
├── App Shell (layout-container)
│   ├── Control Bar (control-bar) - can be hidden during fullscreen
│   ├── Workspace Zone A (workspace-zone-a)
│   │   └── 1 workspace with 3 panels
│   │       ├── Left Panel (left-viewport) - can load screens
│   │       ├── Center Panel (center-viewport) - can load screens
│   │       └── Right Panel (right-viewport) - can load screens
│   └── Workspace Zone B (workspace-zone-b)
│       ├── 1 workspace with 1 panel (full-width)
│       ├── 1 workspace with 2 panels (2-split)
│       └── 1 workspace with 3 panels (3-split)
│           ├── Secondary Workspace Panel 1 (secondary-viewport-1)
│           ├── Secondary Workspace Panel 2 (secondary-viewport-2)
│           └── Secondary Workspace Panel 3 (secondary-viewport-3)
└── Views Feature (per-workspace):
    ├── View 1: Saved configuration of Workspace Zones and Panels
    ├── View 2: Different configuration of Workspace Zones and Panels
    └── View 3: Another configuration of Workspace Zones and Panels

Within each Screen:
├── Section 1 (section-1) - e.g., Inbox list
├── Section 2 (section-2) - e.g., Inbox detail
└── Section 3 (section-3) - e.g., Inbox actions
```

## System Features

### Workspace Management Features

- **Create New Workspace**: Users can create additional workspaces for different projects
- **Switch Workspace**: Users can switch between their existing workspaces
- **Workspace Settings**: Each workspace has its own configuration and settings
- **Access Point**: Workspace management is triggered from the main account settings/profile icon dropdown menu

### Views Feature

- Users can save their configuration of Workspace Zones and Panels
- Views can include pre-loaded screens in panels
- Views allow switching between different layout configurations
- Views are per-workspace (each workspace has its own set of views)
- **Layout Flexibility**: Views can save:
   - Control Bar position (top, left, right, bottom)
   - Workspace Zone positioning (A and B can be switched)
   - Panel configurations and loaded screens
   - All layout preferences and settings
- **Default View**: Any saved view can be set as the default view for the workspace

### Panel Layouts

- **Full-width**: 1 panel spans the full width
- **2-split**: 2 panels side by side
- **3-split**: 3 panels side by side

## Layout Flexibility and Positioning

### Control Bar Positioning

- Can be mounted to any side of the viewport (top, left, right, bottom)
- Position can be saved in views and any view can be set as default
- Can be hidden when panels go fullscreen

### Workspace Zone Switching

- Workspace Zone A and B can be switched in position:
   - **Default**: Workspace Zone A (top), Workspace Zone B (bottom)
   - **Switched**: Workspace Zone B (top), Workspace Zone A (bottom)
- **Functional Consistency**:
   - Workspace Zone A always maintains primary workspace functionality
   - Workspace Zone B always maintains secondary workspace functionality
   - Functionality doesn't change based on position, only the visual arrangement
- **Drag Behavior**: When Workspace Zone B is positioned at the top, it can be dragged down from the top of the viewport
- **View Persistence**: All positioning and layout configurations can be saved in views

### App Shell Behavior

- The outermost container that holds everything
- Displays empty state logo and "get started" text when all panels are closed
- Provides the foundation for all layout components

## System Behavior

### Screen Loading

- Panels can load different screens dynamically
- Screens can contain multiple sections for content organization
- Screen switching doesn't affect control bar placement

### Fullscreen Mode

- Individual panels can be expanded to fill the viewport
- Control Bar and other sidebars hide during fullscreen
- Original states are preserved and restored when exiting fullscreen

### State Management

- All layout configurations are persistent per workspace
- Views save complete layout state including positioning and loaded screens
- Workspace switching loads the appropriate layout configuration

## Implementation Architecture

### Component Structure

- All layout components use technical names internally
- UI components display nicknames to users
- Type definitions include both technical names and nicknames
- Clear separation between layout logic and presentation

### State Persistence

- Layout configurations are saved per workspace
- Views provide snapshot functionality for layout arrangements
- User preferences are maintained across sessions

## Related Documents

- [Layout Terminology](./terminology.md) - Naming conventions and terminology
- [Component Architecture Standards](../components/standards/component-architecture.md)
- [Layout Configuration Store](../store/layout-config-store.ts)
- [Main Layout Component](../components/layout/main-layout.tsx)
