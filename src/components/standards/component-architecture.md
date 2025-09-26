# Component Architecture Standards

## Overview

This document establishes standardized patterns and conventions for all components in the HeySpex codebase to ensure consistency, maintainability, and developer experience.

## Component Categories

### 1. Layout Components (`components/layout/`)

- **Purpose**: High-level layout structure and navigation
- **Pattern**: Container components that manage layout state
- **Examples**: `MainLayout`, `GlobalControlBar`, `WorkspaceZoneB`, `AppSidebar`

### 2. Common Components (`components/common/`)

- **Purpose**: Reusable business logic components
- **Pattern**: Feature-specific components with clear responsibilities
- **Examples**: `IssuesList`, `ProjectCard`, `UserAvatar`

### 3. UI Components (`components/ui/`)

- **Purpose**: Low-level, reusable UI primitives
- **Pattern**: Pure presentation components with minimal logic
- **Examples**: `Button`, `Input`, `Dialog`, `Popover`

### 4. Feature Components (`components/features/`)

- **Purpose**: Complex feature-specific components
- **Pattern**: Self-contained feature implementations
- **Examples**: `CommandPalette`, `IssueEditor`, `ProjectDashboard`

## Component Structure Standards

### File Organization

```
components/
├── layout/           # Layout and navigation components
├── common/           # Reusable business components
├── ui/              # UI primitives and design system
├── features/        # Feature-specific components
└── standards/       # Architecture documentation
```

### File Naming Conventions

- **Components**: `kebab-case.tsx` (e.g., `priority-selector.tsx`)
- **Directories**: `kebab-case/` (e.g., `create-new-issue/`)
- **Index files**: `index.tsx` for barrel exports
- **Types**: Co-located with components or in `types/` directory

### Component Naming

- **Function names**: `PascalCase` (e.g., `PrioritySelector`)
- **Props interfaces**: `ComponentNameProps` (e.g., `PrioritySelectorProps`)
- **Type exports**: `PascalCase` (e.g., `Priority`, `Status`)

## Component Patterns

### 1. Client/Server Component Guidelines

#### Client Components (`'use client'`)

Use when component needs:

- Browser APIs (localStorage, window, etc.)
- Event handlers (onClick, onChange, etc.)
- State management (useState, useEffect, etc.)
- Context consumption
- Hooks usage

```tsx
'use client';

import { useState } from 'react';

interface ClientComponentProps {
   initialValue: string;
   onChange: (value: string) => void;
}

export function ClientComponent({ initialValue, onChange }: ClientComponentProps) {
   const [value, setValue] = useState(initialValue);

   return (
      <input
         value={value}
         onChange={(e) => {
            setValue(e.target.value);
            onChange(e.target.value);
         }}
      />
   );
}
```

#### Server Components (default)

Use when component:

- Only renders static content
- Fetches data server-side
- No interactivity required
- Can be pre-rendered

```tsx
import { getData } from '@/lib/api';

interface ServerComponentProps {
   id: string;
}

export async function ServerComponent({ id }: ServerComponentProps) {
   const data = await getData(id);

   return <div>{data.title}</div>;
}
```

### 2. Component Composition Patterns

#### Container/Presentational Pattern

```tsx
// Container (logic)
export function PrioritySelectorContainer({ issueId }: { issueId: string }) {
   const { updateIssuePriority } = useIssuesStore();

   return (
      <PrioritySelector onPriorityChange={(priority) => updateIssuePriority(issueId, priority)} />
   );
}

// Presentational (UI)
interface PrioritySelectorProps {
   onPriorityChange: (priority: Priority) => void;
}

export function PrioritySelector({ onPriorityChange }: PrioritySelectorProps) {
   // Pure UI logic only
}
```

#### Compound Component Pattern

```tsx
export function Selector({ children, ...props }: SelectorProps) {
   return <div {...props}>{children}</div>;
}

Selector.Trigger = SelectorTrigger;
Selector.Content = SelectorContent;
Selector.Item = SelectorItem;

// Usage
<Selector>
   <Selector.Trigger>Open</Selector.Trigger>
   <Selector.Content>
      <Selector.Item>Option 1</Selector.Item>
   </Selector.Content>
</Selector>;
```

### 3. Props Interface Standards

