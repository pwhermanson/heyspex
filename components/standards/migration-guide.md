# Component Architecture Migration Guide

## Overview

This guide provides step-by-step instructions for migrating existing components to the new standardized architecture patterns.

## Phase 1.1 Implementation Status

### ✅ Completed

- [x] Component architecture standards documentation
- [x] Prop interface patterns
- [x] Component composition guidelines
- [x] File naming conventions
- [x] Base selector component
- [x] Standardized priority selector
- [x] Standardized status selector

### 🔄 In Progress

- [ ] Migrate existing selector components
- [ ] Update import statements
- [ ] Remove duplicate implementations

## Migration Steps

### Step 1: Update Priority Selector Usage

#### Before (Current Implementation)

```tsx
// components/common/issues/priority-selector.tsx
import { PrioritySelector } from '@/components/common/issues/priority-selector';

<PrioritySelector priority={priority} issueId={issueId} />;
```

#### After (Standardized Implementation)

```tsx
// Use the new standardized selector
import { PrioritySelector } from '@/components/common/selectors';

<PrioritySelector
   selectedItem={priority}
   onSelectionChange={handlePriorityChange}
   showCounts={true}
   triggerVariant="icon"
/>;
```

### Step 2: Update Status Selector Usage

#### Before (Current Implementation)

```tsx
// components/common/issues/status-selector.tsx
import { StatusSelector } from '@/components/common/issues/status-selector';

<StatusSelector status={status} issueId={issueId} />;
```

#### After (Standardized Implementation)

```tsx
// Use the new standardized selector
import { StatusSelector } from '@/components/common/selectors';

<StatusSelector
   selectedItem={status}
   onSelectionChange={handleStatusChange}
   showCounts={true}
   triggerVariant="icon"
/>;
```

### Step 3: Create Container Components

For components that need to integrate with stores, create container components:

```tsx
// components/common/selectors/priority-selector-container.tsx
'use client';

import React, { useCallback } from 'react';
import { PrioritySelector } from './priority-selector';
import { useIssuesStore } from '@/store/issues-store';
import { Priority } from '@/mock-data/priorities';

interface PrioritySelectorContainerProps {
   issueId: string;
   className?: string;
   triggerVariant?: 'button' | 'icon' | 'ghost';
   showCounts?: boolean;
}

export function PrioritySelectorContainer({
   issueId,
   className,
   triggerVariant = 'icon',
   showCounts = true,
}: PrioritySelectorContainerProps) {
   const { updateIssuePriority, getIssue } = useIssuesStore();
   const issue = getIssue(issueId);

   if (!issue) return null;

   const handlePriorityChange = useCallback(
      (priority: Priority) => {
         updateIssuePriority(issueId, priority);
      },
      [issueId, updateIssuePriority]
   );

   return (
      <PrioritySelector
         selectedItem={issue.priority}
         onSelectionChange={handlePriorityChange}
         className={className}
         triggerVariant={triggerVariant}
         showCounts={showCounts}
      />
   );
}

export default PrioritySelectorContainer;
```

### Step 4: Update Import Statements

#### Global Import Updates

```tsx
// Before
import { PrioritySelector } from '@/components/common/issues/priority-selector';
import { StatusSelector } from '@/components/common/issues/status-selector';

// After
import { PrioritySelector, StatusSelector } from '@/components/common/selectors';
```

#### Container Component Imports

```tsx
// For components that need store integration
import { PrioritySelectorContainer } from '@/components/common/selectors/priority-selector-container';
```

## File Structure Changes

### Before

```
components/
├── common/
│   ├── issues/
│   │   ├── priority-selector.tsx
│   │   └── status-selector.tsx
│   └── projects/
│       └── priority-selector.tsx
└── layout/
    └── sidebar/
        └── create-new-issue/
            ├── priority-selector.tsx
            └── status-selector.tsx
```

### After

