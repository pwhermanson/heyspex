import { Issue } from '@/src/tests/test-data/issues';
import { create } from 'zustand';

interface IssuesSearchState {
   // Search state
   searchQuery: string;
   isSearchOpen: boolean;

   // Actions
   setSearchQuery: (query: string) => void;
   openSearch: () => void;
   closeSearch: () => void;
   toggleSearch: () => void;
   resetSearch: () => void;

   // Search functions
   searchIssues: (issues: Issue[]) => Issue[];
}

export const useIssuesSearchStore = create<IssuesSearchState>((set, get) => ({
   // Initial state
   searchQuery: '',
   isSearchOpen: false,

   // Actions
   setSearchQuery: (query: string) => set({ searchQuery: query }),
   openSearch: () => set({ isSearchOpen: true }),
   closeSearch: () => set({ isSearchOpen: false }),
   toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
   resetSearch: () => set({ isSearchOpen: false, searchQuery: '' }),

   // Search functions
   searchIssues: (issues: Issue[]) => {
      const { searchQuery } = get();
      if (!searchQuery.trim()) {
         return issues;
      }

      const lowerCaseQuery = searchQuery.toLowerCase();
      return issues.filter(
         (issue) =>
            issue.title.toLowerCase().includes(lowerCaseQuery) ||
            issue.identifier.toLowerCase().includes(lowerCaseQuery)
      );
   },
}));
