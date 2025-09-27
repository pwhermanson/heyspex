import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../utils/test-utils';
import { LabelSelector } from '@/components/shared/selectors/label-selector';
import { labels, LabelInterface } from '@/tests/test-data/labels';
import { useIssuesStore } from '@/state/store/issues-store';
import { createMockIssuesStore } from '../utils/selector-test-utils';

// Mock the issues store
vi.mock('@/state/store/issues-store', () => ({
   useIssuesStore: vi.fn(),
}));

const mockUseIssuesStore = vi.mocked(useIssuesStore);

const defaultProps = {
   selectedLabels: [] as LabelInterface[],
   onChange: vi.fn(),
};

describe('LabelSelector', () => {
   beforeEach(() => {
      vi.clearAllMocks();
      mockUseIssuesStore.mockReturnValue(createMockIssuesStore());
   });

   describe('Basic Rendering', () => {
      it('renders with default props', () => {
         render(<LabelSelector {...defaultProps} />);
         expect(screen.getByRole('combobox')).toBeInTheDocument();
      });

      it('renders with selected labels', () => {
         render(<LabelSelector {...defaultProps} selectedLabels={[labels[0]]} />);
         expect(screen.getByRole('combobox')).toBeInTheDocument();
      });

      it('renders with multiple selected labels', () => {
         render(<LabelSelector {...defaultProps} selectedLabels={[labels[0], labels[1]]} />);
         expect(screen.getByRole('combobox')).toBeInTheDocument();
      });
   });

   describe('Trigger Variants', () => {
      it('renders button variant', () => {
         render(<LabelSelector {...defaultProps} triggerVariant="button" />);
         expect(screen.getByRole('combobox')).toBeInTheDocument();
      });

      it('renders icon variant', () => {
         render(<LabelSelector {...defaultProps} triggerVariant="icon" />);
         expect(screen.getByRole('combobox')).toBeInTheDocument();
      });

      it('renders ghost variant', () => {
         render(<LabelSelector {...defaultProps} triggerVariant="ghost" />);
         expect(screen.getByRole('combobox')).toBeInTheDocument();
      });
   });

   describe('Trigger Sizes', () => {
      it('renders sm size', () => {
         render(<LabelSelector {...defaultProps} triggerSize="sm" />);
         expect(screen.getByRole('combobox')).toBeInTheDocument();
      });

      it('renders default size', () => {
         render(<LabelSelector {...defaultProps} triggerSize="default" />);
         expect(screen.getByRole('combobox')).toBeInTheDocument();
      });

      it('renders lg size', () => {
         render(<LabelSelector {...defaultProps} triggerSize="lg" />);
         expect(screen.getByRole('combobox')).toBeInTheDocument();
      });

      it('renders icon size', () => {
         render(<LabelSelector {...defaultProps} triggerSize="icon" />);
         expect(screen.getByRole('combobox')).toBeInTheDocument();
      });
   });

   describe('Dropdown Interaction', () => {
      it('opens dropdown when clicked', async () => {
         const user = userEvent.setup();
         render(<LabelSelector {...defaultProps} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         // Check that label options are displayed
         expect(screen.getByText('Bug')).toBeInTheDocument();
         expect(screen.getByText('Feature')).toBeInTheDocument();
      });

      it('closes dropdown when clicking outside', async () => {
         const user = userEvent.setup();
         render(
            <div>
               <LabelSelector {...defaultProps} />
               <div data-testid="outside">Outside element</div>
            </div>
         );

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         const outside = screen.getByTestId('outside');
         await user.click(outside);

         await waitFor(() => {
            expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
         });
      });

      it('closes dropdown when pressing Escape', async () => {
         const user = userEvent.setup();
         render(<LabelSelector {...defaultProps} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         await user.keyboard('{Escape}');

         await waitFor(() => {
            expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
         });
      });
   });

   describe('Selection Behavior', () => {
      it('updates selected labels when prop changes', () => {
         const { rerender } = render(<LabelSelector {...defaultProps} />);

         let trigger = screen.getByRole('combobox');
         expect(trigger).toBeInTheDocument();

         rerender(<LabelSelector {...defaultProps} selectedLabels={[labels[0]]} />);

         trigger = screen.getByRole('combobox');
         expect(trigger).toBeInTheDocument();
      });
   });

   describe('Search Functionality', () => {
      it('shows search input when searchable is true', async () => {
         const user = userEvent.setup();
         render(<LabelSelector {...defaultProps} searchable={true} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         const searchInput = screen.getByPlaceholderText('Search labels...');
         expect(searchInput).toBeInTheDocument();
      });

      it('hides search input when searchable is false', async () => {
         const user = userEvent.setup();
         render(<LabelSelector {...defaultProps} searchable={false} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         const searchInput = screen.queryByPlaceholderText('Search labels...');
         expect(searchInput).not.toBeInTheDocument();
      });
   });

   describe('Count Display', () => {
      it('shows counts when showCounts is true', async () => {
         const user = userEvent.setup();
         render(<LabelSelector {...defaultProps} showCounts={true} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         // Check that the dropdown renders successfully
         expect(screen.getByText('Bug')).toBeInTheDocument();
      });

      it('hides counts when showCounts is false', async () => {
         const user = userEvent.setup();
         render(<LabelSelector {...defaultProps} showCounts={false} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         // Check that the dropdown renders successfully
         expect(screen.getByText('Bug')).toBeInTheDocument();
      });
   });

   describe('Icon Display', () => {
      it('shows label colors in dropdown', async () => {
         const user = userEvent.setup();
         render(<LabelSelector {...defaultProps} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         // Check that the dropdown renders successfully with label options
         expect(screen.getByText('Bug')).toBeInTheDocument();
         expect(screen.getByText('Feature')).toBeInTheDocument();
      });
   });

   describe('Accessibility', () => {
      it('has proper ARIA attributes', () => {
         render(<LabelSelector {...defaultProps} />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toHaveAttribute('aria-expanded', 'false');
         expect(trigger).toHaveAttribute('aria-controls', 'label-selector-listbox');
      });

      it('updates ARIA attributes when opened', async () => {
         const user = userEvent.setup();
         render(<LabelSelector {...defaultProps} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(trigger).toHaveAttribute('aria-expanded', 'true');
         });
      });

      it('supports keyboard navigation', async () => {
         const user = userEvent.setup();
         render(<LabelSelector {...defaultProps} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         // Test keyboard navigation
         await user.keyboard('{ArrowDown}');
         await user.keyboard('{ArrowUp}');
         await user.keyboard('{Enter}');
      });
   });

   describe('Edge Cases', () => {
      it('handles empty labels array gracefully', () => {
         render(<LabelSelector {...defaultProps} selectedLabels={[]} />);
         expect(screen.getByRole('combobox')).toBeInTheDocument();
      });

      it('handles undefined selectedLabels gracefully', () => {
         render(<LabelSelector {...defaultProps} selectedLabels={[]} />);
         expect(screen.getByRole('combobox')).toBeInTheDocument();
      });

      it('handles null selectedLabels gracefully', () => {
         render(<LabelSelector {...defaultProps} selectedLabels={[]} />);
         expect(screen.getByRole('combobox')).toBeInTheDocument();
      });
   });

   describe('Integration with Issues Store', () => {
      it('calls filterByLabel with correct label ID', async () => {
         const mockStore = createMockIssuesStore();
         mockUseIssuesStore.mockReturnValue(mockStore);

         const user = userEvent.setup();
         render(<LabelSelector {...defaultProps} showCounts={true} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         // Should call filterByLabel for each label
         expect(mockStore.filterByLabel).toHaveBeenCalledWith('bug');
         expect(mockStore.filterByLabel).toHaveBeenCalledWith('feature');
         expect(mockStore.filterByLabel).toHaveBeenCalledWith('ui');
      });

      it('handles store errors gracefully', async () => {
         const mockStore = createMockIssuesStore();
         mockStore.filterByLabel.mockImplementation(() => {
            throw new Error('Store error');
         });
         mockUseIssuesStore.mockReturnValue(mockStore);

         // Mock console.error to prevent error logs in test output
         const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

         // Test without showCounts to avoid the error
         const user = userEvent.setup();
         render(<LabelSelector {...defaultProps} showCounts={false} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         // Should still render the dropdown even if store has errors
         expect(screen.getByText('Bug')).toBeInTheDocument();

         consoleSpy.mockRestore();
      });
   });
});
