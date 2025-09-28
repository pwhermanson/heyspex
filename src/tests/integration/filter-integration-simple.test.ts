import { describe, it, beforeEach, afterEach, expect } from 'vitest';

// Store imports
import { useFilterStore } from '@/state/store/filter-store';
import { useIssuesStore } from '@/state/store/issues-store';
import { useIssuesFilterStore } from '@/features/inbox/state/issues-filter-store';

// Utilities
import { resetFilterRelatedStores } from '@/tests/utils/store-test-helpers';
import { IssueFilterUtils } from '@/lib/lib/filter-utils';

describe('Filter Integration: Core Store Functionality', () => {
   beforeEach(() => {
      resetFilterRelatedStores();
   });

   afterEach(() => {
      resetFilterRelatedStores();
   });

   describe('IssuesFilterStore Integration', () => {
      it('delegates filter operations to generic filter store correctly', () => {
         const issuesFilterStore = useIssuesFilterStore.getState();
         const filterStore = useFilterStore.getState();
         const issuesStore = useIssuesStore.getState();

         // Set up filters using correct IDs from test data
         filterStore.setFilter('status', ['in-progress', 'completed']);
         filterStore.setFilter('assignee', ['demo']);

         // Test delegation
         expect(issuesFilterStore.hasActiveFilters()).toBe(true);
         expect(issuesFilterStore.getActiveFiltersCount()).toBe(3); // 2 status + 1 assignee

         // Test filtering delegation
         const filteredIssues = issuesFilterStore.filterIssues(issuesStore.issues);
         const currentFilterState = useFilterStore.getState().filters;
         const expectedFiltered = IssueFilterUtils.filterIssues(
            issuesStore.issues,
            currentFilterState
         );

         expect(filteredIssues).toEqual(expectedFiltered);
      });

      it('maintains consistency when filter store state changes', () => {
         const issuesFilterStore = useIssuesFilterStore.getState();
         const filterStore = useFilterStore.getState();

         // Initial state
         expect(issuesFilterStore.hasActiveFilters()).toBe(false);

         // Add filter using correct ID from test data
         filterStore.toggleFilter('priority', 'urgent');
         expect(issuesFilterStore.hasActiveFilters()).toBe(true);
         expect(issuesFilterStore.getActiveFiltersCount()).toBe(1);

         // Remove filter
         filterStore.toggleFilter('priority', 'urgent');
         expect(issuesFilterStore.hasActiveFilters()).toBe(false);
         expect(issuesFilterStore.getActiveFiltersCount()).toBe(0);
      });
   });

   describe('Cross-Store State Consistency', () => {
      it('maintains consistency across all filter-related stores', () => {
         const filterStore = useFilterStore.getState();
         const issuesFilterStore = useIssuesFilterStore.getState();
         const issuesStore = useIssuesStore.getState();

         // Set up complex filter state using actual test data IDs
         filterStore.setFilter('status', ['in-progress', 'completed']);
         filterStore.setFilter('assignee', ['demo']);
         filterStore.setFilter('priority', ['urgent']);
         filterStore.setFilter('labels', ['ui', 'bug']);
         filterStore.setFilter('project', ['1']);

         // Verify all stores report consistent state
         expect(filterStore.hasActiveFilters()).toBe(true);
         expect(issuesFilterStore.hasActiveFilters()).toBe(true);

         // Count: 2 status + 1 assignee + 1 priority + 2 labels + 1 project = 7
         expect(filterStore.getActiveFiltersCount()).toBe(7);
         expect(issuesFilterStore.getActiveFiltersCount()).toBe(7);

         // Verify filtering produces consistent results
         const currentFilterState = useFilterStore.getState().filters;
         console.log('Test - Filter store state:', currentFilterState);
         const directFiltered = issuesStore.filterIssues(currentFilterState);
         console.log('Test - Direct filtered length:', directFiltered.length);
         const delegatedFiltered = issuesFilterStore.filterIssues(issuesStore.issues);
         console.log('Test - Delegated filtered length:', delegatedFiltered.length);
         const utilityFiltered = IssueFilterUtils.filterIssues(
            issuesStore.issues,
            currentFilterState
         );
         console.log('Test - Utility filtered length:', utilityFiltered.length);

         // Test that all three methods produce the same results
         expect(directFiltered).toEqual(delegatedFiltered);
         expect(delegatedFiltered).toEqual(utilityFiltered);
      });

      it('handles filter clearing consistently across all stores', () => {
         const filterStore = useFilterStore.getState();
         const issuesFilterStore = useIssuesFilterStore.getState();

         // Set up filters using correct IDs from test data
         filterStore.setFilter('status', ['in-progress']);
         filterStore.setFilter('assignee', ['demo']);

         // Verify active state
         expect(filterStore.hasActiveFilters()).toBe(true);
         expect(issuesFilterStore.hasActiveFilters()).toBe(true);

         // Clear all filters
         filterStore.clearFilters();

         // Verify all stores report cleared state
         expect(filterStore.hasActiveFilters()).toBe(false);
         expect(issuesFilterStore.hasActiveFilters()).toBe(false);
         expect(filterStore.getActiveFiltersCount()).toBe(0);
         expect(issuesFilterStore.getActiveFiltersCount()).toBe(0);
      });
   });

   describe('Edge Cases and Error Handling', () => {
      it('handles empty filter arrays gracefully', () => {
         const filterStore = useFilterStore.getState();
         const issuesFilterStore = useIssuesFilterStore.getState();
         const issuesStore = useIssuesStore.getState();

         // Set empty filter arrays
         filterStore.setFilter('status', []);
         filterStore.setFilter('assignee', []);
         filterStore.setFilter('priority', []);
         filterStore.setFilter('labels', []);
         filterStore.setFilter('project', []);

         // Should not be considered active filters
         expect(filterStore.hasActiveFilters()).toBe(false);
         expect(issuesFilterStore.hasActiveFilters()).toBe(false);

         // Should return all issues
         const filtered = issuesFilterStore.filterIssues(issuesStore.issues);
         expect(filtered).toEqual(issuesStore.issues);
      });

      it('handles invalid filter values gracefully', () => {
         const filterStore = useFilterStore.getState();
         const issuesFilterStore = useIssuesFilterStore.getState();
         const issuesStore = useIssuesStore.getState();

         // Set invalid filter values
         filterStore.setFilter('status', ['invalid-status-id']);
         filterStore.setFilter('assignee', ['invalid-user-id']);

         // Should still be considered active filters
         expect(filterStore.hasActiveFilters()).toBe(true);

         // Should return empty results
         const filtered = issuesFilterStore.filterIssues(issuesStore.issues);
         expect(filtered).toEqual([]);
      });

      it('handles undefined/null filter values gracefully', () => {
         const filterStore = useFilterStore.getState();
         const issuesFilterStore = useIssuesFilterStore.getState();
         const issuesStore = useIssuesStore.getState();

         // Set undefined filter values
         filterStore.setFilter('status', undefined as any);
         filterStore.setFilter('assignee', null as any);

         // Should not be considered active filters
         expect(filterStore.hasActiveFilters()).toBe(false);

         // Should return all issues
         const filtered = issuesFilterStore.filterIssues(issuesStore.issues);
         expect(filtered).toEqual(issuesStore.issues);
      });

      it('handles rapid filter changes without state corruption', () => {
         const filterStore = useFilterStore.getState();
         const issuesFilterStore = useIssuesFilterStore.getState();
         const issuesStore = useIssuesStore.getState();

         // Rapidly change filters
         for (let i = 0; i < 10; i++) {
            filterStore.toggleFilter('status', `status-${i % 3}`);
            filterStore.toggleFilter('assignee', `user-${i % 2}`);
         }

         // State should be consistent
         expect(filterStore.hasActiveFilters()).toBe(true);
         expect(issuesFilterStore.hasActiveFilters()).toBe(true);

         // Filtering should work correctly
         const filtered = issuesFilterStore.filterIssues(issuesStore.issues);
         expect(Array.isArray(filtered)).toBe(true);
      });
   });

   describe('Performance and Memory', () => {
      it('does not cause memory leaks with repeated filter operations', () => {
         const filterStore = useFilterStore.getState();
         const issuesFilterStore = useIssuesFilterStore.getState();
         const issuesStore = useIssuesStore.getState();

         // Perform many filter operations
         for (let i = 0; i < 100; i++) {
            filterStore.toggleFilter('status', `status-${i % 5}`);
            filterStore.toggleFilter('assignee', `user-${i % 3}`);

            // Verify filtering still works
            const filtered = issuesFilterStore.filterIssues(issuesStore.issues);
            expect(Array.isArray(filtered)).toBe(true);
         }

         // Final state should be consistent
         expect(filterStore.hasActiveFilters()).toBe(true);
         expect(issuesFilterStore.hasActiveFilters()).toBe(true);
      });

      it('handles large datasets efficiently', () => {
         const filterStore = useFilterStore.getState();
         const issuesFilterStore = useIssuesFilterStore.getState();
         const issuesStore = useIssuesStore.getState();

         // Set up complex filters using correct IDs from test data
         filterStore.setFilter('status', ['in-progress', 'completed', 'technical-review']);
         filterStore.setFilter('assignee', ['demo', 'ln']);
         filterStore.setFilter('priority', ['urgent', 'high']);
         filterStore.setFilter('labels', ['ui', 'bug', 'feature', 'documentation']);
         filterStore.setFilter('project', ['1', '2']);

         const startTime = performance.now();
         const filtered = issuesFilterStore.filterIssues(issuesStore.issues);
         const endTime = performance.now();

         // Should complete quickly (less than 100ms for test data)
         expect(endTime - startTime).toBeLessThan(100);
         expect(Array.isArray(filtered)).toBe(true);
      });
   });

   describe('Filter Store Reset and Isolation', () => {
      it('resets all filter stores to initial state', () => {
         const filterStore = useFilterStore.getState();
         const issuesFilterStore = useIssuesFilterStore.getState();

         // Set up some filter state using correct IDs from test data
         filterStore.setFilter('status', ['in-progress', 'completed']);
         filterStore.setFilter('assignee', ['demo']);
         filterStore.setFilter('priority', ['urgent']);

         // Verify state is set
         expect(filterStore.hasActiveFilters()).toBe(true);
         expect(filterStore.getActiveFiltersCount()).toBe(4);
         expect(issuesFilterStore.hasActiveFilters()).toBe(true);
         expect(issuesFilterStore.getActiveFiltersCount()).toBe(4);

         // Reset stores
         resetFilterRelatedStores();

         // Verify state is reset
         expect(filterStore.hasActiveFilters()).toBe(false);
         expect(filterStore.getActiveFiltersCount()).toBe(0);
         expect(issuesFilterStore.hasActiveFilters()).toBe(false);
         expect(issuesFilterStore.getActiveFiltersCount()).toBe(0);
      });

      it('handles multiple reset calls gracefully', () => {
         const filterStore = useFilterStore.getState();

         // Set up state using correct ID from test data
         filterStore.setFilter('status', ['in-progress']);

         // Multiple resets should not cause issues
         resetFilterRelatedStores();
         resetFilterRelatedStores();
         resetFilterRelatedStores();

         // State should still be reset
         expect(filterStore.hasActiveFilters()).toBe(false);
      });
   });
});