```
components/
├── common/
│   ├── selectors/
│   │   ├── base-selector.tsx
│   │   ├── priority-selector.tsx
│   │   ├── status-selector.tsx
│   │   ├── priority-selector-container.tsx
│   │   └── index.tsx
│   └── issues/
│       └── (other issue components)
└── layout/
    └── sidebar/
        └── create-new-issue/
            └── (use standardized selectors)
```

## Breaking Changes

### 1. Prop Interface Changes

- `priority` → `selectedItem`
- `issueId` → removed (use container components)
- `onChange` → `onSelectionChange`

### 2. Import Path Changes

- All selector imports now come from `@/components/common/selectors`
- Container components for store integration

### 3. Component Behavior Changes

- Consistent trigger variants across all selectors
- Standardized search functionality
- Unified count display patterns

## Migration Checklist

### For Each Component Using Selectors

- [ ] Update import statements
- [ ] Update prop names
- [ ] Add container component if store integration needed
- [ ] Test component functionality
- [ ] Update any custom styling
- [ ] Verify accessibility features

### For Each File

- [ ] Remove old selector implementations
- [ ] Update file naming if needed
- [ ] Update directory structure
- [ ] Create index files for clean exports

## Testing Migration

### 1. Unit Tests

```tsx
// Test the new standardized selector
import { render, screen, fireEvent } from '@testing-library/react';
import { PrioritySelector } from '@/components/common/selectors';

describe('PrioritySelector', () => {
   it('should render with selected priority', () => {
      const mockPriority = { id: 'high', name: 'High', icon: AlertTriangle, color: 'red' };
      const mockOnChange = jest.fn();

      render(<PrioritySelector selectedItem={mockPriority} onSelectionChange={mockOnChange} />);

      expect(screen.getByText('High')).toBeInTheDocument();
   });
});
```

### 2. Integration Tests

```tsx
// Test container component with store
import { render, screen, fireEvent } from '@testing-library/react';
import { PrioritySelectorContainer } from '@/components/common/selectors/priority-selector-container';

describe('PrioritySelectorContainer', () => {
   it('should update issue priority when selection changes', () => {
      const mockUpdateIssuePriority = jest.fn();
      const mockIssue = { id: '1', priority: { id: 'low', name: 'Low' } };

      // Mock store
      jest.mocked(useIssuesStore).mockReturnValue({
         updateIssuePriority: mockUpdateIssuePriority,
         getIssue: jest.fn().mockReturnValue(mockIssue),
      });

      render(<PrioritySelectorContainer issueId="1" />);

      fireEvent.click(screen.getByRole('combobox'));
      fireEvent.click(screen.getByText('High'));

      expect(mockUpdateIssuePriority).toHaveBeenCalledWith(
         '1',
         expect.objectContaining({ id: 'high' })
      );
   });
});
```

## Rollback Plan

If issues arise during migration:

1. **Immediate Rollback**: Revert to previous commit
2. **Partial Rollback**: Keep new base components, revert specific implementations
3. **Gradual Migration**: Migrate one component at a time

## Post-Migration Tasks

### 1. Clean Up

- [ ] Remove duplicate selector files
- [ ] Update documentation
- [ ] Run linting and fix issues
- [ ] Update tests

### 2. Performance Verification

- [ ] Check bundle size impact
- [ ] Verify component render performance
- [ ] Test accessibility features

### 3. Documentation Updates

- [ ] Update component documentation
- [ ] Create usage examples
- [ ] Update architecture decision records

## Next Steps

After completing Phase 1.1:

1. **Phase 1.2**: Selector Component Consolidation

   - Migrate all remaining selector components
   - Remove duplicate implementations
   - Update all import statements

2. **Phase 1.3**: Directory Structure Optimization

   - Reorganize component directories
   - Create consistent boundaries
   - Update all file paths

3. **Phase 2**: State Management & Data Flow
   - Refactor store architecture
   - Implement data fetching patterns
   - Optimize state mutations
