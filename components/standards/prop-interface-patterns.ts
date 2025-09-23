/**
 * Standardized Prop Interface Patterns
 *
 * This file defines common prop interface patterns used throughout the HeySpex codebase
 * to ensure consistency and reusability across components.
 */

import React, { ReactNode } from 'react';

// ============================================================================
// Base Component Props
// ============================================================================

/**
 * Base props that all components should support
 */
export interface BaseComponentProps {
   /** Additional CSS classes */
   'className'?: string;
   /** Unique identifier for the element */
   'id'?: string;
   /** Data attribute for testing */
   'data-testid'?: string;
}

/**
 * Props for components that render children
 */
export interface ChildrenProps {
   /** Child elements */
   children?: ReactNode;
}

/**
 * Props for components that can be disabled
 */
export interface DisabledProps {
   /** Whether the component is disabled */
   disabled?: boolean;
}

/**
 * Props for components that can be in loading state
 */
export interface LoadingProps {
   /** Whether the component is in loading state */
   loading?: boolean;
   /** Fallback content to show while loading */
   loadingFallback?: ReactNode;
}

/**
 * Props for components that can show error states
 */
export interface ErrorProps {
   /** Whether the component has an error */
   hasError?: boolean;
   /** Error message to display */
   errorMessage?: string;
}

// ============================================================================
// Form Component Props
// ============================================================================

/**
 * Base props for form input components
 */
export interface FormInputProps extends BaseComponentProps, DisabledProps, ErrorProps {
   /** Current value */
   value: string;
   /** Callback when value changes */
   onChange: (value: string) => void;
   /** Placeholder text */
   placeholder?: string;
   /** Whether the field is required */
   required?: boolean;
   /** Label for the input */
   label?: string;
   /** Helper text */
   helperText?: string;
}

/**
 * Props for selectable components (dropdowns, radio groups, etc.)
 */
export interface SelectableProps<T = string> extends BaseComponentProps, DisabledProps {
   /** Current selected value */
   value: T;
   /** Callback when selection changes */
   onChange: (value: T) => void;
   /** Available options */
   options: Array<{
      value: T;
      label: string;
      disabled?: boolean;
   }>;
   /** Placeholder text when no option is selected */
   placeholder?: string;
}

// ============================================================================
// Selector Component Props
// ============================================================================

/**
 * Base props for selector components (priority, status, assignee, etc.)
 */
export interface BaseSelectorProps<T> extends BaseComponentProps, DisabledProps {
   /** Current selected item */
   selectedItem: T;
   /** Callback when selection changes */
   onSelectionChange: (item: T) => void;
   /** Available items to select from */
   items: T[];
   /** Function to get display text from item */
   getItemLabel: (item: T) => string;
   /** Function to get unique key from item */
   getItemKey: (item: T) => string;
   /** Function to check if item is disabled */
   getItemDisabled?: (item: T) => boolean;
   /** Placeholder text when no item is selected */
   placeholder?: string;
   /** Whether the selector is searchable */
   searchable?: boolean;
   /** Search placeholder text */
   searchPlaceholder?: string;
}

/**
 * Props for selector components that show counts
 */
export interface CountableSelectorProps<T> extends BaseSelectorProps<T> {
   /** Function to get count for an item */
   getItemCount?: (item: T) => number;
   /** Whether to show counts */
   showCounts?: boolean;
}

/**
 * Props for selector components that show icons
 */
export interface IconSelectorProps<T> extends BaseSelectorProps<T> {
   /** Function to get icon component from item */
   getItemIcon?: (item: T) => ReactNode;
   /** Function to get icon props from item */
   getItemIconProps?: (item: T) => Record<string, unknown>;
}

// ============================================================================
// Layout Component Props
// ============================================================================

/**
 * Props for layout container components
 */
export interface LayoutProps extends BaseComponentProps, ChildrenProps {
   /** Layout direction */
   direction?: 'row' | 'column';
   /** Alignment along main axis */
   justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
   /** Alignment along cross axis */
   align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
   /** Gap between children */
   gap?: number | string;
   /** Whether to wrap children */
   wrap?: boolean;
}

/**
 * Props for modal/dialog components
 */
