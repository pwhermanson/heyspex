# File Naming Conventions

## Overview

This document establishes consistent file naming conventions for all components and related files in the HeySpex codebase.

## General Principles

### 1. Use kebab-case for all file names

- **Component files**: `priority-selector.tsx`
- **Directories**: `create-new-issue/`
- **Utility files**: `status-utils.tsx`
- **Type files**: `user-types.ts`

### 2. Use PascalCase for component names and exports

- **Component names**: `PrioritySelector`
- **Interface names**: `PrioritySelectorProps`
- **Type names**: `Priority`, `Status`

### 3. Use descriptive, meaningful names

- **Good**: `priority-selector.tsx`, `user-avatar.tsx`
- **Bad**: `selector.tsx`, `avatar.tsx`, `comp1.tsx`

## File Structure Standards

### Component Files

```
components/
├── layout/                    # Layout components
│   ├── main-layout.tsx
│   ├── top-bar.tsx
│   └── workspace-zone-b.tsx
├── common/                    # Reusable business components
│   ├── issues/
│   │   ├── priority-selector.tsx
│   │   ├── status-selector.tsx
│   │   └── assignee-selector.tsx
│   └── projects/
│       ├── project-card.tsx
│       └── project-list.tsx
├── ui/                       # UI primitives
│   ├── button.tsx
│   ├── input.tsx
│   └── dialog.tsx
└── features/                 # Feature-specific components
    ├── command-palette/
    │   ├── command-palette-modal.tsx
    │   └── palette-provider.tsx
    └── issue-editor/
        ├── issue-editor.tsx
        └── issue-form.tsx
```

### File Naming Patterns

#### 1. Component Files

- **Pattern**: `{component-name}.tsx`
- **Examples**:
   - `priority-selector.tsx` → `PrioritySelector`
   - `user-avatar.tsx` → `UserAvatar`
   - `issue-card.tsx` → `IssueCard`

#### 2. Index Files

- **Pattern**: `index.tsx` (for barrel exports)
- **Purpose**: Re-export components from a directory
- **Example**:
   ```tsx
   // components/common/issues/index.tsx
   export { PrioritySelector } from './priority-selector';
   export { StatusSelector } from './status-selector';
   export { AssigneeSelector } from './assignee-selector';
   ```

#### 3. Type Definition Files

- **Pattern**: `{domain}-types.ts`
- **Examples**:
   - `user-types.ts`
   - `issue-types.ts`
   - `project-types.ts`

#### 4. Utility Files

- **Pattern**: `{domain}-utils.tsx` or `{domain}-utils.ts`
- **Examples**:
   - `status-utils.tsx`
   - `user-utils.ts`
   - `date-utils.ts`

#### 5. Hook Files

- **Pattern**: `use-{hook-name}.ts`
- **Examples**:
   - `use-issues.ts`
   - `use-priority-selector.ts`
   - `use-modal.ts`

#### 6. Store Files

- **Pattern**: `{domain}-store.ts`
- **Examples**:
   - `issues-store.ts`
   - `user-store.ts`
   - `layout-store.ts`

## Directory Naming

### 1. Feature Directories

- **Pattern**: `kebab-case/`
- **Examples**:
   - `create-new-issue/`
   - `command-palette/`
   - `issue-editor/`

### 2. Component Category Directories

- **Layout**: `layout/`
- **Common**: `common/`
- **UI**: `ui/`
- **Features**: `features/`

### 3. Nested Directories

- **Pattern**: `{parent}/{child}/`
- **Examples**:
   - `layout/sidebar/`
   - `common/issues/`
   - `features/command-palette/`

## File Content Standards

### 1. Default Export

- **Component files**: Use default export for main component
- **Example**:
   ```tsx
   // priority-selector.tsx
   export default function PrioritySelector(props: PrioritySelectorProps) {
      // component implementation
   }
   ```

### 2. Named Exports

- **Types and interfaces**: Use named exports
- **Utility functions**: Use named exports
- **Example**:

   ```tsx
   // priority-selector.tsx
   export interface PrioritySelectorProps {
      // props definition
   }

   export type Priority = {
      // type definition
   };

   export function usePrioritySelector() {
      // hook implementation
   }
   ```

### 3. Import/Export Organization

```tsx
// 1. React imports
import React, { useState, useEffect } from 'react';

// 2. Third-party library imports
import { Button } from '@/components/ui/button';
import { CheckIcon } from 'lucide-react';

// 3. Internal imports (absolute paths)
import { useIssuesStore } from '@/store/issues-store';
import { Priority } from '@/mock-data/priorities';

// 4. Relative imports
import './priority-selector.css';

// 5. Type-only imports
import type { PrioritySelectorProps } from './types';
```

