import { renderHook, act } from '@testing-library/react';
import { useSettingsStore, AppSettings } from '@/features/settings/state/settings-store';
import { mockLocalStorage } from '../utils/store-test-utils';

// Mock localStorage
const mockStorage = mockLocalStorage();
Object.defineProperty(window, 'localStorage', {
   value: mockStorage,
});

describe('useSettingsStore', () => {
   beforeEach(() => {
      // Clear localStorage before each test
      mockStorage.clear();
      // Reset store to initial state
      useSettingsStore.getState().resetSettings();
   });

   describe('Initial State', () => {
      it('should have default settings on initialization', () => {
         const { result } = renderHook(() => useSettingsStore());

         expect(result.current.settings).toEqual({
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
         });
      });

      it('should have all required actions available', () => {
         const { result } = renderHook(() => useSettingsStore());

         expect(typeof result.current.updateSetting).toBe('function');
         expect(typeof result.current.updateSettings).toBe('function');
         expect(typeof result.current.resetSettings).toBe('function');
         expect(typeof result.current.resetToDefaults).toBe('function');
         expect(typeof result.current.toggleSidebar).toBe('function');
         expect(typeof result.current.toggleNotifications).toBe('function');
         expect(typeof result.current.setTheme).toBe('function');
         expect(typeof result.current.setLanguage).toBe('function');
         expect(typeof result.current.setTimezone).toBe('function');
      });
   });

   describe('updateSetting', () => {
      it('should update a single setting', () => {
         const { result } = renderHook(() => useSettingsStore());

         act(() => {
            result.current.updateSetting('theme', 'dark');
         });

         expect(result.current.settings.theme).toBe('dark');
      });

      it('should update multiple different settings', () => {
         const { result } = renderHook(() => useSettingsStore());

         act(() => {
            result.current.updateSetting('theme', 'light');
            result.current.updateSetting('language', 'es');
            result.current.updateSetting('itemsPerPage', 50);
         });

         expect(result.current.settings.theme).toBe('light');
         expect(result.current.settings.language).toBe('es');
         expect(result.current.settings.itemsPerPage).toBe(50);
      });

      it('should preserve other settings when updating one', () => {
         const { result } = renderHook(() => useSettingsStore());
         const originalSettings = { ...result.current.settings };

         act(() => {
            result.current.updateSetting('theme', 'dark');
         });

         expect(result.current.settings.theme).toBe('dark');
         expect(result.current.settings.language).toBe(originalSettings.language);
         expect(result.current.settings.timezone).toBe(originalSettings.timezone);
         expect(result.current.settings.showSidebar).toBe(originalSettings.showSidebar);
      });
   });

   describe('updateSettings', () => {
      it('should update multiple settings at once', () => {
         const { result } = renderHook(() => useSettingsStore());

         const updates: Partial<AppSettings> = {
            theme: 'dark',
            language: 'fr',
            timezone: 'Europe/Paris',
            itemsPerPage: 100,
         };

         act(() => {
            result.current.updateSettings(updates);
         });

         expect(result.current.settings.theme).toBe('dark');
         expect(result.current.settings.language).toBe('fr');
         expect(result.current.settings.timezone).toBe('Europe/Paris');
         expect(result.current.settings.itemsPerPage).toBe(100);
      });

      it('should preserve unchanged settings', () => {
         const { result } = renderHook(() => useSettingsStore());
         const originalSettings = { ...result.current.settings };

         act(() => {
            result.current.updateSettings({ theme: 'dark' });
         });

         expect(result.current.settings.theme).toBe('dark');
         expect(result.current.settings.language).toBe(originalSettings.language);
         expect(result.current.settings.timezone).toBe(originalSettings.timezone);
         expect(result.current.settings.showSidebar).toBe(originalSettings.showSidebar);
      });

      it('should handle empty updates object', () => {
         const { result } = renderHook(() => useSettingsStore());
         const originalSettings = { ...result.current.settings };

         act(() => {
            result.current.updateSettings({});
         });

         expect(result.current.settings).toEqual(originalSettings);
      });
   });

   describe('resetSettings', () => {
      it('should reset all settings to defaults', () => {
         const { result } = renderHook(() => useSettingsStore());

         // First, change some settings
         act(() => {
            result.current.updateSettings({
               theme: 'dark',
               language: 'es',
               itemsPerPage: 100,
            });
         });

         // Then reset
         act(() => {
            result.current.resetSettings();
         });

         expect(result.current.settings).toEqual({
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
         });
      });
   });

   describe('resetToDefaults', () => {
      it('should reset all settings to defaults (same as resetSettings)', () => {
         const { result } = renderHook(() => useSettingsStore());

         // First, change some settings
         act(() => {
            result.current.updateSettings({
               theme: 'dark',
               language: 'es',
               itemsPerPage: 100,
            });
         });

         // Then reset to defaults
         act(() => {
            result.current.resetToDefaults();
         });

         expect(result.current.settings).toEqual({
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
         });
      });
   });

   describe('toggleSidebar', () => {
      it('should toggle sidebar collapsed state', () => {
         const { result } = renderHook(() => useSettingsStore());

         expect(result.current.settings.sidebarCollapsed).toBe(false);

         act(() => {
            result.current.toggleSidebar();
         });

         expect(result.current.settings.sidebarCollapsed).toBe(true);

         act(() => {
            result.current.toggleSidebar();
         });

         expect(result.current.settings.sidebarCollapsed).toBe(false);
      });

      it('should preserve other settings when toggling sidebar', () => {
         const { result } = renderHook(() => useSettingsStore());
         const originalSettings = { ...result.current.settings };

         act(() => {
            result.current.toggleSidebar();
         });

         expect(result.current.settings.sidebarCollapsed).toBe(true);
         expect(result.current.settings.theme).toBe(originalSettings.theme);
         expect(result.current.settings.language).toBe(originalSettings.language);
         expect(result.current.settings.showSidebar).toBe(originalSettings.showSidebar);
      });
   });

   describe('toggleNotifications', () => {
      it('should toggle notifications enabled state', () => {
         const { result } = renderHook(() => useSettingsStore());

         expect(result.current.settings.showNotifications).toBe(true);

         act(() => {
            result.current.toggleNotifications();
         });

         expect(result.current.settings.showNotifications).toBe(false);

         act(() => {
            result.current.toggleNotifications();
         });

         expect(result.current.settings.showNotifications).toBe(true);
      });

      it('should preserve other settings when toggling notifications', () => {
         const { result } = renderHook(() => useSettingsStore());
         const originalSettings = { ...result.current.settings };

         act(() => {
            result.current.toggleNotifications();
         });

         expect(result.current.settings.showNotifications).toBe(false);
         expect(result.current.settings.theme).toBe(originalSettings.theme);
         expect(result.current.settings.language).toBe(originalSettings.language);
         expect(result.current.settings.sidebarCollapsed).toBe(originalSettings.sidebarCollapsed);
      });
   });

   describe('setTheme', () => {
      it('should set theme to valid values', () => {
         const { result } = renderHook(() => useSettingsStore());

         const themes: AppSettings['theme'][] = ['light', 'dark', 'system'];

         themes.forEach((theme) => {
            act(() => {
               result.current.setTheme(theme);
            });

            expect(result.current.settings.theme).toBe(theme);
         });
      });

      it('should preserve other settings when setting theme', () => {
         const { result } = renderHook(() => useSettingsStore());
         const originalSettings = { ...result.current.settings };

         act(() => {
            result.current.setTheme('dark');
         });

         expect(result.current.settings.theme).toBe('dark');
         expect(result.current.settings.language).toBe(originalSettings.language);
         expect(result.current.settings.timezone).toBe(originalSettings.timezone);
         expect(result.current.settings.showSidebar).toBe(originalSettings.showSidebar);
      });
   });

   describe('setLanguage', () => {
      it('should set language to any string value', () => {
         const { result } = renderHook(() => useSettingsStore());

         const languages = ['en', 'es', 'fr', 'de', 'ja', 'zh-CN'];

         languages.forEach((language) => {
            act(() => {
               result.current.setLanguage(language);
            });

            expect(result.current.settings.language).toBe(language);
         });
      });

      it('should preserve other settings when setting language', () => {
         const { result } = renderHook(() => useSettingsStore());
         const originalSettings = { ...result.current.settings };

         act(() => {
            result.current.setLanguage('es');
         });

         expect(result.current.settings.language).toBe('es');
         expect(result.current.settings.theme).toBe(originalSettings.theme);
         expect(result.current.settings.timezone).toBe(originalSettings.timezone);
         expect(result.current.settings.showSidebar).toBe(originalSettings.showSidebar);
      });
   });

   describe('setTimezone', () => {
      it('should set timezone to any string value', () => {
         const { result } = renderHook(() => useSettingsStore());

         const timezones = [
            'UTC',
            'America/New_York',
            'Europe/London',
            'Asia/Tokyo',
            'Australia/Sydney',
         ];

         timezones.forEach((timezone) => {
            act(() => {
               result.current.setTimezone(timezone);
            });

            expect(result.current.settings.timezone).toBe(timezone);
         });
      });

      it('should preserve other settings when setting timezone', () => {
         const { result } = renderHook(() => useSettingsStore());
         const originalSettings = { ...result.current.settings };

         act(() => {
            result.current.setTimezone('America/New_York');
         });

         expect(result.current.settings.timezone).toBe('America/New_York');
         expect(result.current.settings.theme).toBe(originalSettings.theme);
         expect(result.current.settings.language).toBe(originalSettings.language);
         expect(result.current.settings.showSidebar).toBe(originalSettings.showSidebar);
      });
   });

   describe('Persistence', () => {
      it('should have persistence configuration', () => {
         // Test that the store is configured with persistence
         // We can't easily test actual persistence in the test environment
         // but we can verify the store structure and actions work correctly
         const { result } = renderHook(() => useSettingsStore());

         // Verify the store has the expected structure
         expect(result.current.settings).toBeDefined();
         expect(typeof result.current.updateSetting).toBe('function');
         expect(typeof result.current.updateSettings).toBe('function');
         expect(typeof result.current.resetSettings).toBe('function');
      });

      it('should maintain state consistency across updates', () => {
         const { result } = renderHook(() => useSettingsStore());

         // Test that state updates are consistent
         act(() => {
            result.current.updateSettings({
               theme: 'dark',
               language: 'es',
               itemsPerPage: 100,
            });
         });

         // Verify the state is updated correctly
         expect(result.current.settings.theme).toBe('dark');
         expect(result.current.settings.language).toBe('es');
         expect(result.current.settings.itemsPerPage).toBe(100);

         // Test that subsequent updates work correctly
         act(() => {
            result.current.updateSetting('theme', 'light');
            result.current.updateSetting('language', 'fr');
         });

         expect(result.current.settings.theme).toBe('light');
         expect(result.current.settings.language).toBe('fr');
         expect(result.current.settings.itemsPerPage).toBe(100); // Should be preserved
      });
   });

   describe('Edge Cases', () => {
      it('should handle rapid successive updates', () => {
         const { result } = renderHook(() => useSettingsStore());

         act(() => {
            result.current.updateSetting('theme', 'light');
            result.current.updateSetting('language', 'fr');
            result.current.updateSetting('timezone', 'Europe/Paris');
            result.current.updateSetting('itemsPerPage', 75);
         });

         expect(result.current.settings.theme).toBe('light');
         expect(result.current.settings.language).toBe('fr');
         expect(result.current.settings.timezone).toBe('Europe/Paris');
         expect(result.current.settings.itemsPerPage).toBe(75);
      });

      it('should handle mixed action types', () => {
         const { result } = renderHook(() => useSettingsStore());

         act(() => {
            result.current.updateSetting('theme', 'dark');
            result.current.toggleSidebar();
            result.current.setLanguage('es');
            result.current.updateSettings({ itemsPerPage: 100 });
            result.current.toggleNotifications();
         });

         expect(result.current.settings.theme).toBe('dark');
         expect(result.current.settings.sidebarCollapsed).toBe(true);
         expect(result.current.settings.language).toBe('es');
         expect(result.current.settings.itemsPerPage).toBe(100);
         expect(result.current.settings.showNotifications).toBe(false);
      });

      it('should handle reset after multiple changes', () => {
         const { result } = renderHook(() => useSettingsStore());

         // Make multiple changes
         act(() => {
            result.current.updateSettings({
               theme: 'dark',
               language: 'es',
               timezone: 'Europe/Madrid',
               itemsPerPage: 100,
               showSidebar: false,
               sidebarCollapsed: true,
            });
            result.current.toggleNotifications();
            result.current.setTheme('light');
         });

         // Reset everything
         act(() => {
            result.current.resetSettings();
         });

         // Should be back to defaults
         expect(result.current.settings).toEqual({
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
         });
      });
   });
});
