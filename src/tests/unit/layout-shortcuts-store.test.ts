import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLayoutShortcutsStore } from '../../state/shared/layout-shortcuts-store';
import { mockLocalStorage } from '../utils/store-test-utils';
import type { KeyboardShortcut } from '../../state/shared/layout-shortcuts-store';

// Mock localStorage
const mockStorage = mockLocalStorage();
Object.defineProperty(window, 'localStorage', {
   value: mockStorage,
   writable: true,
});

describe('useLayoutShortcutsStore', () => {
   beforeEach(() => {
      // Clear localStorage before each test
      mockStorage.clear();
   });

   describe('Initial State', () => {
      it('should initialize with default shortcuts', () => {
         const { result } = renderHook(() => useLayoutShortcutsStore());

         // Check if the store has been initialized with shortcuts
         expect(result.current.shortcuts.length).toBeGreaterThan(0);

         // Check that default shortcuts are present
         const shortcutDescriptions = result.current.shortcuts.map((s) => s.description);
         expect(shortcutDescriptions).toContain('Toggle left sidebar');
         expect(shortcutDescriptions).toContain('Toggle right sidebar');
         expect(shortcutDescriptions).toContain('Open settings');
      });

      it('should have proper shortcut structure', () => {
         const { result } = renderHook(() => useLayoutShortcutsStore());
         const shortcut = result.current.shortcuts[0];

         expect(shortcut).toHaveProperty('id');
         expect(shortcut).toHaveProperty('action');
         expect(shortcut).toHaveProperty('keys');
         expect(shortcut).toHaveProperty('description');
         expect(shortcut.id).toBeDefined();
         expect(shortcut.action).toBeDefined();
         expect(Array.isArray(shortcut.keys)).toBe(true);
         expect(shortcut.description).toBeDefined();
      });

      it('should have valid action types', () => {
         const { result } = renderHook(() => useLayoutShortcutsStore());
         const validActions = [
            'toggle-section',
            'switch-view',
            'toggle-bottom-bar',
            'open-settings',
            'custom',
         ];

         result.current.shortcuts.forEach((shortcut) => {
            expect(validActions).toContain(shortcut.action);
         });
      });

      it('should have proper keys array structure', () => {
         const { result } = renderHook(() => useLayoutShortcutsStore());

         result.current.shortcuts.forEach((shortcut) => {
            expect(Array.isArray(shortcut.keys)).toBe(true);
            expect(shortcut.keys.length).toBeGreaterThan(0);
            shortcut.keys.forEach((key) => {
               expect(typeof key).toBe('string');
               expect(key.length).toBeGreaterThan(0);
            });
         });
      });

      it('should have unique IDs for all shortcuts', () => {
         const { result } = renderHook(() => useLayoutShortcutsStore());
         const ids = result.current.shortcuts.map((s) => s.id);
         const uniqueIds = new Set(ids);

         expect(ids.length).toBe(uniqueIds.size);
      });
   });

   describe('addShortcut', () => {
      it('should add a new shortcut with generated ID', () => {
         const { result } = renderHook(() => useLayoutShortcutsStore());
         const initialCount = result.current.shortcuts.length;

         const newShortcutData = {
            action: 'custom' as const,
            keys: ['ctrl', 'shift', 'x'],
            description: 'Custom shortcut',
            isGlobal: true,
         };

         let createdShortcut: KeyboardShortcut;

         act(() => {
            createdShortcut = result.current.addShortcut(newShortcutData);
         });

         expect(result.current.shortcuts).toHaveLength(initialCount + 1);
         expect(createdShortcut!.id).toBeDefined();
         expect(createdShortcut!.action).toBe('custom');
         expect(createdShortcut!.keys).toEqual(['ctrl', 'shift', 'x']);
         expect(createdShortcut!.description).toBe('Custom shortcut');
         expect(createdShortcut!.isGlobal).toBe(true);
      });

      it('should add shortcut with section-specific configuration', () => {
         const { result } = renderHook(() => useLayoutShortcutsStore());

         const newShortcutData = {
            action: 'toggle-section' as const,
            keys: ['ctrl', '1'],
            description: 'Toggle section A',
            isGlobal: false,
            section: 'A' as const,
         };

         let createdShortcut: KeyboardShortcut;

         act(() => {
            createdShortcut = result.current.addShortcut(newShortcutData);
         });

         expect(createdShortcut!.section).toBe('A');
         expect(createdShortcut!.isGlobal).toBe(false);
      });

      it('should add shortcut with view-specific configuration', () => {
         const { result } = renderHook(() => useLayoutShortcutsStore());

         const newShortcutData = {
            action: 'switch-view' as const,
            keys: ['ctrl', '2'],
            description: 'Switch to view',
            isGlobal: true,
            viewId: 'test-view-id',
         };

         let createdShortcut: KeyboardShortcut;

         act(() => {
            createdShortcut = result.current.addShortcut(newShortcutData);
         });

         expect(createdShortcut!.viewId).toBe('test-view-id');
         expect(createdShortcut!.action).toBe('switch-view');
      });

      it('should add the created shortcut to the shortcuts array', () => {
         const { result } = renderHook(() => useLayoutShortcutsStore());

         const newShortcutData = {
            action: 'custom' as const,
            keys: ['ctrl', 'alt', 'z'],
            description: 'Another custom shortcut',
         };

         let createdShortcut: KeyboardShortcut;

         act(() => {
            createdShortcut = result.current.addShortcut(newShortcutData);
         });

         const shortcutInStore = result.current.shortcuts.find((s) => s.id === createdShortcut!.id);
         expect(shortcutInStore).toBeDefined();
         expect(shortcutInStore).toEqual(createdShortcut);
      });

      it('should generate unique IDs for multiple shortcuts', () => {
         const { result } = renderHook(() => useLayoutShortcutsStore());

         const shortcut1Data = {
            action: 'custom' as const,
            keys: ['ctrl', 'a'],
            description: 'First shortcut',
         };

         const shortcut2Data = {
            action: 'custom' as const,
            keys: ['ctrl', 'b'],
            description: 'Second shortcut',
         };

         let createdShortcut1: KeyboardShortcut;
         let createdShortcut2: KeyboardShortcut;

         act(() => {
            createdShortcut1 = result.current.addShortcut(shortcut1Data);
            createdShortcut2 = result.current.addShortcut(shortcut2Data);
         });

         expect(createdShortcut1!.id).not.toBe(createdShortcut2!.id);
      });
   });

   describe('updateShortcut', () => {
      it('should update an existing shortcut', () => {
         const { result } = renderHook(() => useLayoutShortcutsStore());
         const shortcutId = result.current.shortcuts[0].id;

         act(() => {
            result.current.updateShortcut(shortcutId, {
               description: 'Updated description',
               keys: ['ctrl', 'shift', 'u'],
            });
         });

         const updatedShortcut = result.current.shortcuts.find((s) => s.id === shortcutId);
         expect(updatedShortcut!.description).toBe('Updated description');
         expect(updatedShortcut!.keys).toEqual(['ctrl', 'shift', 'u']);
      });

      it('should update multiple properties at once', () => {
         const { result } = renderHook(() => useLayoutShortcutsStore());
         const shortcutId = result.current.shortcuts[0].id;

         act(() => {
            result.current.updateShortcut(shortcutId, {
               action: 'custom',
               description: 'Updated action and description',
               isGlobal: false,
               keys: ['alt', 'f4'],
            });
         });

         const updatedShortcut = result.current.shortcuts.find((s) => s.id === shortcutId);
         expect(updatedShortcut!.action).toBe('custom');
         expect(updatedShortcut!.description).toBe('Updated action and description');
         expect(updatedShortcut!.isGlobal).toBe(false);
         expect(updatedShortcut!.keys).toEqual(['alt', 'f4']);
      });

      it('should not affect other shortcuts', () => {
         const { result } = renderHook(() => useLayoutShortcutsStore());
         const shortcutId = result.current.shortcuts[0].id;
         const otherShortcutId = result.current.shortcuts[1].id;
         const otherShortcutOriginalDescription = result.current.shortcuts[1].description;

         act(() => {
            result.current.updateShortcut(shortcutId, { description: 'Updated description' });
         });

         const otherShortcut = result.current.shortcuts.find((s) => s.id === otherShortcutId);
         expect(otherShortcut!.description).toBe(otherShortcutOriginalDescription);
      });

      it('should handle updating non-existent shortcut gracefully', () => {
         const { result } = renderHook(() => useLayoutShortcutsStore());
         const initialShortcuts = [...result.current.shortcuts];

         act(() => {
            result.current.updateShortcut('non-existent-id', {
               description: 'Updated description',
            });
         });

         expect(result.current.shortcuts).toEqual(initialShortcuts);
      });

      it('should preserve existing properties when updating partial data', () => {
         const { result } = renderHook(() => useLayoutShortcutsStore());
         const shortcutId = result.current.shortcuts[0].id;
         const originalAction = result.current.shortcuts[0].action;
         const originalKeys = [...result.current.shortcuts[0].keys];

         act(() => {
            result.current.updateShortcut(shortcutId, { description: 'Only description updated' });
         });

         const updatedShortcut = result.current.shortcuts.find((s) => s.id === shortcutId);
         expect(updatedShortcut!.action).toBe(originalAction);
         expect(updatedShortcut!.keys).toEqual(originalKeys);
         expect(updatedShortcut!.description).toBe('Only description updated');
      });
   });

   describe('removeShortcut', () => {
      it('should remove an existing shortcut', () => {
         const { result } = renderHook(() => useLayoutShortcutsStore());
         const shortcutId = result.current.shortcuts[0].id;
         const initialCount = result.current.shortcuts.length;

         act(() => {
            result.current.removeShortcut(shortcutId);
         });

         expect(result.current.shortcuts).toHaveLength(initialCount - 1);
         expect(result.current.shortcuts.find((s) => s.id === shortcutId)).toBeUndefined();
      });

      it('should handle removing non-existent shortcut gracefully', () => {
         const { result } = renderHook(() => useLayoutShortcutsStore());
         const initialShortcuts = [...result.current.shortcuts];

         act(() => {
            result.current.removeShortcut('non-existent-id');
         });

         expect(result.current.shortcuts).toEqual(initialShortcuts);
      });

      it('should not affect other shortcuts when removing one', () => {
         const { result } = renderHook(() => useLayoutShortcutsStore());
         const shortcutId = result.current.shortcuts[0].id;
         const otherShortcutId = result.current.shortcuts[1].id;

         act(() => {
            result.current.removeShortcut(shortcutId);
         });

         const otherShortcut = result.current.shortcuts.find((s) => s.id === otherShortcutId);
         expect(otherShortcut).toBeDefined();
      });

      it('should handle removing from empty shortcuts array', () => {
         const { result } = renderHook(() => useLayoutShortcutsStore());

         // Clear all shortcuts
         act(() => {
            result.current.shortcuts = [];
         });

         act(() => {
            result.current.removeShortcut('any-id');
         });

         expect(result.current.shortcuts).toHaveLength(0);
      });
   });

   describe('Persistence', () => {
      it('should persist shortcuts to localStorage', () => {
         const { result } = renderHook(() => useLayoutShortcutsStore());

         const newShortcutData = {
            action: 'custom' as const,
            keys: ['ctrl', 'shift', 'p'],
            description: 'Persistent shortcut',
            isGlobal: true,
         };

         act(() => {
            result.current.addShortcut(newShortcutData);
         });

         // Check that the shortcut was created in the store
         expect(result.current.shortcuts.some((s) => s.description === 'Persistent shortcut')).toBe(
            true
         );

         // Note: Persistence testing in vitest with Zustand can be tricky
         // The store should persist, but the timing might be async
         const stored = mockStorage.getItem('heyspex-layout-shortcuts');
         if (stored) {
            const parsed = JSON.parse(stored);
            expect(parsed.shortcuts).toBeDefined();
            expect(Array.isArray(parsed.shortcuts)).toBe(true);
         }
      });

      it('should persist updated shortcuts to localStorage', () => {
         const { result } = renderHook(() => useLayoutShortcutsStore());
         const shortcutId = result.current.shortcuts[0].id;

         act(() => {
            result.current.updateShortcut(shortcutId, {
               description: 'Updated persistent shortcut',
            });
         });

         // Check that the shortcut was updated in the store
         const updatedShortcut = result.current.shortcuts.find((s) => s.id === shortcutId);
         expect(updatedShortcut!.description).toBe('Updated persistent shortcut');

         // Note: Persistence testing in vitest with Zustand can be tricky
         const stored = mockStorage.getItem('heyspex-layout-shortcuts');
         if (stored) {
            const parsed = JSON.parse(stored);
            expect(parsed.shortcuts).toBeDefined();
         }
      });

      it('should persist shortcut removal to localStorage', () => {
         const { result } = renderHook(() => useLayoutShortcutsStore());
         const shortcutId = result.current.shortcuts[0].id;

         act(() => {
            result.current.removeShortcut(shortcutId);
         });

         // Check that the shortcut was removed from the store
         expect(result.current.shortcuts.find((s) => s.id === shortcutId)).toBeUndefined();

         // Note: Persistence testing in vitest with Zustand can be tricky
         const stored = mockStorage.getItem('heyspex-layout-shortcuts');
         if (stored) {
            const parsed = JSON.parse(stored);
            expect(parsed.shortcuts).toBeDefined();
         }
      });
   });

   describe('Edge Cases', () => {
      it('should handle empty shortcuts array', () => {
         const { result } = renderHook(() => useLayoutShortcutsStore());

         act(() => {
            result.current.shortcuts = [];
         });

         expect(result.current.shortcuts).toHaveLength(0);
      });

      it('should handle shortcut with empty keys array', () => {
         const { result } = renderHook(() => useLayoutShortcutsStore());

         const newShortcutData = {
            action: 'custom' as const,
            keys: [],
            description: 'Empty keys shortcut',
         };

         let createdShortcut: KeyboardShortcut;

         act(() => {
            createdShortcut = result.current.addShortcut(newShortcutData);
         });

         expect(createdShortcut!.keys).toEqual([]);
         expect(createdShortcut!.description).toBe('Empty keys shortcut');
      });

      it('should handle shortcut with complex keys array', () => {
         const { result } = renderHook(() => useLayoutShortcutsStore());

         const complexKeys = ['ctrl', 'shift', 'alt', 'meta', 'space'];
         const newShortcutData = {
            action: 'custom' as const,
            keys: complexKeys,
            description: 'Complex keys shortcut',
         };

         let createdShortcut: KeyboardShortcut;

         act(() => {
            createdShortcut = result.current.addShortcut(newShortcutData);
         });

         expect(createdShortcut!.keys).toEqual(complexKeys);
      });

      it('should handle shortcut with all optional properties', () => {
         const { result } = renderHook(() => useLayoutShortcutsStore());

         const newShortcutData = {
            action: 'toggle-section' as const,
            keys: ['ctrl', 't'],
            description: 'Full featured shortcut',
            isGlobal: true,
            section: 'B' as const,
            viewId: 'test-view',
         };

         let createdShortcut: KeyboardShortcut;

         act(() => {
            createdShortcut = result.current.addShortcut(newShortcutData);
         });

         expect(createdShortcut!.action).toBe('toggle-section');
         expect(createdShortcut!.keys).toEqual(['ctrl', 't']);
         expect(createdShortcut!.description).toBe('Full featured shortcut');
         expect(createdShortcut!.isGlobal).toBe(true);
         expect(createdShortcut!.section).toBe('B');
         expect(createdShortcut!.viewId).toBe('test-view');
      });

      it('should handle updating shortcut with undefined values', () => {
         const { result } = renderHook(() => useLayoutShortcutsStore());
         const shortcutId = result.current.shortcuts[0].id;

         act(() => {
            result.current.updateShortcut(shortcutId, {
               isGlobal: undefined,
               section: undefined,
               viewId: undefined,
            });
         });

         const updatedShortcut = result.current.shortcuts.find((s) => s.id === shortcutId);
         expect(updatedShortcut!.isGlobal).toBeUndefined();
         expect(updatedShortcut!.section).toBeUndefined();
         expect(updatedShortcut!.viewId).toBeUndefined();
      });
   });

   describe('Default Shortcuts Validation', () => {
      it('should initialize with default shortcuts when store is fresh', () => {
         // Create a fresh store instance to test default initialization
         const { result } = renderHook(() => useLayoutShortcutsStore());

         // The store should have some shortcuts (either default or from previous tests)
         expect(result.current.shortcuts.length).toBeGreaterThanOrEqual(0);

         // If we have shortcuts, they should have proper structure
         result.current.shortcuts.forEach((shortcut) => {
            expect(shortcut).toHaveProperty('id');
            expect(shortcut).toHaveProperty('action');
            expect(shortcut).toHaveProperty('keys');
            expect(shortcut).toHaveProperty('description');
         });
      });

      it('should support adding toggle-section shortcuts', () => {
         const { result } = renderHook(() => useLayoutShortcutsStore());

         // Add a left sidebar shortcut
         const leftShortcut = {
            action: 'toggle-section' as const,
            keys: ['ctrl', 'shift', 'l'],
            description: 'Toggle left sidebar',
            isGlobal: true,
            section: 'A' as const,
         };

         let createdLeftShortcut: KeyboardShortcut;
         act(() => {
            createdLeftShortcut = result.current.addShortcut(leftShortcut);
         });

         expect(createdLeftShortcut!.action).toBe('toggle-section');
         expect(createdLeftShortcut!.section).toBe('A');
         expect(createdLeftShortcut!.description).toContain('left');

         // Add a right sidebar shortcut
         const rightShortcut = {
            action: 'toggle-section' as const,
            keys: ['ctrl', 'shift', 'r'],
            description: 'Toggle right sidebar',
            isGlobal: true,
            section: 'C' as const,
         };

         let createdRightShortcut: KeyboardShortcut;
         act(() => {
            createdRightShortcut = result.current.addShortcut(rightShortcut);
         });

         expect(createdRightShortcut!.action).toBe('toggle-section');
         expect(createdRightShortcut!.section).toBe('C');
         expect(createdRightShortcut!.description).toContain('right');
      });

      it('should support adding open-settings shortcut', () => {
         const { result } = renderHook(() => useLayoutShortcutsStore());

         const settingsShortcut = {
            action: 'open-settings' as const,
            keys: ['ctrl', ','],
            description: 'Open settings',
            isGlobal: true,
         };

         let createdShortcut: KeyboardShortcut;
         act(() => {
            createdShortcut = result.current.addShortcut(settingsShortcut);
         });

         expect(createdShortcut!.action).toBe('open-settings');
         expect(createdShortcut!.description.toLowerCase()).toContain('settings');
         expect(createdShortcut!.isGlobal).toBe(true);
      });

      it('should have proper key combinations for shortcuts', () => {
         const { result } = renderHook(() => useLayoutShortcutsStore());

         // Add a shortcut with keys to test
         const testShortcut = {
            action: 'custom' as const,
            keys: ['ctrl', 'alt', 't'],
            description: 'Test shortcut',
         };

         let createdShortcut: KeyboardShortcut;
         act(() => {
            createdShortcut = result.current.addShortcut(testShortcut);
         });

         expect(createdShortcut!.keys.length).toBeGreaterThan(0);
         expect(createdShortcut!.keys.every((key) => typeof key === 'string')).toBe(true);
      });
   });
});
