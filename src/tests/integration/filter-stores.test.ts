import { describe, it, beforeEach, afterEach, expect } from 'vitest';

import { useFilterStore } from '@/state/store/filter-store';
import { useIssuesStore } from '@/state/store/issues-store';
import { IssueFilterUtils } from '@/lib/lib/filter-utils';
import { resetFilterRelatedStores } from '@/tests/utils/store-test-helpers';

const getCurrentFilters = () => useFilterStore.getState().filters;

const getFilteredIssues = () => useIssuesStore.getState().filterIssues(getCurrentFilters());

describe('filter integration: useFilterStore -> useIssuesStore', () => {
   beforeEach(() => {
      resetFilterRelatedStores();
   });

   afterEach(() => {
      resetFilterRelatedStores();
   });

   it('returns all issues with zero active filters', () => {
      const filterState = useFilterStore.getState();
      const issuesState = useIssuesStore.getState();

      expect(filterState.hasActiveFilters()).toBe(false);
      expect(filterState.getActiveFiltersCount()).toBe(0);

      const filtered = issuesState.filterIssues(filterState.filters);
      expect(filtered).toHaveLength(issuesState.issues.length);
      expect(filtered).toEqual(issuesState.issues);
   });

   it('applies stacked status and assignee filters consistently', () => {
      const filterState = useFilterStore.getState();
      const issuesState = useIssuesStore.getState();
      const baseIssues = issuesState.issues;

      // Choose an issue with both status and assignee set to ensure a positive match.
      const issueWithAssignee = baseIssues.find((issue) => issue.assignee !== null);
      expect(issueWithAssignee).toBeDefined();

      const statusId = issueWithAssignee!.status.id;
      const assigneeId = issueWithAssignee!.assignee!.id;

      filterState.toggleFilter('status', statusId);
      filterState.toggleFilter('assignee', assigneeId);

      expect(filterState.hasActiveFilters()).toBe(true);
      expect(filterState.getActiveFiltersCount()).toBe(2);

      const filtered = issuesState.filterIssues(getCurrentFilters());
      const expected = IssueFilterUtils.filterIssues(baseIssues, getCurrentFilters());

      expect(filtered).toEqual(expected);
      expect(filtered.every((issue) => issue.status.id === statusId)).toBe(true);
      expect(filtered.every((issue) => issue.assignee?.id === assigneeId)).toBe(true);
   });

   it('supports label and project filters with intersection logic', () => {
      const filterState = useFilterStore.getState();
      const issuesState = useIssuesStore.getState();
      const baseIssues = issuesState.issues;

      const issueWithProjectAndLabel = baseIssues.find(
         (issue) => issue.project && issue.labels.length > 0
      );
      expect(issueWithProjectAndLabel).toBeDefined();

      const projectId = issueWithProjectAndLabel!.project!.id;
      const labelId = issueWithProjectAndLabel!.labels[0]!.id;

      filterState.toggleFilter('project', projectId);
      filterState.toggleFilter('labels', labelId);

      const filtered = getFilteredIssues();
      const expected = IssueFilterUtils.filterIssues(baseIssues, getCurrentFilters());

      expect(filtered).toEqual(expected);
      expect(filtered.every((issue) => issue.project?.id === projectId)).toBe(true);
      expect(filtered.every((issue) => issue.labels.some((label) => label.id === labelId))).toBe(
         true
      );
   });

   it('clears filters globally and per type', () => {
      const filterState = useFilterStore.getState();
      const issuesState = useIssuesStore.getState();
      const [firstIssue] = issuesState.issues;

      // Apply multiple filters.
      filterState.toggleFilter('status', firstIssue.status.id);
      filterState.toggleFilter('priority', firstIssue.priority.id);
      filterState.toggleFilter('labels', firstIssue.labels[0]!.id);

      expect(filterState.getActiveFiltersCount()).toBe(3);

      filterState.clearFilterType('status');
      expect(filterState.getActiveFiltersCount()).toBe(2);

      filterState.clearFilters();
      expect(filterState.hasActiveFilters()).toBe(false);
      expect(filterState.getActiveFiltersCount()).toBe(0);

      const filtered = issuesState.filterIssues(getCurrentFilters());
      expect(filtered).toHaveLength(issuesState.issues.length);
   });

   it('keeps count helpers aligned with individual filter shortcuts', () => {
      const filterState = useFilterStore.getState();
      const issuesState = useIssuesStore.getState();

      const [firstIssue] = issuesState.issues;
      const statusId = firstIssue.status.id;

      filterState.toggleFilter('status', statusId);

      const filtered = getFilteredIssues();
      const statusCount = issuesState.filterByStatus(statusId).length;

      expect(filterState.getActiveFiltersCount()).toBe(1);
      expect(filtered).toHaveLength(statusCount);
   });
});
