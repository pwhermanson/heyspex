/**
 * Selector Components
 *
 * This module exports all standardized selector components that provide
 * consistent behavior and interfaces across the application.
 */

// Base selector component
export { default as BaseSelector } from './base-selector';

// Specific selector components
export { default as PrioritySelector } from './priority-selector';
export { default as StatusSelector } from './status-selector';
export { default as AssigneeSelector } from './assignee-selector';
export { default as ProjectSelector } from './project-selector';
export { default as LabelSelector } from './label-selector';

// Re-export types
export type {
   BaseSelectorProps,
   IconSelectorProps,
   CountableSelectorProps,
   SelectableProps,
} from '@/src/components/standards/prop-interface-patterns';
