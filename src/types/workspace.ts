/**
 * Workspace Management Types
 *
 * These types define the structure for managing multiple workspaces
 * per user, preparing for future database integration.
 */

export interface Workspace {
   id: string;
   name: string;
   description?: string;
   ownerId: string; // User ID who owns this workspace
   createdAt: string;
   updatedAt: string;
   isActive: boolean; // Currently selected workspace
   settings: WorkspaceSettings;
   layoutConfig: WorkspaceLayoutConfig;
}

export interface WorkspaceSettings {
   theme: 'light' | 'dark' | 'system';
   defaultView?: string; // ID of default view
   notifications: {
      enabled: boolean;
      email: boolean;
      push: boolean;
   };
   privacy: {
      isPublic: boolean;
      allowInvites: boolean;
   };
}

export interface WorkspaceLayoutConfig {
   // Workspace Zone A configuration
   workspaceZoneA: {
      isVisible: boolean;
      leftPanel: PanelConfig;
      centerPanel: PanelConfig;
      rightPanel: PanelConfig;
   };
   // Workspace Zone B configuration
   workspaceZoneB: {
      isVisible: boolean;
      mode: 'single' | 'split-2' | 'split-3';
      panels: PanelConfig[];
   };
   // Global layout settings
   global: {
      topBarVisible: boolean;
      bottomBarVisible: boolean;
      controlBarPosition: 'top' | 'left' | 'right' | 'bottom';
   };
}

export interface PanelConfig {
   id: string;
   screenId?: string; // Currently loaded screen
   isVisible: boolean;
   width?: number; // For resizable panels
   settings: Record<string, unknown>; // Panel-specific settings
}

export interface WorkspaceMember {
   userId: string;
   workspaceId: string;
   role: 'owner' | 'admin' | 'member' | 'viewer';
   joinedAt: string;
   permissions: WorkspacePermissions;
}

export interface WorkspacePermissions {
   canEdit: boolean;
   canDelete: boolean;
   canInvite: boolean;
   canManageSettings: boolean;
}

export interface CreateWorkspaceRequest {
   name: string;
   description?: string;
   settings?: Partial<WorkspaceSettings>;
   layoutConfig?: Partial<WorkspaceLayoutConfig>;
}

export interface UpdateWorkspaceRequest {
   id: string;
   name?: string;
   description?: string;
   settings?: Partial<WorkspaceSettings>;
   layoutConfig?: Partial<WorkspaceLayoutConfig>;
}

// Mock data types for development
export interface MockWorkspace extends Omit<Workspace, 'ownerId' | 'createdAt' | 'updatedAt'> {
   ownerId: string;
   createdAt: string;
   updatedAt: string;
}
