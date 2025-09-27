import { vi } from 'vitest';
import { Issue, issues as mockIssues } from '@/tests/test-data/issues';

// Mock issues data factory
export const createMockIssuesData = (overrides: Partial<Issue>[] = []): Issue[] => {
   // Use the first 6 issues from the actual test data
   const baseIssues = mockIssues.slice(0, 6);

   // Apply overrides
   return baseIssues.map((issue, index) => ({
      ...issue,
      ...(overrides[index] || {}),
   }));
};

// Mock issues store factory
export const createMockIssuesStore = (mockIssues: Issue[] = createMockIssuesData()) => {
   return {
      // Filter methods
      filterByProject: vi.fn((projectId: string) =>
         mockIssues.filter((issue) =>
            projectId === 'no-project'
               ? issue.project === undefined
               : issue.project?.id === projectId
         )
      ),

      filterByPriority: vi.fn((priorityId: string) =>
         mockIssues.filter((issue) => issue.priority?.id === priorityId)
      ),

      filterByStatus: vi.fn((statusId: string) =>
         mockIssues.filter((issue) => issue.status?.id === statusId)
      ),

      filterByAssignee: vi.fn((assigneeId: string | null) => {
         if (assigneeId === null) {
            return mockIssues.filter((issue) => issue.assignee === null);
         }
         return mockIssues.filter((issue) =>
            assigneeId === 'unassigned'
               ? issue.assignee === null
               : issue.assignee?.id === assigneeId
         );
      }),

      filterByLabel: vi.fn((labelId: string) =>
         mockIssues.filter((issue) => issue.labels?.some((label) => label.id === labelId))
      ),

      // Count methods
      getProjectCount: vi.fn((projectId: string) => {
         const filtered = mockIssues.filter((issue) =>
            projectId === 'no-project'
               ? issue.project === undefined
               : issue.project?.id === projectId
         );
         return filtered.length;
      }),

      getPriorityCount: vi.fn((priorityId: string) => {
         const filtered = mockIssues.filter((issue) => issue.priority?.id === priorityId);
         return filtered.length;
      }),

      getStatusCount: vi.fn((statusId: string) => {
         const filtered = mockIssues.filter((issue) => issue.status?.id === statusId);
         return filtered.length;
      }),

      getAssigneeCount: vi.fn((assigneeId: string | null) => {
         if (assigneeId === null) {
            return mockIssues.filter((issue) => issue.assignee === null).length;
         }
         const filtered = mockIssues.filter((issue) =>
            assigneeId === 'unassigned'
               ? issue.assignee === null
               : issue.assignee?.id === assigneeId
         );
         return filtered.length;
      }),

      getLabelCount: vi.fn((labelId: string) => {
         const filtered = mockIssues.filter((issue) =>
            issue.labels?.some((label) => label.id === labelId)
         );
         return filtered.length;
      }),

      // Store state
      issues: mockIssues,
      filteredIssues: mockIssues,
      isLoading: false,
      error: null,

      // Store actions
      setIssues: vi.fn(),
      addIssue: vi.fn(),
      updateIssue: vi.fn(),
      deleteIssue: vi.fn(),
      setFilter: vi.fn(),
      clearFilter: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
   };
};

// Mock store with error state
export const createMockIssuesStoreWithError = (errorMessage: string = 'Store error') => {
   const mockStore = createMockIssuesStore();

   // Override filter methods to throw errors
   mockStore.filterByProject.mockImplementation(() => {
      throw new Error(errorMessage);
   });
   mockStore.filterByPriority.mockImplementation(() => {
      throw new Error(errorMessage);
   });
   mockStore.filterByStatus.mockImplementation(() => {
      throw new Error(errorMessage);
   });
   mockStore.filterByAssignee.mockImplementation(() => {
      throw new Error(errorMessage);
   });
   mockStore.filterByLabel.mockImplementation(() => {
      throw new Error(errorMessage);
   });

   return mockStore;
};

// Mock store with loading state
export const createMockIssuesStoreWithLoading = () => {
   const mockStore = createMockIssuesStore();
   mockStore.isLoading = true;
   return mockStore;
};