export interface ModalProps extends BaseComponentProps, ChildrenProps {
   /** Whether the modal is open */
   isOpen: boolean;
   /** Callback when modal should close */
   onClose: () => void;
   /** Callback when modal should open */
   onOpen?: () => void;
   /** Whether clicking overlay should close modal */
   closeOnOverlayClick?: boolean;
   /** Whether pressing escape should close modal */
   closeOnEscape?: boolean;
   /** Size of the modal */
   size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

// ============================================================================
// Data Display Component Props
// ============================================================================

/**
 * Props for list components
 */
export interface ListProps<T> extends BaseComponentProps {
   /** Items to display */
   items: T[];
   /** Function to render each item */
   renderItem: (item: T, index: number) => ReactNode;
   /** Key function for React list rendering */
   getItemKey: (item: T, index: number) => string;
   /** Whether the list is empty */
   isEmpty?: boolean;
   /** Content to show when list is empty */
   emptyContent?: ReactNode;
   /** Whether items can be selected */
   selectable?: boolean;
   /** Currently selected items */
   selectedItems?: T[];
   /** Callback when selection changes */
   onSelectionChange?: (items: T[]) => void;
}

/**
 * Props for card components
 */
export interface CardProps extends BaseComponentProps, ChildrenProps {
   /** Card title */
   title?: string;
   /** Card subtitle */
   subtitle?: string;
   /** Card actions */
   actions?: ReactNode;
   /** Whether the card is clickable */
   clickable?: boolean;
   /** Callback when card is clicked */
   onClick?: () => void;
   /** Card variant */
   variant?: 'default' | 'outlined' | 'elevated';
}

// ============================================================================
// Navigation Component Props
// ============================================================================

/**
 * Props for navigation items
 */
export interface NavItemProps extends BaseComponentProps {
   /** Item label */
   label: string;
   /** Item icon */
   icon?: ReactNode;
   /** Item URL or path */
   href?: string;
   /** Whether the item is active */
   isActive?: boolean;
   /** Whether the item is disabled */
   disabled?: boolean;
   /** Callback when item is clicked */
   onClick?: () => void;
   /** Child navigation items */
   children?: NavItemProps[];
}

/**
 * Props for breadcrumb components
 */
export interface BreadcrumbProps extends BaseComponentProps {
   /** Breadcrumb items */
   items: Array<{
      label: string;
      href?: string;
      isActive?: boolean;
   }>;
   /** Separator between items */
   separator?: ReactNode;
}

// ============================================================================
// Button Component Props
// ============================================================================

/**
 * Props for button components
 */
export interface ButtonProps extends BaseComponentProps, DisabledProps {
   /** Button variant */
   variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
   /** Button size */
   size?: 'sm' | 'md' | 'lg' | 'icon';
   /** Button type */
   type?: 'button' | 'submit' | 'reset';
   /** Callback when button is clicked */
   onClick?: () => void;
   /** Button content */
   children?: ReactNode;
   /** Icon to display */
   icon?: ReactNode;
   /** Whether button is in loading state */
   loading?: boolean;
   /** Loading text */
   loadingText?: string;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Make all properties optional except specified ones
 */
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

/**
 * Make all properties required except specified ones
 */
export type RequiredExcept<T, K extends keyof T> = Required<T> & Partial<Pick<T, K>>;

/**
 * Extract props from a component type
 */
export type ComponentPropsType<T> = T extends React.ComponentType<infer P> ? P : never;

/**
 * Props that extend HTML element props
 */
export type HTMLProps<T extends keyof React.JSX.IntrinsicElements> = BaseComponentProps &
   Omit<ComponentPropsType<React.JSX.IntrinsicElements[T]>, keyof BaseComponentProps>;

// ============================================================================
// Common Event Handler Types
// ============================================================================

export type ClickHandler = (event: React.MouseEvent<HTMLElement>) => void;
export type ChangeHandler<T = string> = (value: T) => void;
export type FocusHandler = (event: React.FocusEvent<HTMLElement>) => void;
export type KeyboardHandler = (event: React.KeyboardEvent<HTMLElement>) => void;
export type SubmitHandler = (event: React.FormEvent<HTMLFormElement>) => void;

// ============================================================================
// Example Usage
// ============================================================================
