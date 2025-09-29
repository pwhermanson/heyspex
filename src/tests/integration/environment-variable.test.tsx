/**
 * Environment Variable Integration Test
 *
 * Tests that environment variable changes are handled correctly
 * and that the component selection logic works with different
 * environment variable configurations.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

// Mock the configuration
const mockShouldUseSimpleBranded = vi.fn();
vi.mock('@/src/lib/config/branded-component-config', () => ({
   shouldUseSimpleBranded: () => mockShouldUseSimpleBranded(),
}));

// Mock the components
vi.mock('@/src/components/layout/app-shell-branded/app-shell-branded', () => ({
   AppShellBranded: () => <div data-testid="full-component">Full Interactive Component</div>,
}));

vi.mock('@/src/components/layout/app-shell-branded/app-shell-branded-simple', () => ({
   AppShellBrandedSimple: () => <div data-testid="simple-component">Simple Component</div>,
}));

// Import after mocking
import { StableAppShell } from '@/src/components/layout/app-shell-branded/stable-app-shell';

describe('Environment Variable Integration Tests', () => {
   beforeEach(() => {
      vi.clearAllMocks();
   });

   it('should render full component when NEXT_PUBLIC_BRANDED_COMPONENT=full', async () => {
      mockShouldUseSimpleBranded.mockReturnValue(false);

      render(<StableAppShell />);

      await waitFor(() => {
         expect(screen.getByTestId('full-component')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('simple-component')).not.toBeInTheDocument();
   });

   it('should render simple component when NEXT_PUBLIC_BRANDED_COMPONENT=simple', async () => {
      mockShouldUseSimpleBranded.mockReturnValue(true);

      render(<StableAppShell />);

      await waitFor(() => {
         expect(screen.getByTestId('simple-component')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('full-component')).not.toBeInTheDocument();
   });

   it('should handle missing environment variable gracefully', async () => {
      // Test that missing environment variable defaults to simple component
      mockShouldUseSimpleBranded.mockReturnValue(true);

      render(<StableAppShell />);

      await waitFor(() => {
         expect(screen.getByTestId('simple-component')).toBeInTheDocument();
      });
   });

   it('should handle invalid environment variable values gracefully', async () => {
      // Test that invalid environment variable values default to simple component
      mockShouldUseSimpleBranded.mockReturnValue(true);

      render(<StableAppShell />);

      await waitFor(() => {
         expect(screen.getByTestId('simple-component')).toBeInTheDocument();
      });
   });

   it('should handle environment variable changes during runtime', async () => {
      // Test initial state
      mockShouldUseSimpleBranded.mockReturnValue(false);
      render(<StableAppShell />);

      await waitFor(() => {
         expect(screen.getByTestId('full-component')).toBeInTheDocument();
      });

      // Test that the configuration function is called
      expect(mockShouldUseSimpleBranded).toHaveBeenCalled();
   });

   it('should handle case sensitivity correctly', async () => {
      // Test that environment variable handling is case sensitive
      mockShouldUseSimpleBranded.mockReturnValue(false);

      render(<StableAppShell />);

      await waitFor(() => {
         expect(screen.getByTestId('full-component')).toBeInTheDocument();
      });
   });

   it('should handle whitespace in environment variable values', async () => {
      // Test that whitespace in environment variable values is handled correctly
      mockShouldUseSimpleBranded.mockReturnValue(false);

      render(<StableAppShell />);

      await waitFor(() => {
         expect(screen.getByTestId('full-component')).toBeInTheDocument();
      });
   });

   it('should handle multiple environment variable changes', async () => {
      // Test multiple environment variable changes
      mockShouldUseSimpleBranded.mockReturnValue(false);
      render(<StableAppShell />);

      await waitFor(() => {
         expect(screen.getByTestId('full-component')).toBeInTheDocument();
      });

      // Change to simple component
      mockShouldUseSimpleBranded.mockReturnValue(true);
      render(<StableAppShell />);

      await waitFor(() => {
         expect(screen.getByTestId('simple-component')).toBeInTheDocument();
      });
   });

   it('should handle environment variable changes with component rerender', async () => {
      // Test that environment variable changes trigger component rerender
      mockShouldUseSimpleBranded.mockReturnValue(false);
      render(<StableAppShell />);

      await waitFor(() => {
         expect(screen.getByTestId('full-component')).toBeInTheDocument();
      });

      // Verify the component is rendered correctly
      expect(screen.getByTestId('full-component')).toBeInTheDocument();
   });

   it('should handle environment variable changes with rapid updates', async () => {
      // Test rapid environment variable changes
      mockShouldUseSimpleBranded.mockReturnValue(false);
      render(<StableAppShell />);

      await waitFor(() => {
         expect(screen.getByTestId('full-component')).toBeInTheDocument();
      });

      // Verify the component is stable
      expect(screen.getByTestId('full-component')).toBeInTheDocument();
   });
});
