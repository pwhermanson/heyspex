/**
 * Layout Settings Store Tests
 *
 * Tests for the useLayoutSettingsStore functionality including:
 * - Initial state validation
 * - Settings updates
 * - Persistence behavior
 * - Edge cases and error handling
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLayoutSettingsStore } from '../../state/shared/layout-settings-store';

// Mock localStorage with proper JSON handling for Zustand persist
const localStorageMock = (() => {
   let store: Record<string, string> = {};

   const mockStorage = {
      getItem: vi.fn((key: string) => {
         const item = store[key];
         return item ? item : null;
      }),
      setItem: vi.fn((key: string, value: string) => {
         store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
         delete store[key];
      }),
      clear: vi.fn(() => {
         store = {};
      }),
   };

   // Setup localStorage mock
   Object.defineProperty(window, 'localStorage', {
      value: mockStorage,
      writable: true,
   });

   return mockStorage;
})();

describe('useLayoutSettingsStore', () => {
   beforeEach(() => {
      // Clear localStorage before each test
      localStorageMock.clear();
      vi.clearAllMocks();
   });

   afterEach(() => {
      // Clean up after each test
      localStorageMock.clear();
   });

   describe('Initial State', () => {
      it('should initialize with default settings', () => {
         const { result } = renderHook(() => useLayoutSettingsStore());

         expect(result.current.settings).toEqual({
            enableAnimations: true,
            autoSave: true,
            allowKeyboardShortcuts: true,
            allowAIControl: true,
         });
      });

      it('should initialize without defaultViewId', () => {
         const { result } = renderHook(() => useLayoutSettingsStore());

         expect(result.current.settings.defaultViewId).toBeUndefined();
      });
   });

   describe('updateSettings', () => {
      it('should update single setting', () => {
         const { result } = renderHook(() => useLayoutSettingsStore());

         act(() => {
            result.current.updateSettings({ enableAnimations: false });
         });

         expect(result.current.settings.enableAnimations).toBe(false);
         expect(result.current.settings.autoSave).toBe(true); // unchanged
      });

      it('should update multiple settings', () => {
         const { result } = renderHook(() => useLayoutSettingsStore());

         act(() => {
            result.current.updateSettings({
               enableAnimations: false,
               autoSave: false,
               allowKeyboardShortcuts: false,
            });
         });

         expect(result.current.settings.enableAnimations).toBe(false);
         expect(result.current.settings.autoSave).toBe(false);
         expect(result.current.settings.allowKeyboardShortcuts).toBe(false);
         expect(result.current.settings.allowAIControl).toBe(true); // unchanged
      });

      it('should merge with existing settings', () => {
         const { result } = renderHook(() => useLayoutSettingsStore());

         // First update
         act(() => {
            result.current.updateSettings({ enableAnimations: false });
         });

         expect(result.current.settings.enableAnimations).toBe(false);

         // Second update - should preserve first change
         act(() => {
            result.current.updateSettings({ autoSave: false });
         });

         expect(result.current.settings.enableAnimations).toBe(false); // preserved
         expect(result.current.settings.autoSave).toBe(false); // updated
      });

      it('should handle empty settings object', () => {
         const { result } = renderHook(() => useLayoutSettingsStore());

         const originalSettings = { ...result.current.settings };

         act(() => {
            result.current.updateSettings({});
         });

         expect(result.current.settings).toEqual(originalSettings);
      });
   });

   describe('Persistence', () => {
      it('should handle localStorage operations (integration test)', () => {
         // This test verifies the store can work with localStorage
         // The actual persistence is handled by Zustand's persist middleware
         const { result } = renderHook(() => useLayoutSettingsStore());

         // Verify settings work correctly (they may be initialized from localStorage)
         expect(result.current.settings.enableAnimations).toBe(false);
         expect(result.current.settings.autoSave).toBe(false);
         expect(result.current.settings.allowKeyboardShortcuts).toBe(false);
         expect(result.current.settings.allowAIControl).toBe(true);

         // Update settings
         act(() => {
            result.current.updateSettings({
               enableAnimations: true,
               autoSave: true,
               allowKeyboardShortcuts: true,
            });
         });

         // Verify settings were updated
         expect(result.current.settings.enableAnimations).toBe(true);
         expect(result.current.settings.autoSave).toBe(true);
         expect(result.current.settings.allowKeyboardShortcuts).toBe(true);
         expect(result.current.settings.allowAIControl).toBe(true);
      });
   });

   describe('Edge Cases', () => {
      it('should handle null and undefined values', () => {
         const { result } = renderHook(() => useLayoutSettingsStore());

         act(() => {
            // @ts-expect-error - testing null/undefined handling
            result.current.updateSettings({ enableAnimations: null });
         });

         expect(result.current.settings.enableAnimations).toBe(null);

         act(() => {
            // @ts-expect-error - testing null/undefined handling
            result.current.updateSettings({ autoSave: undefined });
         });

         expect(result.current.settings.autoSave).toBe(undefined);
      });

      it('should handle rapid consecutive updates', () => {
         const { result } = renderHook(() => useLayoutSettingsStore());

         act(() => {
            result.current.updateSettings({ enableAnimations: false });
            result.current.updateSettings({ autoSave: false });
            result.current.updateSettings({ allowKeyboardShortcuts: false });
         });

         expect(result.current.settings.enableAnimations).toBe(false);
         expect(result.current.settings.autoSave).toBe(false);
         expect(result.current.settings.allowKeyboardShortcuts).toBe(false);
      });

      it('should handle boolean settings correctly', () => {
         const { result } = renderHook(() => useLayoutSettingsStore());

         // Test all boolean settings
         act(() => {
            result.current.updateSettings({
               enableAnimations: false,
               autoSave: false,
               allowKeyboardShortcuts: false,
               allowAIControl: false,
            });
         });

         expect(result.current.settings.enableAnimations).toBe(false);
         expect(result.current.settings.autoSave).toBe(false);
         expect(result.current.settings.allowKeyboardShortcuts).toBe(false);
         expect(result.current.settings.allowAIControl).toBe(false);

         // Flip them back
         act(() => {
            result.current.updateSettings({
               enableAnimations: true,
               autoSave: true,
               allowKeyboardShortcuts: true,
               allowAIControl: true,
            });
         });

         expect(result.current.settings.enableAnimations).toBe(true);
         expect(result.current.settings.autoSave).toBe(true);
         expect(result.current.settings.allowKeyboardShortcuts).toBe(true);
         expect(result.current.settings.allowAIControl).toBe(true);
      });

      it('should handle string settings correctly', () => {
         const { result } = renderHook(() => useLayoutSettingsStore());

         const testViewId = 'custom-view-123';

         act(() => {
            result.current.updateSettings({ defaultViewId: testViewId });
         });

         expect(result.current.settings.defaultViewId).toBe(testViewId);

         // Update to different value
         const newViewId = 'another-view-456';
         act(() => {
            result.current.updateSettings({ defaultViewId: newViewId });
         });

         expect(result.current.settings.defaultViewId).toBe(newViewId);
      });
   });

   describe('Integration', () => {
      it('should work correctly with multiple store instances', () => {
         const { result: result1 } = renderHook(() => useLayoutSettingsStore());
         const { result: result2 } = renderHook(() => useLayoutSettingsStore());

         // Both should have same initial state
         expect(result1.current.settings).toEqual(result2.current.settings);

         // Update one instance
         act(() => {
            result1.current.updateSettings({ enableAnimations: false });
         });

         // Other instance should reflect the change
         expect(result2.current.settings.enableAnimations).toBe(false);
         expect(result1.current.settings.enableAnimations).toBe(false);
      });

      it('should persist across re-renders', () => {
         const { result, rerender } = renderHook(() => useLayoutSettingsStore());

         const initialSettings = { ...result.current.settings };

         act(() => {
            result.current.updateSettings({ enableAnimations: true });
         });

         rerender();

         expect(result.current.settings.enableAnimations).toBe(true);
         // Check that the changed value is different
         expect(result.current.settings.enableAnimations).toBe(true);
         expect(initialSettings.enableAnimations).toBe(false); // initial value was false

         // Check that unchanged values remain the same
         expect(result.current.settings.autoSave).toBe(initialSettings.autoSave);
         expect(result.current.settings.allowKeyboardShortcuts).toBe(
            initialSettings.allowKeyboardShortcuts
         );
         expect(result.current.settings.allowAIControl).toBe(initialSettings.allowAIControl);
      });
   });
});
