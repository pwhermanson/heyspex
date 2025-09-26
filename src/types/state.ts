// State management type definitions
import type { User } from './features';

// Store state interfaces
export interface AppState {
   user: UserState;
   layout: LayoutState;
   notifications: NotificationState;
   search: SearchState;
}

export interface UserState {
   currentUser: User | null;
   isAuthenticated: boolean;
   isLoading: boolean;
   error: string | null;
}

export interface LayoutState {
   sidebarOpen: boolean;
   workspaceZoneBOpen: boolean;
   theme: 'light' | 'dark' | 'system';
   viewMode: 'grid' | 'list';
}

export interface NotificationState {
   items: Notification[];
   unreadCount: number;
   isLoading: boolean;
}

export interface SearchState {
   query: string;
   results: SearchResult[];
   isSearching: boolean;
   filters: SearchFilters;
}

// Action types
export type Action<T = unknown> = {
   type: string;
   payload?: T;
};

// Store action creators
export interface StoreActions {
   // User actions
   setUser: (user: User | null) => void;
   setLoading: (loading: boolean) => void;
   setError: (error: string | null) => void;

   // Layout actions
   toggleSidebar: () => void;
   toggleWorkspaceZoneB: () => void;
   setTheme: (theme: 'light' | 'dark' | 'system') => void;
   setViewMode: (mode: 'grid' | 'list') => void;

   // Notification actions
   addNotification: (notification: Notification) => void;
   markAsRead: (id: string) => void;
   clearAll: () => void;

   // Search actions
   setQuery: (query: string) => void;
   setResults: (results: SearchResult[]) => void;
   setSearching: (searching: boolean) => void;
   setFilters: (filters: SearchFilters) => void;
}

// Additional types
export interface Notification {
   id: string;
   title: string;
   message: string;
   type: 'info' | 'success' | 'warning' | 'error';
   read: boolean;
   createdAt: string;
}

export interface SearchResult {
   id: string;
   title: string;
   description?: string;
   type: 'issue' | 'project' | 'user' | 'team';
   url: string;
}

export interface SearchFilters {
   status?: string[];
   priority?: string[];
   assignee?: string[];
   project?: string[];
   team?: string[];
   dateRange?: {
      start: string;
      end: string;
   };
}
