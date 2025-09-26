import { MockWorkspace } from '@/src/types/workspace';

// Mock workspace data for development
// This will be replaced with database queries in the future

export const mockWorkspaces: MockWorkspace[] = [
   {
      id: 'workspace_demo_1',
      name: 'Personal Projects',
      description: 'My personal development workspace',
      ownerId: 'demo',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      isActive: true,
      settings: {
         theme: 'system',
         defaultView: 'default',
         notifications: {
            enabled: true,
            email: true,
            push: false,
         },
         privacy: {
            isPublic: false,
            allowInvites: true,
         },
      },
      layoutConfig: {
         workspaceZoneA: {
            isVisible: false, // Start with empty state
            leftPanel: {
               id: 'left-panel',
               isVisible: true,
               width: 280,
               settings: {},
            },
            centerPanel: {
               id: 'center-panel',
               isVisible: true,
               settings: {},
            },
            rightPanel: {
               id: 'right-panel',
               isVisible: true,
               width: 320,
               settings: {},
            },
         },
         workspaceZoneB: {
            isVisible: false,
            mode: 'single',
            panels: [
               {
                  id: 'secondary-panel-1',
                  isVisible: true,
                  settings: {},
               },
            ],
         },
         global: {
            controlBarVisible: false,
            workspaceZoneBVisible: false,
            controlBarPosition: 'top',
         },
      },
   },
   {
      id: 'workspace_demo_2',
      name: 'Team Collaboration',
      description: 'Shared workspace for team projects',
      ownerId: 'demo',
      createdAt: '2024-01-10T00:00:00Z',
      updatedAt: '2024-01-20T14:45:00Z',
      isActive: false,
      settings: {
         theme: 'dark',
         defaultView: 'collaboration',
         notifications: {
            enabled: true,
            email: true,
            push: true,
         },
         privacy: {
            isPublic: false,
            allowInvites: true,
         },
      },
      layoutConfig: {
         workspaceZoneA: {
            isVisible: true, // This workspace starts with content visible
            leftPanel: {
               id: 'left-panel',
               screenId: 'team-issues',
               isVisible: true,
               width: 300,
               settings: { filter: 'assigned-to-me' },
            },
            centerPanel: {
               id: 'center-panel',
               screenId: 'issue-detail',
               isVisible: true,
               settings: { view: 'kanban' },
            },
            rightPanel: {
               id: 'right-panel',
               screenId: 'team-chat',
               isVisible: true,
               width: 280,
               settings: { channel: 'general' },
            },
         },
         workspaceZoneB: {
            isVisible: true,
            mode: 'split-2',
            panels: [
               {
                  id: 'secondary-panel-1',
                  screenId: 'project-timeline',
                  isVisible: true,
                  settings: { view: 'gantt' },
               },
               {
                  id: 'secondary-panel-2',
                  screenId: 'team-metrics',
                  isVisible: true,
                  settings: { period: 'last-30-days' },
               },
            ],
         },
         global: {
            controlBarVisible: true,
            workspaceZoneBVisible: true,
            controlBarPosition: 'top',
         },
      },
   },
   {
      id: 'workspace_demo_3',
      name: 'Client Work',
      description: 'Workspace for client projects and deliverables',
      ownerId: 'demo',
      createdAt: '2024-01-05T00:00:00Z',
      updatedAt: '2024-01-18T09:15:00Z',
      isActive: false,
      settings: {
         theme: 'light',
         defaultView: 'client-dashboard',
         notifications: {
            enabled: false,
            email: false,
            push: false,
         },
         privacy: {
            isPublic: false,
            allowInvites: false,
         },
      },
      layoutConfig: {
         workspaceZoneA: {
            isVisible: false, // Empty state for this workspace too
            leftPanel: {
               id: 'left-panel',
               isVisible: true,
               width: 260,
               settings: {},
            },
            centerPanel: {
               id: 'center-panel',
               isVisible: true,
               settings: {},
            },
            rightPanel: {
               id: 'right-panel',
               isVisible: true,
               width: 300,
               settings: {},
            },
         },
         workspaceZoneB: {
            isVisible: false,
            mode: 'single',
            panels: [
               {
                  id: 'secondary-panel-1',
                  isVisible: true,
                  settings: {},
               },
            ],
         },
         global: {
            controlBarVisible: false,
            workspaceZoneBVisible: false,
            controlBarPosition: 'top',
         },
      },
   },
];

// Helper function to get workspace by ID
export const getWorkspaceById = (id: string): MockWorkspace | undefined => {
   return mockWorkspaces.find((workspace) => workspace.id === id);
};

// Helper function to get active workspace
export const getActiveWorkspace = (): MockWorkspace | undefined => {
   return mockWorkspaces.find((workspace) => workspace.isActive);
};

// Helper function to get workspaces by owner
export const getWorkspacesByOwner = (ownerId: string): MockWorkspace[] => {
   return mockWorkspaces.filter((workspace) => workspace.ownerId === ownerId);
};