#### Required Props First

```tsx
interface ComponentProps {
   // Required props first
   id: string;
   value: string;
   onChange: (value: string) => void;

   // Optional props with defaults
   placeholder?: string;
   disabled?: boolean;
   className?: string;

   // Event handlers
   onFocus?: () => void;
   onBlur?: () => void;

   // Children last
   children?: React.ReactNode;
}
```

#### Consistent Naming

- **Handlers**: `onAction` (e.g., `onChange`, `onSelect`, `onToggle`)
- **Boolean props**: `is*` or `has*` (e.g., `isOpen`, `hasError`)
- **Optional values**: `*?` (e.g., `placeholder?`, `className?`)

### 4. State Management Patterns

#### Local State

```tsx
const [isOpen, setIsOpen] = useState(false);
const [value, setValue] = useState(initialValue);
```

#### Derived State

```tsx
const selectedItem = useMemo(() => items.find((item) => item.id === value), [items, value]);
```

#### Store Integration

```tsx
const { updateItem, filterItems } = useStore();
```

### 5. Error Handling Patterns

#### Error Boundaries

```tsx
export class ComponentErrorBoundary extends React.Component {
   constructor(props) {
      super(props);
      this.state = { hasError: false };
   }

   static getDerivedStateFromError(error) {
      return { hasError: true };
   }

   render() {
      if (this.state.hasError) {
         return <ErrorFallback />;
      }

      return this.props.children;
   }
}
```

#### Loading States

```tsx
interface ComponentProps {
   loading?: boolean;
   fallback?: React.ReactNode;
}

export function Component({ loading, fallback, children }: ComponentProps) {
   if (loading) {
      return fallback || <LoadingSpinner />;
   }

   return <>{children}</>;
}
```

## Accessibility Standards

### ARIA Attributes

```tsx
<button role="combobox" aria-expanded={isOpen} aria-haspopup="listbox" aria-label="Select priority">
   {selectedItem?.name}
</button>
```

### Keyboard Navigation

```tsx
const handleKeyDown = (e: KeyboardEvent) => {
   switch (e.key) {
      case 'Enter':
      case ' ':
         e.preventDefault();
         toggle();
         break;
      case 'Escape':
         close();
         break;
   }
};
```

## Performance Standards

### Memoization

```tsx
export const Component = React.memo(({ data, onAction }: Props) => {
   const handleAction = useCallback(
      (id: string) => {
         onAction(id);
      },
      [onAction]
   );

   return <div>{/* render */}</div>;
});
```

### Lazy Loading

```tsx
const LazyComponent = lazy(() => import('./HeavyComponent'));

export function ParentComponent() {
   return (
      <Suspense fallback={<LoadingSpinner />}>
         <LazyComponent />
      </Suspense>
   );
}
```

## Testing Standards

### Component Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { PrioritySelector } from './priority-selector';

describe('PrioritySelector', () => {
   it('should render with initial value', () => {
      render(<PrioritySelector priority={mockPriority} />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
   });

   it('should call onChange when selection changes', () => {
      const onChange = jest.fn();
      render(<PrioritySelector priority={mockPriority} onChange={onChange} />);

      fireEvent.click(screen.getByRole('combobox'));
      fireEvent.click(screen.getByText('High'));

      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ id: 'high' }));
   });
});
```

## Documentation Standards

### Component Documentation

```tsx
/**
 * PrioritySelector - A dropdown component for selecting issue priority
 *
 * @example
 * <PrioritySelector
 *   priority={priority}
 *   onChange={(newPriority) => setPriority(newPriority)}
 * />
 */
interface PrioritySelectorProps {
   /** Current selected priority */
   priority: Priority;
   /** Callback when priority changes */
   onChange: (priority: Priority) => void;
   /** Additional CSS classes */
   className?: string;
}
```

## Migration Guidelines

### From Current Patterns

1. **Consolidate duplicate selectors** into base components
2. **Standardize prop interfaces** across similar components
3. **Implement consistent error handling** patterns
4. **Add proper TypeScript types** for all props
5. **Create reusable composition patterns** for complex components

### Implementation Priority

1. High: Selector components (priority, status, assignee)
2. Medium: Layout components
3. Low: UI primitives (already well-structured)
