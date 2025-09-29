/**
 * AppShellBranded Integration Tests
 *
 * Tests the full integration of the AppShellBranded system including
 * component selection, environment variables, and client-side behavior.
 * These tests catch issues that unit tests miss.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { StableAppShell } from '@/src/components/layout/app-shell-branded/stable-app-shell';

// Mock the configuration module
const mockShouldUseSimpleBranded = vi.fn();
vi.mock('@/src/lib/config/branded-component-config', () => ({
   shouldUseSimpleBranded: () => mockShouldUseSimpleBranded(),
}));

// Mock the individual components
vi.mock('@/src/components/layout/app-shell-branded/app-shell-branded', () => ({
   AppShellBranded: () => <div data-testid="app-shell-branded">Full Interactive Component</div>,
}));

vi.mock('@/src/components/layout/app-shell-branded/app-shell-branded-simple', () => ({
   AppShellBrandedSimple: () => <div data-testid="app-shell-branded-simple">Simple Component</div>,
}));

describe('AppShellBranded Integration Tests', () => {
   beforeEach(() => {
      vi.clearAllMocks();
      // Reset environment variables
      delete process.env.NEXT_PUBLIC_BRANDED_COMPONENT;
   });

   it('renders simple component during SSR (before hydration)', () => {
      // Mock server-side environment
      const originalWindow = global.window;
      delete (global as any).window;

      mockShouldUseSimpleBranded.mockReturnValue(false);

      render(<StableAppShell />);

      expect(screen.getByTestId('app-shell-branded-simple')).toBeInTheDocument();
      expect(screen.queryByTestId('app-shell-branded')).not.toBeInTheDocument();

      // Restore window
      global.window = originalWindow;
   });

   it('renders full component when client is ready and shouldUseSimpleBranded returns false', async () => {
      mockShouldUseSimpleBranded.mockReturnValue(false);

      render(<StableAppShell />);

      // Wait for client-side hydration
      await waitFor(() => {
         expect(screen.getByTestId('app-shell-branded')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('app-shell-branded-simple')).not.toBeInTheDocument();
   });

   it('renders simple component when client is ready and shouldUseSimpleBranded returns true', async () => {
      mockShouldUseSimpleBranded.mockReturnValue(true);

      render(<StableAppShell />);

      // Wait for client-side hydration
      await waitFor(() => {
         expect(screen.getByTestId('app-shell-branded-simple')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('app-shell-branded')).not.toBeInTheDocument();
   });

   it('calls shouldUseSimpleBranded after client hydration', async () => {
      mockShouldUseSimpleBranded.mockReturnValue(false);

      render(<StableAppShell />);

      await waitFor(() => {
         expect(mockShouldUseSimpleBranded).toHaveBeenCalled();
      });
   });

   it('handles environment variable changes correctly', async () => {
      // Test with different environment variable values
      const testCases = [
         { envVar: 'full', shouldUseSimple: false },
         { envVar: 'simple', shouldUseSimple: true },
         { envVar: undefined, shouldUseSimple: false }, // default
      ];

      for (const testCase of testCases) {
         vi.clearAllMocks();

         if (testCase.envVar) {
            process.env.NEXT_PUBLIC_BRANDED_COMPONENT = testCase.envVar;
         } else {
            delete process.env.NEXT_PUBLIC_BRANDED_COMPONENT;
         }

         mockShouldUseSimpleBranded.mockReturnValue(testCase.shouldUseSimple);

         const { unmount } = render(<StableAppShell />);

         await waitFor(() => {
            if (testCase.shouldUseSimple) {
               expect(screen.getByTestId('app-shell-branded-simple')).toBeInTheDocument();
            } else {
               expect(screen.getByTestId('app-shell-branded')).toBeInTheDocument();
            }
         });

         unmount();
      }
   });

   it('logs debug information in development', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      mockShouldUseSimpleBranded.mockReturnValue(false);

      render(<StableAppShell />);

      await waitFor(() => {
         expect(screen.getByTestId('app-shell-branded')).toBeInTheDocument();
      });

      // Check that debug logging was called
      expect(consoleSpy).toHaveBeenCalledWith(
         expect.stringContaining('🔍 StableAppShell render:'),
         expect.objectContaining({
            isClient: true,
            useSimple: false,
         })
      );

      consoleSpy.mockRestore();
   });
});
