import { LayoutView, ScreenType, KeyboardShortcut } from '@/src/state';

// Helper function to create a default layout view
export function createDefaultLayoutView(): Omit<LayoutView, 'id' | 'createdAt' | 'updatedAt'> {
   return {
      name: 'Default Layout',
      description: 'Default workspace layout',
      sections: {
         A: {
            section: 'A',
            tabs: [
               {
                  id: 'main-menu',
                  type: 'settings' as ScreenType,
                  title: 'Main Menu',
                  isActive: true,
               },
            ],
            activeTabId: 'main-menu',
            isCollapsed: false,
         },
         B: {
            section: 'B',
            tabs: [
               {
                  id: 'issues-main',
                  type: 'issues' as ScreenType,
                  title: 'Issues',
                  isActive: true,
               },
            ],
            activeTabId: 'issues-main',
            isCollapsed: false,
         },
         C: {
            section: 'C',
            tabs: [],
            isCollapsed: true,
         },
      },
   };
}

// Helper function to create predefined layout views
export function createPredefinedViews(): Omit<LayoutView, 'id' | 'createdAt' | 'updatedAt'>[] {
   return [
      createDefaultLayoutView(),
      {
         name: 'Development Focus',
         description: 'Optimized for development work with issues, features, and roadmap',
         sections: {
            A: {
               section: 'A',
               tabs: [
                  {
                     id: 'projects-dev',
                     type: 'projects' as ScreenType,
                     title: 'Projects',
                     isActive: true,
                  },
               ],
               activeTabId: 'projects-dev',
            },
            B: {
               section: 'B',
               tabs: [
                  {
                     id: 'issues-dev',
                     type: 'issues' as ScreenType,
                     title: 'Issues',
                     isActive: true,
                  },
               ],
               activeTabId: 'issues-dev',
            },
            C: {
               section: 'C',
               tabs: [
                  {
                     id: 'features-dev',
                     type: 'features' as ScreenType,
                     title: 'Features',
                     isActive: true,
                  },
                  {
                     id: 'roadmap-dev',
                     type: 'roadmap' as ScreenType,
                     title: 'Roadmap',
                     isActive: false,
                  },
               ],
               activeTabId: 'features-dev',
            },
         },
      },
      {
         name: 'Team Management',
         description: 'Focus on team collaboration and member management',
         sections: {
            A: {
               section: 'A',
               tabs: [
                  {
                     id: 'teams-mgmt',
                     type: 'teams' as ScreenType,
                     title: 'Teams',
                     isActive: true,
                  },
               ],
               activeTabId: 'teams-mgmt',
            },
            B: {
               section: 'B',
               tabs: [
                  {
                     id: 'members-mgmt',
                     type: 'members' as ScreenType,
                     title: 'Members',
                     isActive: true,
                  },
               ],
               activeTabId: 'members-mgmt',
            },
            C: {
               section: 'C',
               tabs: [
                  {
                     id: 'projects-mgmt',
                     type: 'projects' as ScreenType,
                     title: 'Projects',
                     isActive: true,
                  },
               ],
               activeTabId: 'projects-mgmt',
            },
         },
      },
   ];
}

// Helper function to create default keyboard shortcuts
export function createDefaultShortcuts(): Omit<KeyboardShortcut, 'id'>[] {
   return [
      {
         action: 'toggle-section',
         keys: ['ctrl', 'shift', 'a'],
         description: 'Toggle left sidebar (Section A)',
         section: 'A',
         isGlobal: true,
      },
      {
         action: 'toggle-section',
         keys: ['ctrl', 'shift', 'c'],
         description: 'Toggle right sidebar (Section C)',
         section: 'C',
         isGlobal: true,
      },
      {
         action: 'toggle-workspace-zone-b',
         keys: ['ctrl', 'shift', 'b'],
         description: 'Toggle workspace zone B',
         isGlobal: true,
      },
      {
         action: 'open-settings',
         keys: ['ctrl', ','],
         description: 'Open settings',
         isGlobal: true,
      },
   ];
}

// Helper function to validate keyboard shortcut combinations
export function isValidShortcut(keys: string[]): boolean {
   if (keys.length === 0 || keys.length > 4) {
      return false;
   }

   const modifiers = ['ctrl', 'alt', 'shift', 'meta'];
   const keyModifiers = keys.filter((key) => modifiers.includes(key));
   const actualKeys = keys.filter((key) => !modifiers.includes(key));

   // Must have at least one modifier and one actual key
   return keyModifiers.length > 0 && actualKeys.length > 0;
}

// Helper function to format shortcut for display
export function formatShortcut(keys: string[]): string {
   return keys
      .map((key) => {
         switch (key) {
            case 'ctrl':
               return 'Ctrl';
            case 'alt':
               return 'Alt';
            case 'shift':
               return 'Shift';
            case 'meta':
               return 'Cmd';
            default:
               return key.toUpperCase();
         }
      })
      .join(' + ');
}

// Helper function to check if a view name is unique
export function isUniqueViewName(
   name: string,
   existingViews: LayoutView[],
   excludeId?: string
): boolean {
   return !existingViews.some(
      (view) => view.name.toLowerCase() === name.toLowerCase() && view.id !== excludeId
   );
}

// Helper function to get the next available default view name
export function getNextDefaultViewName(existingViews: LayoutView[]): string {
   const baseName = 'Layout';
   let counter = 1;
   let name = baseName;

   while (!isUniqueViewName(name, existingViews)) {
      counter++;
      name = `${baseName} ${counter}`;
   }

   return name;
}

// Helper function to check if a layout view is complete
export function isCompleteLayoutView(view: Partial<LayoutView>): view is LayoutView {
   return !!(
      view.name &&
      view.sections &&
      view.sections.A &&
      view.sections.B &&
      view.sections.C &&
      view.sections.A.tabs &&
      view.sections.B.tabs &&
      view.sections.A.tabs.length > 0 &&
      view.sections.B.tabs.length > 0
   );
}

// Helper function to sanitize view data before saving
export function sanitizeViewForStorage(
   view: LayoutView
): Omit<LayoutView, 'createdAt' | 'updatedAt'> & { createdAt: string; updatedAt: string } {
   return {
      ...view,
      createdAt: view.createdAt.toISOString(),
      updatedAt: view.updatedAt.toISOString(),
   };
}

// Helper function to restore view data from storage
export function restoreViewFromStorage(
   viewData: Omit<LayoutView, 'createdAt' | 'updatedAt'> & { createdAt: string; updatedAt: string }
): LayoutView {
   return {
      ...viewData,
      createdAt: new Date(viewData.createdAt),
      updatedAt: new Date(viewData.updatedAt),
   };
}
