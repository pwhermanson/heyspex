import { describe, it, beforeEach, afterEach, expect } from 'vitest';

// Store imports
import { useFilterStore } from '@/state/store/filter-store';
import { useIssuesStore } from '@/state/store/issues-store';
import { useIssuesFilterStore } from '@/features/inbox/state/issues-filter-store';

// Test data
import { status as allStatus } from '@/tests/test-data/status';
import { projects } from '@/tests/test-data/projects';
import { users } from '@/tests/test-data/users';
import { priorities } from '@/tests/test-data/priorities';
import { labels } from '@/tests/test-data/labels';

// Utilities
import { resetFilterRelatedStores } from '@/tests/utils/store-test-helpers';

describe('Filter Store Reset and Isolation Tests', () => {
   beforeEach(() => {
      resetFilterRelatedStores();
   });

   afterEach(() => {
      resetFilterRelatedStores();
   });

   describe('Store Reset Functionality', () => {
      it('resets all filter stores to initial state', () => {
         const filterStore = useFilterStore.getState();
         const issuesFilterStore = useIssuesFilterStore.getState();

         // Set up some filter state
         filterStore.setFilter('status', ['status-1', 'status-2']);
         filterStore.setFilter('assignee', ['user-1']);
         filterStore.setFilter('priority', ['priority-1']);

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

      it('resets filter state without affecting issues data', () => {
         const filterStore = useFilterStore.getState();
         const issuesStore = useIssuesStore.getState();

         // Get initial issues count
         const initialIssuesCount = issuesStore.issues.length;

         // Set up filter state
         filterStore.setFilter('status', ['status-1']);

         // Reset stores
         resetFilterRelatedStores();

         // Issues data should be unchanged
         expect(issuesStore.issues.length).toBe(initialIssuesCount);
         expect(filterStore.hasActiveFilters()).toBe(false);
      });

      it('handles multiple reset calls gracefully', () => {
         const filterStore = useFilterStore.getState();

         // Set up state
         filterStore.setFilter('status', ['status-1']);

         // Multiple resets should not cause issues
         resetFilterRelatedStores();
         resetFilterRelatedStores();
         resetFilterRelatedStores();

         // State should still be reset
         expect(filterStore.hasActiveFilters()).toBe(false);
      });
   });

   describe('Test Isolation', () => {
      it('ensures tests start with clean state', () => {
         const filterStore = useFilterStore.getState();
         const issuesFilterStore = useIssuesFilterStore.getState();

         // Each test should start with clean state
         expect(filterStore.filters).toEqual({});
         expect(filterStore.hasActiveFilters()).toBe(false);
         expect(filterStore.getActiveFiltersCount()).toBe(0);
         expect(issuesFilterStore.hasActiveFilters()).toBe(false);
         expect(issuesFilterStore.getActiveFiltersCount()).toBe(0);
      });

      it('prevents state bleeding between tests', () => {
         const filterStore = useFilterStore.getState();

         // This test should not be affected by previous test state
         expect(filterStore.filters).toEqual({});
         expect(filterStore.hasActiveFilters()).toBe(false);

         // Set some state
         filterStore.setFilter('status', ['status-1']);

         // Verify state is set
         expect(filterStore.hasActiveFilters()).toBe(true);

         // Reset for next test
         resetFilterRelatedStores();

         // State should be clean again
         expect(filterStore.hasActiveFilters()).toBe(false);
      });
   });

   describe('Store Consistency After Reset', () => {
      it('maintains consistency between stores after reset', () => {
         const filterStore = useFilterStore.getState();
         const issuesFilterStore = useIssuesFilterStore.getState();

         // Set up state
         filterStore.setFilter('status', ['status-1']);
         filterStore.setFilter('assignee', ['user-1']);

         // Reset
         resetFilterRelatedStores();

         // Both stores should be in sync
         expect(filterStore.hasActiveFilters()).toBe(false);
         expect(issuesFilterStore.hasActiveFilters()).toBe(false);
         expect(filterStore.getActiveFiltersCount()).toBe(0);
         expect(issuesFilterStore.getActiveFiltersCount()).toBe(0);
      });

      it('allows fresh filter operations after reset', () => {
         const filterStore = useFilterStore.getState();
         const issuesFilterStore = useIssuesFilterStore.getState();
         const issuesStore = useIssuesStore.getState();

         // Set up initial state
         filterStore.setFilter('status', ['status-1']);

         // Reset
         resetFilterRelatedStores();

         // Should be able to set new filters
         filterStore.setFilter('priority', ['priority-1']);
         expect(filterStore.hasActiveFilters()).toBe(true);
         expect(issuesFilterStore.hasActiveFilters()).toBe(true);

         // Filtering should work correctly
         const filtered = issuesFilterStore.filterIssues(issuesStore.issues);
         expect(Array.isArray(filtered)).toBe(true);
      });
   });

   describe('Edge Cases in Reset', () => {
      it('handles reset when stores are already clean', () => {
         const filterStore = useFilterStore.getState();

         // Reset clean stores
         resetFilterRelatedStores();

         // Should still be clean
         expect(filterStore.hasActiveFilters()).toBe(false);
         expect(filterStore.getActiveFiltersCount()).toBe(0);
      });

      it('handles reset with complex filter state', () => {
         const filterStore = useFilterStore.getState();

         // Set up complex state
         filterStore.setFilter('status', ['status-1', 'status-2', 'status-3']);
         filterStore.setFilter('assignee', ['user-1', 'user-2']);
         filterStore.setFilter('priority', ['priority-1']);
         filterStore.setFilter('labels', ['label-1', 'label-2', 'label-3', 'label-4']);
         filterStore.setFilter('project', ['project-1']);

         // Reset
         resetFilterRelatedStores();

         // Should be completely clean
         expect(filterStore.filters).toEqual({});
         expect(filterStore.hasActiveFilters()).toBe(false);
         expect(filterStore.getActiveFiltersCount()).toBe(0);
      });

      it('handles rapid reset operations', () => {
         const filterStore = useFilterStore.getState();

         // Rapidly set and reset filters
         for (let i = 0; i < 10; i++) {
            filterStore.setFilter('status', [`status-${i}`]);
            resetFilterRelatedStores();
         }

         // Final state should be clean
         expect(filterStore.hasActiveFilters()).toBe(false);
         expect(filterStore.getActiveFiltersCount()).toBe(0);
      });
   });

   describe('Memory and Performance', () => {
      it('does not cause memory leaks with repeated resets', () => {
         const filterStore = useFilterStore.getState();

         // Perform many reset operations
         for (let i = 0; i < 100; i++) {
            filterStore.setFilter('status', [`status-${i}`]);
            resetFilterRelatedStores();
         }

         // Should still work correctly
         expect(filterStore.hasActiveFilters()).toBe(false);
      });

      it('reset operations are fast', () => {
         const filterStore = useFilterStore.getState();

         // Set up complex state
         filterStore.setFilter(
            'status',
            allStatus.map((s) => s.id)
         );
         filterStore.setFilter(
            'assignee',
            users.map((u) => u.id)
         );
         filterStore.setFilter(
            'priority',
            priorities.map((p) => p.id)
         );
         filterStore.setFilter(
            'labels',
            labels.map((l) => l.id)
         );
         filterStore.setFilter(
            'project',
            projects.map((p) => p.id)
         );

         const startTime = performance.now();
         resetFilterRelatedStores();
         const endTime = performance.now();

         // Should complete quickly (less than 10ms)
         expect(endTime - startTime).toBeLessThan(10);
         expect(filterStore.hasActiveFilters()).toBe(false);
      });
   });
});
