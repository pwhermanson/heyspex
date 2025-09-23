# Component Composition Guidelines

## Overview

This document provides guidelines for composing components in the HeySpex codebase to ensure reusability, maintainability, and consistent patterns.

## Composition Patterns

### 1. Container/Presentational Pattern

Separate business logic from presentation logic by creating container components that handle state and data, and presentational components that handle UI rendering.

#### Example: Priority Selector

```tsx
// Container Component (Logic)
interface PrioritySelectorContainerProps {
   issueId: string;
   className?: string;
}

export function PrioritySelectorContainer({ issueId, className }: PrioritySelectorContainerProps) {
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
      />
   );
}

// Presentational Component (UI)
interface PrioritySelectorProps extends BaseSelectorProps<Priority>, IconSelectorProps<Priority> {
   // UI-specific props only
}

export function PrioritySelector({
   selectedItem,
   onSelectionChange,
   className,
   ...props
}: PrioritySelectorProps) {
   // Pure UI logic only
   return (
      <Popover>
         <PopoverTrigger asChild>
            <Button className={className}>
               <selectedItem.icon className="size-4" />
               {selectedItem.name}
            </Button>
         </PopoverTrigger>
         <PopoverContent>{/* Selection UI */}</PopoverContent>
      </Popover>
   );
}
```

### 2. Compound Component Pattern

Create components that work together as a cohesive unit while maintaining flexibility.

#### Example: Selector Component

```tsx
// Main Selector Component
interface SelectorProps extends BaseComponentProps, ChildrenProps {
   value: string;
   onValueChange: (value: string) => void;
   open?: boolean;
   onOpenChange?: (open: boolean) => void;
}

export function Selector({
   value,
   onValueChange,
   open,
   onOpenChange,
   children,
   className,
}: SelectorProps) {
   const [isOpen, setIsOpen] = useState(false);
   const isControlled = open !== undefined;
   const isCurrentlyOpen = isControlled ? open : isOpen;

   const handleOpenChange = (newOpen: boolean) => {
      if (isControlled) {
         onOpenChange?.(newOpen);
      } else {
         setIsOpen(newOpen);
      }
   };

   return (
      <Popover open={isCurrentlyOpen} onOpenChange={handleOpenChange}>
         <div className={className}>{children}</div>
      </Popover>
   );
}

// Sub-components
interface SelectorTriggerProps extends BaseComponentProps, ChildrenProps {
   asChild?: boolean;
}

export function SelectorTrigger({ asChild, children, className, ...props }: SelectorTriggerProps) {
   return (
      <PopoverTrigger asChild={asChild}>
         <Button className={className} {...props}>
            {children}
         </Button>
      </PopoverTrigger>
   );
}

interface SelectorContentProps extends BaseComponentProps, ChildrenProps {
   align?: 'start' | 'center' | 'end';
   side?: 'top' | 'right' | 'bottom' | 'left';
}

export function SelectorContent({
   children,
   className,
   align = 'start',
   side = 'bottom',
}: SelectorContentProps) {
   return (
      <PopoverContent className={className} align={align} side={side}>
         {children}
      </PopoverContent>
   );
}

interface SelectorItemProps extends BaseComponentProps, ChildrenProps {
   value: string;
   onSelect?: (value: string) => void;
   disabled?: boolean;
}

export function SelectorItem({
   value,
   onSelect,
   disabled,
   children,
   className,
}: SelectorItemProps) {
   return (
      <CommandItem value={value} onSelect={onSelect} disabled={disabled} className={className}>
         {children}
      </CommandItem>
   );
}

// Attach sub-components
Selector.Trigger = SelectorTrigger;
Selector.Content = SelectorContent;
Selector.Item = SelectorItem;

// Usage
<Selector value={selectedValue} onValueChange={setSelectedValue}>
   <Selector.Trigger>
      <PriorityIcon />
      {selectedPriority.name}
   </Selector.Trigger>
   <Selector.Content>
      {priorities.map((priority) => (
         <Selector.Item key={priority.id} value={priority.id} onSelect={handlePriorityChange}>
            <priority.icon />
            {priority.name}
         </Selector.Item>
      ))}
   </Selector.Content>
</Selector>;
```

