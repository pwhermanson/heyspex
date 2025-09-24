import { Issue } from '@/src/tests/test-data/issues';
import { useIssuesDataStore } from './issues-data-store';
import { useIssuesFilterStore } from './issues-filter-store';
import { useIssuesSearchStore } from './issues-search-store';
import { useFilterStore } from '@/src/state/store/filter-store';

/**
 * Combined issues store that orchestrates data, filtering, and search.
 * This provides a clean API for components while keeping concerns separated.
 */
export function useIssuesStore() {
   const dataStore = useIssuesDataStore();
   const filterStore = useIssuesFilterStore();
   const searchStore = useIssuesSearchStore();
   const genericFilterStore = useFilterStore();

   // Get all issues with filters and search applied
   const getFilteredIssues = (): Issue[] => {
      const allIssues = dataStore.getAllIssues();
      const filteredIssues = filterStore.filterIssues(allIssues);
      return searchStore.searchIssues(filteredIssues);
   };

   // Get issues by status with filters and search applied
   const getIssuesByStatus = (statusId: string): Issue[] => {
      const allIssues = dataStore.getAllIssues();
      const statusIssues = allIssues.filter((issue) => issue.status.id === statusId);
      const filteredIssues = filterStore.filterIssues(statusIssues);
      return searchStore.searchIssues(filteredIssues);
   };

   return {
      // Data
      issues: dataStore.issues,
      issuesByStatus: dataStore.issuesByStatus,
      searchQuery: searchStore.searchQuery,
      isSearchOpen: searchStore.isSearchOpen,
      filters: genericFilterStore.filters,

      // Data actions
      addIssue: dataStore.addIssue,
      updateIssue: dataStore.updateIssue,
      deleteIssue: dataStore.deleteIssue,
      getIssueById: dataStore.getIssueById,

      // Status management
      updateIssueStatus: dataStore.updateIssueStatus,
      updateIssuePriority: dataStore.updateIssuePriority,
      updateIssueAssignee: dataStore.updateIssueAssignee,
      addIssueLabel: dataStore.addIssueLabel,
      removeIssueLabel: dataStore.removeIssueLabel,
      updateIssueProject: dataStore.updateIssueProject,

      // Filter actions
      setFilter: genericFilterStore.setFilter,
      toggleFilter: genericFilterStore.toggleFilter,
      clearFilters: genericFilterStore.clearFilters,
      clearFilterType: genericFilterStore.clearFilterType,
      hasActiveFilters: filterStore.hasActiveFilters,
      getActiveFiltersCount: filterStore.getActiveFiltersCount,

      // Search actions
      setSearchQuery: searchStore.setSearchQuery,
      openSearch: searchStore.openSearch,
      closeSearch: searchStore.closeSearch,
      toggleSearch: searchStore.toggleSearch,
      resetSearch: searchStore.resetSearch,

      // Combined functions
      getFilteredIssues,
      getIssuesByStatus,
   };
}
