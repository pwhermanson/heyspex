import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from './test-utils';
import { vi } from 'vitest';

// Common selector test patterns
export const selectorTestUtils = {
   // Test basic rendering with different props
   testRendering: <T extends Record<string, unknown>>(
      Component: React.ComponentType<T>,
      defaultProps: T,
      testCases: Array<{ name: string; props: Partial<T>; expectedText: string }>
   ) => {
      testCases.forEach(({ name, props, expectedText }) => {
         it(name, () => {
            render(<Component {...defaultProps} {...props} />);
            const trigger = screen.getByRole('combobox');
            expect(trigger).toHaveTextContent(expectedText);
         });
      });
   },

   // Test trigger variants (button, icon, ghost)
   testTriggerVariants: <T extends Record<string, unknown>>(
      Component: React.ComponentType<T>,
      defaultProps: T,
      variants: Array<{ variant: string; expectedClass: string }>
   ) => {
      variants.forEach(({ variant, expectedClass }) => {
         it(`renders ${variant} variant`, () => {
            render(<Component {...defaultProps} triggerVariant={variant} />);
            const trigger = screen.getByRole('combobox');
            expect(trigger).toHaveClass(expectedClass);
         });
      });
   },

   // Test trigger sizes
   testTriggerSizes: <T extends Record<string, unknown>>(
      Component: React.ComponentType<T>,
      defaultProps: T,
      sizes: Array<{ size: string; expectedClass: string }>
   ) => {
      sizes.forEach(({ size, expectedClass }) => {
         it(`renders ${size} size`, () => {
            render(<Component {...defaultProps} triggerSize={size} />);
            const trigger = screen.getByRole('combobox');
            expect(trigger).toHaveClass(expectedClass);
         });
      });
   },

   // Test dropdown interactions
   testDropdownInteractions: async <T extends Record<string, unknown>>(
      Component: React.ComponentType<T>,
      defaultProps: T,
      options: string[]
   ) => {
      const user = userEvent.setup();
      render(<Component {...defaultProps} />);

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
         expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      // Check that all options are rendered in the dropdown (not in trigger)
      const listbox = screen.getByRole('listbox');
      options.forEach((option) => {
         expect(listbox).toHaveTextContent(option);
      });

      return { user, trigger };
   },

   // Test selection behavior
   testSelectionBehavior: async <T extends Record<string, unknown>>(
      Component: React.ComponentType<T>,
      defaultProps: T,
      options: Array<{ text: string; value: unknown }>
   ) => {
      const user = userEvent.setup();
      const onSelectionChange = vi.fn();

      render(<Component {...defaultProps} onSelectionChange={onSelectionChange} />);

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
         expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      // Test each option
      for (const option of options) {
         const listbox = screen.getByRole('listbox');
         // Look for CommandItem with matching data-value or text content
         const optionElement =
            listbox.querySelector(`[data-value="${option.text}"]`) ||
            Array.from(listbox.querySelectorAll('[role="option"]')).find(
               (el) => el.textContent === option.text && el !== trigger
            );

         if (optionElement) {
            await user.click(optionElement as HTMLElement);
            expect(onSelectionChange).toHaveBeenCalledWith(option.value);
         }

         // Reopen dropdown for next test
         await user.click(trigger);
         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });
      }

      return { user, onSelectionChange };
   },

   // Test search functionality
   testSearchFunctionality: async <T extends Record<string, unknown>>(
      Component: React.ComponentType<T>,
      defaultProps: T,
      searchConfig: {
         placeholder: string;
         searchable: boolean;
         searchQuery: string;
         expectedResults: string[];
         expectedEmptyMessage: string;
      }
   ) => {
      const user = userEvent.setup();
      render(<Component {...defaultProps} searchable={searchConfig.searchable} />);

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
         expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      if (searchConfig.searchable) {
         const searchInput = screen.getByPlaceholderText(searchConfig.placeholder);
         expect(searchInput).toBeInTheDocument();

         await user.type(searchInput, searchConfig.searchQuery);

         if (searchConfig.expectedResults.length > 0) {
            searchConfig.expectedResults.forEach((result) => {
               expect(screen.getByText(result)).toBeInTheDocument();
            });
         } else {
            expect(screen.getByText(searchConfig.expectedEmptyMessage)).toBeInTheDocument();
         }
      } else {
         const searchInput = screen.queryByPlaceholderText(searchConfig.placeholder);
         expect(searchInput).not.toBeInTheDocument();
      }

      return { user };
   },

   // Test count display
   testCountDisplay: async <T extends Record<string, unknown>>(
      Component: React.ComponentType<T>,
      defaultProps: T,
      showCounts: boolean,
      expectedCounts: string[]
   ) => {
      const user = userEvent.setup();
      render(<Component {...defaultProps} showCounts={showCounts} />);

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
         expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      if (showCounts) {
         // Use getAllByText to handle multiple elements with same text
         const countElements = screen.getAllByText(/\d+/);
         expect(countElements.length).toBeGreaterThan(0);
      } else {
         const countElements = screen.queryAllByText(/\d+/);
         expect(countElements).toHaveLength(0);
      }

      return { user };
   },

   // Test icon display
   testIconDisplay: async <T extends Record<string, unknown>>(
      Component: React.ComponentType<T>,
      defaultProps: T,
      expectedIconCount: number
   ) => {
      const user = userEvent.setup();
      render(<Component {...defaultProps} />);

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
         expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      const icons = screen.getAllByRole('img');
      expect(icons).toHaveLength(expectedIconCount);

      return { user };
   },

   // Test accessibility
   testAccessibility: <T extends Record<string, unknown>>(
      Component: React.ComponentType<T>,
      defaultProps: T
   ) => {
      render(<Component {...defaultProps} />);

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');

      return { trigger };
   },

   // Test keyboard navigation
   testKeyboardNavigation: async <T extends Record<string, unknown>>(
      Component: React.ComponentType<T>,
      defaultProps: T,
      expectedSelection: unknown
   ) => {
      const user = userEvent.setup();
      const onSelectionChange = vi.fn();

      render(<Component {...defaultProps} onSelectionChange={onSelectionChange} />);

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
         expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      // Navigate with arrow keys
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      expect(onSelectionChange).toHaveBeenCalledWith(expectedSelection);

      return { user, onSelectionChange };
   },

   // Test edge cases
   testEdgeCases: <T extends Record<string, unknown>>(
      Component: React.ComponentType<T>,
      defaultProps: T,
      edgeCases: Array<{ name: string; props: Partial<T>; expectedText: string }>
   ) => {
      edgeCases.forEach(({ name, props, expectedText }) => {
         it(name, () => {
            render(<Component {...defaultProps} {...props} />);
            const trigger = screen.getByRole('combobox');
            expect(trigger).toHaveTextContent(expectedText);
         });
      });
   },

   // Test store integration
   testStoreIntegration: async <T extends Record<string, unknown>>(
      Component: React.ComponentType<T>,
      defaultProps: T,
      mockStore: Record<string, unknown>,
      expectedCalls: Array<{ method: string; args: unknown[] }>
   ) => {
      const user = userEvent.setup();
      render(<Component {...defaultProps} />);

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
         expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      // Verify store method calls
      expectedCalls.forEach(({ method, args }) => {
         expect(mockStore[method]).toHaveBeenCalledWith(...args);
      });

      return { user };
   },

   // Test error handling
   testErrorHandling: async <T extends Record<string, unknown>>(
      Component: React.ComponentType<T>,
      defaultProps: T,
      errorConfig: {
         mockError: () => void;
         shouldRender: boolean;
         expectedText: string;
      }
   ) => {
      const user = userEvent.setup();

      // Mock console.error to prevent error logs in test output
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      errorConfig.mockError();

      render(<Component {...defaultProps} />);

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
         expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      if (errorConfig.shouldRender) {
         expect(screen.getByText(errorConfig.expectedText)).toBeInTheDocument();
      }

      consoleSpy.mockRestore();
      return { user };
   },
};

// Common selector test configurations
export const selectorTestConfigs = {
   triggerVariants: [
      { variant: 'button', expectedClass: 'h-8' },
      { variant: 'icon', expectedClass: 'size-7' },
      { variant: 'ghost', expectedClass: 'h-8' },
   ],

   triggerSizes: [
      { size: 'sm', expectedClass: 'h-8' },
      { size: 'default', expectedClass: 'h-9' },
      { size: 'lg', expectedClass: 'h-10' },
      { size: 'icon', expectedClass: 'size-9' },
   ],

   accessibility: {
      ariaExpanded: 'false',
      ariaHaspopup: 'dialog',
   },
};

// Import the centralized mock store
export { createMockIssuesStore, createMockIssuesData } from './mock-issues-store';