// Mock store with empty data
export const createMockIssuesStoreWithEmptyData = () => {
   return createMockIssuesStore([]);
};

// Helper to create specific test scenarios
export const createTestScenario = {
   // Scenario with specific project distribution
   projectDistribution: (projectCounts: Record<string, number>) => {
      const issues: Issue[] = [];
      let issueId = 1;

      Object.entries(projectCounts).forEach(([projectId, count]) => {
         for (let i = 0; i < count; i++) {
            issues.push({
               id: issueId.toString(),
               identifier: `TEST-${issueId}`,
               title: `Issue ${issueId}`,
               description: `Description for issue ${issueId}`,
               status: { id: 'to-do', name: 'Todo', color: '#f97316', icon: () => null },
               priority: { id: 'medium', name: 'Medium', icon: () => null },
               assignee: null,
               project:
                  projectId === 'no-project'
                     ? undefined
                     : {
                          id: projectId,
                          name: `Project ${projectId}`,
                          status: {
                             id: 'in-progress',
                             name: 'In Progress',
                             color: '#facc15',
                             icon: () => null,
                          },
                          icon: () => null,
                          percentComplete: 50,
                          startDate: '2024-01-01',
                          lead: {
                             id: '1',
                             name: 'Test User',
                             email: 'test@example.com',
                             avatarUrl: 'https://api.dicebear.com/9.x/glass/svg?seed=test',
                             status: 'online',
                             role: 'Member',
                             joinedDate: '2024-01-01',
                             teamIds: ['CORE'],
                          },
                          priority: { id: 'medium', name: 'Medium', icon: () => null },
                          health: {
                             id: 'on-track',
                             name: 'On Track',
                             color: '#00FF00',
                             description: 'The project is on track and on schedule.',
                          },
                       },
               labels: [],
               createdAt: new Date().toISOString(),
               cycleId: '1',
               rank: `a3${String.fromCharCode(99 + issueId)}`,
            });
            issueId++;
         }
      });

      return createMockIssuesStore(issues);
   },

   // Scenario with specific priority distribution
   priorityDistribution: (priorityCounts: Record<string, number>) => {
      const issues: Issue[] = [];
      let issueId = 1;

      Object.entries(priorityCounts).forEach(([priorityId, count]) => {
         for (let i = 0; i < count; i++) {
            issues.push({
               id: issueId.toString(),
               identifier: `TEST-${issueId}`,
               title: `Issue ${issueId}`,
               description: `Description for issue ${issueId}`,
               status: { id: 'to-do', name: 'Todo', color: '#f97316', icon: () => null },
               priority: { id: priorityId, name: priorityId, icon: () => null },
               assignee: null,
               project: undefined,
               labels: [],
               createdAt: new Date().toISOString(),
               cycleId: '1',
               rank: `a3${String.fromCharCode(99 + issueId)}`,
            });
            issueId++;
         }
      });

      return createMockIssuesStore(issues);
   },

   // Scenario with specific status distribution
   statusDistribution: (statusCounts: Record<string, number>) => {
      const issues: Issue[] = [];
      let issueId = 1;

      Object.entries(statusCounts).forEach(([statusId, count]) => {
         for (let i = 0; i < count; i++) {
            issues.push({
               id: issueId.toString(),
               identifier: `TEST-${issueId}`,
               title: `Issue ${issueId}`,
               description: `Description for issue ${issueId}`,
               status: { id: statusId, name: statusId, color: '#3b82f6', icon: () => null },
               priority: { id: 'medium', name: 'Medium', icon: () => null },
               assignee: null,
               project: undefined,
               labels: [],
               createdAt: new Date().toISOString(),
               cycleId: '1',
               rank: `a3${String.fromCharCode(99 + issueId)}`,
            });
            issueId++;
         }
      });

      return createMockIssuesStore(issues);
   },
};

// Export commonly used mock data
export const commonMockIssues = createMockIssuesData();
export const commonMockStore = createMockIssuesStore();
