import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface AppSettings {
   // General settings
   theme: 'light' | 'dark' | 'system';
   language: string;
   timezone: string;

   // Display settings
   showSidebar: boolean;
   sidebarCollapsed: boolean;
   showNotifications: boolean;
   showTooltips: boolean;

   // Layout settings
   defaultView: 'list' | 'grid';
   itemsPerPage: number;
   autoRefresh: boolean;
   refreshInterval: number; // in seconds

   // Notification settings
   emailNotifications: boolean;
   pushNotifications: boolean;
   desktopNotifications: boolean;
   notificationSound: boolean;

   // Privacy settings
   showOnlineStatus: boolean;
   showLastSeen: boolean;
   allowDirectMessages: boolean;

   // Advanced settings
   enableDebugMode: boolean;
   enableAnalytics: boolean;
   enableCrashReporting: boolean;
}

interface SettingsState {
   // Settings
   settings: AppSettings;

   // Actions
   updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
   updateSettings: (updates: Partial<AppSettings>) => void;
   resetSettings: () => void;
   resetToDefaults: () => void;

   // Specific setting helpers
   toggleSidebar: () => void;
   toggleNotifications: () => void;
   setTheme: (theme: AppSettings['theme']) => void;
   setLanguage: (language: string) => void;
   setTimezone: (timezone: string) => void;
}

const DEFAULT_SETTINGS: AppSettings = {
   // General settings
   theme: 'system',
   language: 'en',
   timezone: 'UTC',

   // Display settings
   showSidebar: true,
   sidebarCollapsed: false,
   showNotifications: true,
   showTooltips: true,

   // Layout settings
   defaultView: 'list',
   itemsPerPage: 25,
   autoRefresh: true,
   refreshInterval: 30,

   // Notification settings
   emailNotifications: true,
   pushNotifications: true,
   desktopNotifications: true,
   notificationSound: true,

   // Privacy settings
   showOnlineStatus: true,
   showLastSeen: true,
   allowDirectMessages: true,

   // Advanced settings
   enableDebugMode: false,
   enableAnalytics: true,
   enableCrashReporting: true,
};

export const useSettingsStore = create<SettingsState>()(
   persist<SettingsState>(
      (set) => ({
         // Initial state
         settings: DEFAULT_SETTINGS,

         // Actions
         updateSetting: (key, value) => {
            set((state) => ({
               settings: {
                  ...state.settings,
                  [key]: value,
               },
            }));
         },

         updateSettings: (updates) => {
            set((state) => ({
               settings: {
                  ...state.settings,
                  ...updates,
               },
            }));
         },

         resetSettings: () => {
            set({ settings: DEFAULT_SETTINGS });
         },

         resetToDefaults: () => {
            set({ settings: DEFAULT_SETTINGS });
         },

         // Specific setting helpers
         toggleSidebar: () => {
            set((state) => ({
               settings: {
                  ...state.settings,
                  sidebarCollapsed: !state.settings.sidebarCollapsed,
               },
            }));
         },

         toggleNotifications: () => {
            set((state) => ({
               settings: {
                  ...state.settings,
                  showNotifications: !state.settings.showNotifications,
               },
            }));
         },

         setTheme: (theme) => {
            set((state) => ({
               settings: {
                  ...state.settings,
                  theme,
               },
            }));
         },

         setLanguage: (language) => {
            set((state) => ({
               settings: {
                  ...state.settings,
                  language,
               },
            }));
         },

         setTimezone: (timezone) => {
            set((state) => ({
               settings: {
                  ...state.settings,
                  timezone,
               },
            }));
         },
      }),
      {
         name: 'heyspex-settings',
         storage: createJSONStorage(() => localStorage),

         // Only persist settings
         partialize: (state) =>
            ({
               settings: state.settings,
            }) as SettingsState,
      }
   )
);
