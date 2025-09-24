/**
 * State management exports
 *
 * This module provides centralized access to all state management in the application.
 * It re-exports stores from both shared state and feature-specific state.
 */

// Shared state (global application state)
export * from './shared';

// Feature-specific state
export * from '../features/inbox/state';

// Legacy stores (to be migrated)
export { useFilterStore } from './store/filter-store';
export { useSearchStore } from './store/search-store';
// Note: useLayoutConfigStore is now exported from './shared' above
