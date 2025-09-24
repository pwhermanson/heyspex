import { Issue } from '@/src/tests/test-data/issues';
import { create } from 'zustand';
import { useFilterStore } from '@/src/state/store/filter-store';
import { IssueFilterUtils } from '@/src/lib/lib/filter-utils';

interface IssuesFilterState {
   // Filtering functions
   filterIssues: (issues: Issue[]) => Issue[];

   // Utility
   hasActiveFilters: () => boolean;
   getActiveFiltersCount: () => number;
}

export const useIssuesFilterStore = create<IssuesFilterState>(() => ({
   // Filtering functions
   filterIssues: (issues: Issue[]) => {
      const { filters } = useFilterStore.getState();
      return IssueFilterUtils.filterIssues(issues, filters);
   },

   // Utility
   hasActiveFilters: () => {
      const { hasActiveFilters } = useFilterStore.getState();
      return hasActiveFilters();
   },

   getActiveFiltersCount: () => {
      const { getActiveFiltersCount } = useFilterStore.getState();
      return getActiveFiltersCount();
   },
}));