### 3. Render Props Pattern

Use render props to provide maximum flexibility while maintaining component reusability.

#### Example: Data Fetcher Component

```tsx
interface DataFetcherProps<T> {
   url: string;
   children: (data: {
      data: T | null;
      loading: boolean;
      error: string | null;
      refetch: () => void;
   }) => ReactNode;
}

export function DataFetcher<T>({ url, children }: DataFetcherProps<T>) {
   const [data, setData] = useState<T | null>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   const fetchData = useCallback(async () => {
      try {
         setLoading(true);
         setError(null);
         const response = await fetch(url);
         const result = await response.json();
         setData(result);
      } catch (err) {
         setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
         setLoading(false);
      }
   }, [url]);

   useEffect(() => {
      fetchData();
   }, [fetchData]);

   return <>{children({ data, loading, error, refetch: fetchData })}</>;
}

// Usage
<DataFetcher<Issue[]> url="/api/issues">
   {({ data, loading, error, refetch }) => {
      if (loading) return <LoadingSpinner />;
      if (error) return <ErrorMessage message={error} onRetry={refetch} />;
      if (!data) return <EmptyState />;

      return <IssuesList issues={data} onRefresh={refetch} />;
   }}
</DataFetcher>;
```

### 4. Higher-Order Component (HOC) Pattern

Create HOCs for cross-cutting concerns like authentication, error handling, and data fetching.

#### Example: WithErrorBoundary HOC

```tsx
interface WithErrorBoundaryOptions {
   fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
   onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export function withErrorBoundary<P extends object>(
   Component: React.ComponentType<P>,
   options: WithErrorBoundaryOptions = {}
) {
   const WrappedComponent = (props: P) => {
      const [error, setError] = useState<Error | null>(null);

      const resetError = useCallback(() => {
         setError(null);
      }, []);

      if (error) {
         const FallbackComponent = options.fallback || DefaultErrorFallback;
         return <FallbackComponent error={error} resetError={resetError} />;
      }

      return (
         <ErrorBoundary
            onError={(error, errorInfo) => {
               setError(error);
               options.onError?.(error, errorInfo);
            }}
         >
            <Component {...props} />
         </ErrorBoundary>
      );
   };

   WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

   return WrappedComponent;
}

// Usage
const SafePrioritySelector = withErrorBoundary(PrioritySelector, {
   fallback: ({ error, resetError }) => (
      <div className="p-4 border border-red-200 rounded">
         <p className="text-red-600">Error: {error.message}</p>
         <Button onClick={resetError}>Try Again</Button>
      </div>
   ),
});
```

### 5. Custom Hook Pattern

Extract reusable logic into custom hooks for better testability and reusability.

#### Example: useSelector Hook

```tsx
interface UseSelectorOptions<T> {
   items: T[];
   getItemKey: (item: T) => string;
   getItemLabel: (item: T) => string;
   getItemIcon?: (item: T) => ReactNode;
   getItemDisabled?: (item: T) => boolean;
   searchable?: boolean;
   onSelectionChange: (item: T) => void;
}

export function useSelector<T>({
   items,
   getItemKey,
   getItemLabel,
   getItemIcon,
   getItemDisabled,
   searchable = true,
   onSelectionChange,
}: UseSelectorOptions<T>) {
   const [isOpen, setIsOpen] = useState(false);
   const [searchQuery, setSearchQuery] = useState('');
   const [selectedItem, setSelectedItem] = useState<T | null>(null);

   const filteredItems = useMemo(() => {
      if (!searchable || !searchQuery) return items;

      return items.filter((item) =>
         getItemLabel(item).toLowerCase().includes(searchQuery.toLowerCase())
      );
   }, [items, searchQuery, searchable, getItemLabel]);

   const handleItemSelect = useCallback(
      (item: T) => {
         setSelectedItem(item);
         setIsOpen(false);
         setSearchQuery('');
         onSelectionChange(item);
      },
      [onSelectionChange]
   );

   const handleSearchChange = useCallback((query: string) => {
      setSearchQuery(query);
   }, []);

   return {
      isOpen,
      setIsOpen,
      searchQuery,
      selectedItem,
      filteredItems,
      handleItemSelect,
      handleSearchChange,
   };
}

// Usage in component
export function PrioritySelector({
   selectedItem,
   onSelectionChange,
   ...props
}: PrioritySelectorProps) {
   const { isOpen, setIsOpen, searchQuery, filteredItems, handleItemSelect, handleSearchChange } =
      useSelector({
         items: priorities,
         getItemKey: (p) => p.id,
         getItemLabel: (p) => p.name,
         getItemIcon: (p) => <p.icon className="size-4" />,
         onSelectionChange,
      });

   return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
         {/* Component JSX */}
      </Popover>
   );
}
```

