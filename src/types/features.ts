// Feature-specific type definitions

// User/Team types
export interface User {
   id: string;
   name: string;
   email: string;
   avatar?: string;
   role: 'admin' | 'member' | 'viewer';
   status: 'active' | 'inactive' | 'pending';
   createdAt: string;
   updatedAt: string;
}

export interface Team {
   id: string;
   name: string;
   description?: string;
   members: User[];
   projects: Project[];
   createdAt: string;
   updatedAt: string;
}

// Project types
export interface Project {
   id: string;
   name: string;
   description?: string;
   status: 'active' | 'inactive' | 'completed' | 'cancelled';
   priority: 'low' | 'medium' | 'high' | 'urgent';
   lead: User;
   team: Team;
   startDate?: string;
   endDate?: string;
   createdAt: string;
   updatedAt: string;
}

// Issue types
export interface Issue {
   id: string;
   title: string;
   description?: string;
   status: 'open' | 'in-progress' | 'review' | 'closed';
   priority: 'low' | 'medium' | 'high' | 'urgent';
   assignee?: User;
   project: Project;
   labels: Label[];
   createdAt: string;
   updatedAt: string;
}

export interface Label {
   id: string;
   name: string;
   color: string;
   description?: string;
}

// Inbox types
export interface InboxItem {
   id: string;
   type: 'issue' | 'notification' | 'message';
   title: string;
   description?: string;
   read: boolean;
   priority: 'low' | 'medium' | 'high' | 'urgent';
   createdAt: string;
   updatedAt: string;
}

// Settings types
export interface UserSettings {
   id: string;
   userId: string;
   theme: 'light' | 'dark' | 'system';
   notifications: {
      email: boolean;
      push: boolean;
      inApp: boolean;
   };
   preferences: {
      language: string;
      timezone: string;
      dateFormat: string;
   };
   updatedAt: string;
}
