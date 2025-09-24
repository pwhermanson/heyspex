/**
 * Inbox feature state exports
 *
 * This module provides all state management for the inbox feature,
 * including issues data, filtering, and search functionality.
 */

export { useIssuesDataStore } from './issues-data-store';
export { useIssuesFilterStore } from './issues-filter-store';
export { useIssuesSearchStore } from './issues-search-store';
export { useIssuesStore } from './issues-store';
export { useNotificationsStore } from './notifications-store';

// Re-export types for convenience
export type { FilterOptions } from '@/src/lib/lib/filter-utils';
