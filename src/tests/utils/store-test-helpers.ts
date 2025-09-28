import { useFilterStore } from '@/state/store/filter-store';
import { useIssuesStore } from '@/state/store/issues-store';
import { groupIssuesByStatus, issues as mockIssues } from '@/tests/test-data/issues';

/**
 * Reset the filter store to its initial state.
 */
export const resetFilterStore = (): void => {
   useFilterStore.setState({ filters: {} });
};

/**
 * Reset the issues store data to the default mock dataset.
 */
export const resetIssuesStore = (): void => {
   const sortedIssues = [...mockIssues].sort((a, b) => b.rank.localeCompare(a.rank));

   useIssuesStore.setState({
      issues: sortedIssues,
      issuesByStatus: groupIssuesByStatus(sortedIssues),
   });
};

/**
 * Reset the issues filter store to its initial state.
 */
export const resetIssuesFilterStore = (): void => {
   // The IssuesFilterStore doesn't have internal state, it delegates to useFilterStore
   // So we don't need to reset it explicitly
};

/**
 * Convenience helper to reset all stores touched by filter integration tests.
 */
export const resetFilterRelatedStores = (): void => {
   resetFilterStore();
   resetIssuesStore();
   resetIssuesFilterStore();
};