## Migration Guidelines

### Current Issues to Fix

#### 1. Inconsistent Selector Components

**Current**: Multiple similar selectors with different patterns

- `components/common/issues/priority-selector.tsx`
- `components/layout/sidebar/create-new-issue/priority-selector.tsx`
- `components/common/projects/priority-selector.tsx`

**Target**: Standardized base selector

- `components/common/selectors/base-selector.tsx`
- `components/common/selectors/priority-selector.tsx`
- `components/common/selectors/status-selector.tsx`

#### 2. File Naming Inconsistencies

**Current Issues**:

- Mixed naming patterns
- Unclear component purposes
- Deep nesting

**Target Structure**:

```
components/
├── common/
│   ├── selectors/
│   │   ├── base-selector.tsx
│   │   ├── priority-selector.tsx
│   │   ├── status-selector.tsx
│   │   └── assignee-selector.tsx
│   └── forms/
│       ├── issue-form.tsx
│       └── project-form.tsx
├── layout/
│   ├── main-layout.tsx
│   ├── top-bar.tsx
│   └── workspace-zone-b.tsx
└── ui/
    ├── button.tsx
    ├── input.tsx
    └── dialog.tsx
```

### Migration Steps

#### Step 1: Create Base Components

1. Create `components/common/selectors/base-selector.tsx`
2. Create standardized prop interfaces
3. Implement common selector logic

#### Step 2: Refactor Existing Selectors

1. Update `components/common/issues/priority-selector.tsx`
2. Update `components/layout/sidebar/create-new-issue/priority-selector.tsx`
3. Update `components/common/projects/priority-selector.tsx`

#### Step 3: Consolidate Duplicates

1. Remove duplicate selector implementations
2. Update imports across the codebase
3. Ensure consistent behavior

#### Step 4: Update Directory Structure

1. Reorganize components by category
2. Create index files for barrel exports
3. Update all import paths

## Validation Rules

### 1. File Name Validation

- ✅ Use kebab-case for file names
- ✅ Use descriptive names
- ✅ Include component type in name when ambiguous
- ❌ Avoid generic names like `component.tsx`
- ❌ Avoid abbreviations like `pri-sel.tsx`

### 2. Directory Structure Validation

- ✅ Group related components together
- ✅ Use consistent nesting levels
- ✅ Create index files for clean imports
- ❌ Avoid deep nesting (>3 levels)
- ❌ Avoid mixing component types in same directory

### 3. Export Validation

- ✅ Use default export for main component
- ✅ Use named exports for types and utilities
- ✅ Organize imports consistently
- ❌ Avoid default exports for types
- ❌ Avoid mixing default and named exports for same entity

## Examples

### Good Examples

```tsx
// components/common/selectors/priority-selector.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BaseSelector } from './base-selector';
import type { Priority, PrioritySelectorProps } from './types';

export default function PrioritySelector(props: PrioritySelectorProps) {
   return <BaseSelector {...props} />;
}

export type { PrioritySelectorProps };
```

```tsx
// components/common/selectors/types.ts
export interface PrioritySelectorProps {
   selectedItem: Priority;
   onSelectionChange: (priority: Priority) => void;
   className?: string;
}

export type Priority = {
   id: string;
   name: string;
   icon: React.ComponentType<{ className?: string }>;
   color: string;
};
```

### Bad Examples

```tsx
// ❌ Bad: Generic name, unclear purpose
// components/selector.tsx
export function Selector() {
   // implementation
}

// ❌ Bad: Inconsistent naming
// components/prioritySel.tsx
export function PrioritySel() {
   // implementation
}

// ❌ Bad: Mixed exports
// components/priority-selector.tsx
export default function PrioritySelector() {}
export default interface PrioritySelectorProps {}
```

## Tools and Automation

### 1. ESLint Rules

```json
{
   "rules": {
      "import/no-default-export": "off",
      "import/prefer-default-export": "error",
      "import/order": [
         "error",
         {
            "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
            "newlines-between": "always"
         }
      ]
   }
}
```

### 2. File Naming Script

```bash
# Script to validate file naming
find components -name "*.tsx" -o -name "*.ts" | while read file; do
  if [[ ! $file =~ ^[a-z0-9-]+\.(tsx|ts)$ ]]; then
    echo "Invalid file name: $file"
  fi
done
```

### 3. Import Organization Script

```bash
# Script to organize imports
npx eslint --fix components/**/*.{ts,tsx}
```