## Composition Best Practices

### 1. Single Responsibility Principle

Each component should have one clear responsibility. If a component is doing too much, consider breaking it down.

```tsx
// ❌ Bad: Component doing too much
export function IssueCard({ issue, onUpdate, onDelete, onAssign }) {
   // Handles display, editing, deletion, assignment, etc.
}

// ✅ Good: Separated concerns
export function IssueCard({ issue, onUpdate }) {
   return (
      <Card>
         <IssueHeader issue={issue} />
         <IssueContent issue={issue} />
         <IssueActions issue={issue} onUpdate={onUpdate} />
      </Card>
   );
}

export function IssueActions({ issue, onUpdate }) {
   return (
      <div className="flex gap-2">
         <EditButton issue={issue} onUpdate={onUpdate} />
         <DeleteButton issue={issue} />
         <AssignButton issue={issue} />
      </div>
   );
}
```

### 2. Prop Drilling Prevention

Use context or state management to avoid passing props through multiple levels.

```tsx
// ❌ Bad: Prop drilling
export function IssueList({ issues, onUpdate }) {
   return (
      <div>
         {issues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} onUpdate={onUpdate} />
         ))}
      </div>
   );
}

export function IssueCard({ issue, onUpdate }) {
   return (
      <div>
         <IssueHeader issue={issue} onUpdate={onUpdate} />
      </div>
   );
}

export function IssueHeader({ issue, onUpdate }) {
   return (
      <div>
         <IssueTitle issue={issue} onUpdate={onUpdate} />
      </div>
   );
}

// ✅ Good: Using context
const IssueContext = createContext<{
   issue: Issue;
   onUpdate: (issue: Issue) => void;
}>({});

export function IssueList({ issues, onUpdate }) {
   return (
      <div>
         {issues.map((issue) => (
            <IssueContext.Provider key={issue.id} value={{ issue, onUpdate }}>
               <IssueCard />
            </IssueContext.Provider>
         ))}
      </div>
   );
}

export function IssueCard() {
   return (
      <div>
         <IssueHeader />
      </div>
   );
}

export function IssueHeader() {
   const { issue, onUpdate } = useContext(IssueContext);
   return (
      <div>
         <IssueTitle issue={issue} onUpdate={onUpdate} />
      </div>
   );
}
```

### 3. Composition over Inheritance

Prefer composition patterns over class inheritance for better flexibility.

```tsx
// ❌ Bad: Inheritance
class BaseButton extends React.Component {
   render() {
      return <button className="base-button">{this.props.children}</button>;
   }
}

class PrimaryButton extends BaseButton {
   render() {
      return <button className="base-button primary-button">{this.props.children}</button>;
   }
}

// ✅ Good: Composition
export function Button({ variant = 'default', children, ...props }: ButtonProps) {
   return (
      <button className={cn('base-button', `button-${variant}`)} {...props}>
         {children}
      </button>
   );
}

export function PrimaryButton(props: ButtonProps) {
   return <Button variant="primary" {...props} />;
}
```

