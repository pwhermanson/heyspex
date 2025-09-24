import { groupIssuesByStatus, Issue, issues as mockIssues } from '@/src/tests/test-data/issues';
import { LabelInterface } from '@/src/tests/test-data/labels';
import { Priority } from '@/src/tests/test-data/priorities';
import { Project } from '@/src/tests/test-data/projects';
import { Status } from '@/src/tests/test-data/status';
import { User } from '@/src/tests/test-data/users';
import { create } from 'zustand';

interface IssuesDataState {
   // Data
   issues: Issue[];
   issuesByStatus: Record<string, Issue[]>;

   // Actions
   getAllIssues: () => Issue[];
   addIssue: (issue: Issue) => void;
   updateIssue: (id: string, updatedIssue: Partial<Issue>) => void;
   deleteIssue: (id: string) => void;

   // Status management
   updateIssueStatus: (issueId: string, newStatus: Status) => void;

   // Priority management
   updateIssuePriority: (issueId: string, newPriority: Priority) => void;

   // Assignee management
   updateIssueAssignee: (issueId: string, newAssignee: User | null) => void;

   // Labels management
   addIssueLabel: (issueId: string, label: LabelInterface) => void;
   removeIssueLabel: (issueId: string, labelId: string) => void;

   // Project management
   updateIssueProject: (issueId: string, newProject: Project | undefined) => void;

   // Utility functions
   getIssueById: (id: string) => Issue | undefined;
}

export const useIssuesDataStore = create<IssuesDataState>((set, get) => ({
   // Initial state
   issues: mockIssues.sort((a, b) => b.rank.localeCompare(a.rank)),
   issuesByStatus: groupIssuesByStatus(mockIssues),

   // Actions
   getAllIssues: () => get().issues,

   addIssue: (issue: Issue) => {
      set((state) => {
         const newIssues = [...state.issues, issue];
         return {
            issues: newIssues,
            issuesByStatus: groupIssuesByStatus(newIssues),
         };
      });
   },

   updateIssue: (id: string, updatedIssue: Partial<Issue>) => {
      set((state) => {
         const newIssues = state.issues.map((issue) =>
            issue.id === id ? { ...issue, ...updatedIssue } : issue
         );

         return {
            issues: newIssues,
            issuesByStatus: groupIssuesByStatus(newIssues),
         };
      });
   },

   deleteIssue: (id: string) => {
      set((state) => {
         const newIssues = state.issues.filter((issue) => issue.id !== id);
         return {
            issues: newIssues,
            issuesByStatus: groupIssuesByStatus(newIssues),
         };
      });
   },

   // Status management
   updateIssueStatus: (issueId: string, newStatus: Status) => {
      get().updateIssue(issueId, { status: newStatus });
   },

   // Priority management
   updateIssuePriority: (issueId: string, newPriority: Priority) => {
      get().updateIssue(issueId, { priority: newPriority });
   },

   // Assignee management
   updateIssueAssignee: (issueId: string, newAssignee: User | null) => {
      get().updateIssue(issueId, { assignee: newAssignee });
   },

   // Labels management
   addIssueLabel: (issueId: string, label: LabelInterface) => {
      const issue = get().getIssueById(issueId);
      if (issue) {
         const updatedLabels = [...issue.labels, label];
         get().updateIssue(issueId, { labels: updatedLabels });
      }
   },

   removeIssueLabel: (issueId: string, labelId: string) => {
      const issue = get().getIssueById(issueId);
      if (issue) {
         const updatedLabels = issue.labels.filter((label) => label.id !== labelId);
         get().updateIssue(issueId, { labels: updatedLabels });
      }
   },

   // Project management
   updateIssueProject: (issueId: string, newProject: Project | undefined) => {
      get().updateIssue(issueId, { project: newProject });
   },

   // Utility functions
   getIssueById: (id: string) => {
      return get().issues.find((issue) => issue.id === id);
   },
}));
