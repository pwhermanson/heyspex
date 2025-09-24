import { Issue } from '@/src/tests/test-data/issues';

export interface FilterOptions {
   status?: string[];
   assignee?: string[];
   priority?: string[];
   labels?: string[];
   project?: string[];
}

export interface FilterState {
   filters: FilterOptions;
}

/**
 * Generic filter utility functions that can be used across different stores
 */
export class FilterUtils {
   /**
    * Check if there are any active filters
    */
   static hasActiveFilters(filters: FilterOptions): boolean {
      return Object.values(filters).some((filterArray) => filterArray && filterArray.length > 0);
   }

   /**
    * Get the count of active filters
    */
   static getActiveFiltersCount(filters: FilterOptions): number {
      return Object.values(filters).reduce((acc, curr) => acc + (curr?.length || 0), 0);
   }

   /**
    * Toggle a filter value (add if not present, remove if present)
    */
   static toggleFilter<T extends Record<string, string[]>>(
      filters: T,
      type: keyof T,
      id: string
   ): T {
      const currentFilters = filters[type] || [];
      const newFilters = currentFilters.includes(id)
         ? currentFilters.filter((item) => item !== id)
         : [...currentFilters, id];

      return {
         ...filters,
         [type]: newFilters,
      };
   }

   /**
    * Set filter values for a specific type
    */
   static setFilter<T extends Record<string, string[]>>(
      filters: T,
      type: keyof T,
      ids: string[]
   ): T {
      return {
         ...filters,
         [type]: ids,
      };
   }

   /**
    * Clear all filters
    */
   static clearFilters<T extends Record<string, string[]>>(filters: T): T {
      const cleared = {} as T;
      for (const key in filters) {
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         (cleared as any)[key] = [];
      }
      return cleared;
   }

   /**
    * Clear filters for a specific type
    */
   static clearFilterType<T extends Record<string, string[]>>(filters: T, type: keyof T): T {
      return {
         ...filters,
         [type]: [],
      };
   }
}

/**
 * Issue-specific filtering functions
 */
export class IssueFilterUtils {
   /**
    * Filter issues based on filter options
    */
   static filterIssues(issues: Issue[], filters: FilterOptions): Issue[] {
      let filteredIssues = issues;

      // Filter by status
      if (filters.status && filters.status.length > 0) {
         filteredIssues = filteredIssues.filter((issue) =>
            filters.status!.includes(issue.status.id)
         );
      }

      // Filter by assignee
      if (filters.assignee && filters.assignee.length > 0) {
         filteredIssues = filteredIssues.filter((issue) => {
            if (filters.assignee!.includes('unassigned')) {
               // If 'unassigned' is selected and the issue has no assignee
               if (issue.assignee === null) {
                  return true;
               }
            }
            // Check if the issue's assignee is in the selected assignees
            return issue.assignee && filters.assignee!.includes(issue.assignee.id);
         });
      }

      // Filter by priority
      if (filters.priority && filters.priority.length > 0) {
         filteredIssues = filteredIssues.filter((issue) =>
            filters.priority!.includes(issue.priority.id)
         );
      }

      // Filter by labels
      if (filters.labels && filters.labels.length > 0) {
         filteredIssues = filteredIssues.filter((issue) =>
            issue.labels.some((label) => filters.labels!.includes(label.id))
         );
      }

      // Filter by project
      if (filters.project && filters.project.length > 0) {
         filteredIssues = filteredIssues.filter(
            (issue) => issue.project && filters.project!.includes(issue.project.id)
         );
      }

      return filteredIssues;
   }
}