### 4. Consistent API Design

Maintain consistent prop names and patterns across similar components.

```tsx
// ✅ Good: Consistent naming
interface SelectorProps<T> {
   selectedItem: T;
   onSelectionChange: (item: T) => void;
   items: T[];
   getItemKey: (item: T) => string;
   getItemLabel: (item: T) => string;
}

interface DropdownProps<T> {
   selectedItem: T;
   onSelectionChange: (item: T) => void;
   items: T[];
   getItemKey: (item: T) => string;
   getItemLabel: (item: T) => string;
}

// ❌ Bad: Inconsistent naming
interface SelectorProps<T> {
   selectedItem: T;
   onSelectionChange: (item: T) => void;
   items: T[];
   getItemKey: (item: T) => string;
   getItemLabel: (item: T) => string;
}

interface DropdownProps<T> {
   value: T; // Different name
   onChange: (item: T) => void; // Different name
   options: T[]; // Different name
   keyExtractor: (item: T) => string; // Different name
   labelExtractor: (item: T) => string; // Different name
}
```

## Testing Composed Components

### 1. Test Individual Components

Test each component in isolation with mocked dependencies.

```tsx
// Test the presentational component
describe('PrioritySelector', () => {
   it('should render selected priority', () => {
      const mockPriority = { id: 'high', name: 'High', icon: AlertTriangle };
      const mockOnChange = jest.fn();

      render(
         <PrioritySelector
            selectedItem={mockPriority}
            onSelectionChange={mockOnChange}
            items={[mockPriority]}
            getItemKey={(p) => p.id}
            getItemLabel={(p) => p.name}
         />
      );

      expect(screen.getByText('High')).toBeInTheDocument();
   });
});
```

### 2. Test Container Components

Test container components with their actual dependencies.

```tsx
// Test the container component
describe('PrioritySelectorContainer', () => {
   it('should update issue priority when selection changes', () => {
      const mockUpdateIssuePriority = jest.fn();
      const mockIssue = { id: '1', priority: { id: 'low', name: 'Low' } };

      // Mock the store
      jest.mocked(useIssuesStore).mockReturnValue({
         updateIssuePriority: mockUpdateIssuePriority,
         getIssue: jest.fn().mockReturnValue(mockIssue),
      });

      render(<PrioritySelectorContainer issueId="1" />);

      // Simulate selection change
      fireEvent.click(screen.getByRole('combobox'));
      fireEvent.click(screen.getByText('High'));

      expect(mockUpdateIssuePriority).toHaveBeenCalledWith(
         '1',
         expect.objectContaining({ id: 'high' })
      );
   });
});
```

### 3. Test Composition Patterns

Test how components work together.

```tsx
// Test compound component
describe('Selector', () => {
   it('should work with all sub-components', () => {
      const mockOnChange = jest.fn();

      render(
         <Selector value="high" onValueChange={mockOnChange}>
            <Selector.Trigger>Select Priority</Selector.Trigger>
            <Selector.Content>
               <Selector.Item value="high">High</Selector.Item>
               <Selector.Item value="low">Low</Selector.Item>
            </Selector.Content>
         </Selector>
      );

      fireEvent.click(screen.getByText('Select Priority'));
      fireEvent.click(screen.getByText('High'));

      expect(mockOnChange).toHaveBeenCalledWith('high');
   });
});
```

## Migration Strategy

### Phase 1: Create Base Components

1. Create standardized base components with consistent APIs
2. Implement common patterns (Container/Presentational, Compound, etc.)
3. Create utility hooks for common logic

### Phase 2: Refactor Existing Components

1. Identify components that can benefit from standardization
2. Refactor duplicate selectors to use base components
3. Implement consistent prop interfaces

### Phase 3: Apply Patterns

1. Apply composition patterns to complex components
2. Extract reusable logic into custom hooks
3. Create HOCs for cross-cutting concerns

### Phase 4: Testing & Documentation

1. Add comprehensive tests for all patterns
2. Update documentation with examples
3. Create migration guides for existing components
