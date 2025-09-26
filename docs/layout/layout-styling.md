### Layout Styling Guide

> Companion to: [Layout System](./layout-system.md). This guide focuses on styling, classes, theming variables, and usage patterns that the layout system relies on.

High-level guide to layout styling and classes. Companion to `layout-system.md`. Includes control bars and how they are themed.

### Overview

- **screen-control-bar**: Header-level control bar for a screen within a panel (e.g., Panel B above Filter/Display).
- **panel-control-bar**: Header-level control bar for a whole panel (e.g., Panel A and Panel C top bars).

Both classes are intended to provide a consistent look-and-feel and can be themed via CSS variables.

### Source Locations

- Styles: `src/styles/globals.css` (`@layer components`)
- Panel B screen header: `src/components/layout/headers/issues/header-options.tsx`
- Panel A header: `src/components/layout/workspace-zone-a-panels/workspace-zone-a-panel-a.tsx`
- Panel C header: `src/components/layout/workspace-zone-a-panels/workspace-zone-a-panel-c.tsx`

### Classes

- `screen-control-bar`

   - Purpose: Screen-level header bar inside a panel.
   - Base styles applied in CSS:
      - Background: `hsl(var(--background))`
      - Border bottom: `1px solid hsl(var(--border))`
      - Layout: flex, center alignment, space-between
      - Dimensions: height 40px, padding `py-1.5 px-6`
      - Effects: subtle shadow, transition on background/shadow
      - Dark mode: stronger shadow and muted hover bg

- `panel-control-bar`
   - Purpose: Panel-wide header bar (e.g., workspace zone A panels).
   - Styling: currently composed from Tailwind utility classes directly on elements for consistency with `screen-control-bar`:
      - `w-full flex justify-between items-center border-b py-1.5 px-6 h-10`
   - Future: can be extracted to CSS like `screen-control-bar` if we need special theming.

### Theming

Colors are driven by CSS variables defined in `:root` and `.dark` in `src/styles/globals.css`:

- `--background`, `--border`, `--muted`, `--foreground`

Updating these variables will propagate consistently to all control bars.

### Usage Examples

Screen control bar (Panel B):

```startLine:endLine:src/components/layout/headers/issues/header-options.tsx
      <div className="screen-control-bar">
         <Filter />
         {/* actions */}
      </div>
```

Panel control bar (Panel A):

```startLine:endLine:src/components/layout/workspace-zone-a-panels/workspace-zone-a-panel-a.tsx
         <div className="panel-control-bar w-full flex justify-between items-center border-b py-1.5 px-6 h-10">
            <div className="flex-1" />
            {/* controls */}
         </div>
```

Panel control bar (Panel C):

```startLine:endLine:src/components/layout/workspace-zone-a-panels/workspace-zone-a-panel-c.tsx
         <div className="panel-control-bar w-full flex justify-between items-center border-b py-1.5 px-6 h-10">
            <h2 className="text-lg font-semibold">Workspace Zone A Panel C</h2>
            {/* controls */}
         </div>
```

### Conventions

- Keep bars at 40px height for uniform rhythm.
- Prefer dedicated classes for areas that need theming or interaction-specific styles (`screen-control-bar`).
- Use utility classes for simple composition; extract to CSS only when needed for cross-screen theming or effects.

### Future Work

- Extract `panel-control-bar` into CSS alongside `screen-control-bar` if we add custom behaviors or theming beyond layout utilities.
