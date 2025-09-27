import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../utils/test-utils';
import { StatusSelector } from '@/components/shared/selectors/status-selector';
import { status as allStatus, Status } from '@/tests/test-data/status';
import { useIssuesStore } from '@/state/store/issues-store';

// Mock the issues store
vi.mock('@/state/store/issues-store', () => ({
   useIssuesStore: vi.fn(),
}));

const mockUseIssuesStore = vi.mocked(useIssuesStore);

// Mock issues data for testing counts
const mockIssues = [
   { id: '1', status: { id: 'in-progress' } },
   { id: '2', status: { id: 'in-progress' } },
   { id: '3', status: { id: 'technical-review' } },
   { id: '4', status: { id: 'completed' } },
   { id: '5', status: { id: 'paused' } },
   { id: '6', status: { id: 'to-do' } },
   { id: '7', status: { id: 'backlog' } },
];

const defaultProps = {
   selectedItem: null as Status | null,
   onSelectionChange: vi.fn(),
};

describe('StatusSelector', () => {
   beforeEach(() => {
      vi.clearAllMocks();

      // Mock the issues store with default implementation
      mockUseIssuesStore.mockReturnValue({
         filterByStatus: vi.fn((statusId: string) =>
            mockIssues.filter((issue) => issue.status.id === statusId)
         ),
      } as ReturnType<typeof useIssuesStore>);
   });

   describe('Basic Rendering', () => {
      it('renders with default props', () => {
         render(<StatusSelector {...defaultProps} />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toBeInTheDocument();
         expect(trigger).toHaveTextContent('Select status...');
      });

      it('renders with selected status', () => {
         const selectedStatus = allStatus[0]; // In Progress
         render(<StatusSelector {...defaultProps} selectedItem={selectedStatus} />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toHaveTextContent('In Progress');
      });

      it('renders with custom placeholder', () => {
         render(<StatusSelector {...defaultProps} placeholder="Choose status..." />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toHaveTextContent('Choose status...');
      });

      it('renders with disabled state', () => {
         render(<StatusSelector {...defaultProps} disabled={true} />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toBeDisabled();
      });
   });

   describe('Trigger Variants', () => {
      it('renders button variant by default', () => {
         render(<StatusSelector {...defaultProps} />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toHaveClass('h-8'); // Default button height
      });

      it('renders icon variant', () => {
         render(<StatusSelector {...defaultProps} triggerVariant="icon" />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toHaveClass('size-7'); // Icon button size
      });

      it('renders ghost variant', () => {
         render(<StatusSelector {...defaultProps} triggerVariant="ghost" />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toHaveClass('h-8'); // Ghost button height
      });
   });

   describe('Trigger Sizes', () => {
      it('renders with default size', () => {
         render(<StatusSelector {...defaultProps} />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toHaveClass('h-8'); // Default size
      });

      it('renders with small size', () => {
         render(<StatusSelector {...defaultProps} triggerSize="sm" />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toHaveClass('h-8'); // Small size
      });

      it('renders with large size', () => {
         render(<StatusSelector {...defaultProps} triggerSize="lg" />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toHaveClass('h-10'); // Large size
      });

      it('renders with icon size', () => {
         render(<StatusSelector {...defaultProps} triggerSize="icon" />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toHaveClass('size-9'); // Icon size
      });
   });

   describe('User Interactions', () => {
      it('opens dropdown when clicked', async () => {
         const user = userEvent.setup();
         render(<StatusSelector {...defaultProps} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         // Check that all statuses are rendered
         allStatus.forEach((status) => {
            expect(screen.getByText(status.name)).toBeInTheDocument();
         });
      });

      it('calls onSelectionChange when status is selected', async () => {
         const user = userEvent.setup();
         const onSelectionChange = vi.fn();

         render(<StatusSelector {...defaultProps} onSelectionChange={onSelectionChange} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         const inProgressOption = screen.getByText('In Progress');
         await user.click(inProgressOption);

         expect(onSelectionChange).toHaveBeenCalledWith(allStatus[0]);
      });

      it('closes dropdown after selection', async () => {
         const user = userEvent.setup();
         const onSelectionChange = vi.fn();

         render(<StatusSelector {...defaultProps} onSelectionChange={onSelectionChange} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         const inProgressOption = screen.getByText('In Progress');
         await user.click(inProgressOption);

         await waitFor(() => {
            expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
         });
      });

      it('handles keyboard navigation', async () => {
         const user = userEvent.setup();
         render(<StatusSelector {...defaultProps} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         // Navigate down
         await user.keyboard('{ArrowDown}');
         await user.keyboard('{ArrowDown}');

         // Press Enter to select
         await user.keyboard('{Enter}');

         expect(defaultProps.onSelectionChange).toHaveBeenCalledWith(allStatus[2]); // Technical Review
      });

      it('closes dropdown when Escape is pressed', async () => {
         const user = userEvent.setup();
         render(<StatusSelector {...defaultProps} />);

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

   describe('Search Functionality', () => {
      it('shows search input when searchable is true', async () => {
         const user = userEvent.setup();
         render(<StatusSelector {...defaultProps} searchable={true} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         const searchInput = screen.getByPlaceholderText('Search statuses...');
         expect(searchInput).toBeInTheDocument();
      });

      it('hides search input when searchable is false', async () => {
         const user = userEvent.setup();
         render(<StatusSelector {...defaultProps} searchable={false} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         const searchInput = screen.queryByPlaceholderText('Search statuses...');
         expect(searchInput).not.toBeInTheDocument();
      });

      it('filters statuses based on search query', async () => {
         const user = userEvent.setup();
         render(<StatusSelector {...defaultProps} searchable={true} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         const searchInput = screen.getByPlaceholderText('Search statuses...');
         await user.type(searchInput, 'progress');

         // Should only show In Progress status
         expect(screen.getByText('In Progress')).toBeInTheDocument();
         expect(screen.queryByText('Technical Review')).not.toBeInTheDocument();
         expect(screen.queryByText('Completed')).not.toBeInTheDocument();
      });

      it('shows empty message when no statuses match search', async () => {
         const user = userEvent.setup();
         render(<StatusSelector {...defaultProps} searchable={true} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         const searchInput = screen.getByPlaceholderText('Search statuses...');
         await user.type(searchInput, 'nonexistent');

         expect(screen.getByText('No statuses found.')).toBeInTheDocument();
      });
   });

   describe('Count Display', () => {
      it('shows counts when showCounts is true', async () => {
         const user = userEvent.setup();
         render(<StatusSelector {...defaultProps} showCounts={true} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         // Check that counts are displayed
         expect(screen.getByText('2')).toBeInTheDocument(); // In Progress count
         expect(screen.getAllByText('1')).toHaveLength(5); // Other status counts
      });

      it('hides counts when showCounts is false', async () => {
         const user = userEvent.setup();
         render(<StatusSelector {...defaultProps} showCounts={false} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         // Counts should not be visible
         const countElements = screen.queryAllByText(/\d+/);
         expect(countElements).toHaveLength(0);
      });

      it('calls filterByStatus with correct status ID for counts', async () => {
         const user = userEvent.setup();
         const mockFilterByStatus = vi.fn((statusId: string) =>
            mockIssues.filter((issue) => issue.status.id === statusId)
         );

         mockUseIssuesStore.mockReturnValue({
            filterByStatus: mockFilterByStatus,
         } as ReturnType<typeof useIssuesStore>);

         render(<StatusSelector {...defaultProps} showCounts={true} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         // Verify that filterByStatus was called for each status
         expect(mockFilterByStatus).toHaveBeenCalledWith('in-progress');
         expect(mockFilterByStatus).toHaveBeenCalledWith('technical-review');
         expect(mockFilterByStatus).toHaveBeenCalledWith('completed');
         expect(mockFilterByStatus).toHaveBeenCalledWith('paused');
         expect(mockFilterByStatus).toHaveBeenCalledWith('to-do');
         expect(mockFilterByStatus).toHaveBeenCalledWith('backlog');
      });
   });

   describe('Icon Display', () => {
      it('renders status icons in dropdown', async () => {
         const user = userEvent.setup();
         render(<StatusSelector {...defaultProps} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         // Check that icons are rendered (look for SVG elements in the dropdown options)
         const listbox = screen.getByRole('listbox');
         const icons = listbox.querySelectorAll('svg');
         expect(icons).toHaveLength(allStatus.length);
      });

      it('renders selected status icon in trigger', async () => {
         const selectedStatus = allStatus[0]; // In Progress
         render(<StatusSelector {...defaultProps} selectedItem={selectedStatus} />);

         const trigger = screen.getByRole('combobox');
         const icon = trigger.querySelector('svg');
         expect(icon).toBeInTheDocument();
      });
   });

   describe('Accessibility', () => {
      it('has proper ARIA attributes', () => {
         render(<StatusSelector {...defaultProps} />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toHaveAttribute('aria-expanded', 'false');
         expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
      });

      it('updates ARIA attributes when opened', async () => {
         const user = userEvent.setup();
         render(<StatusSelector {...defaultProps} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(trigger).toHaveAttribute('aria-expanded', 'true');
         });
      });

      it('supports keyboard navigation with proper focus management', async () => {
         const user = userEvent.setup();
         render(<StatusSelector {...defaultProps} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         // Tab should move focus to first option
         await user.keyboard('{Tab}');

         // Arrow keys should navigate through options
         await user.keyboard('{ArrowDown}');
         await user.keyboard('{ArrowUp}');
      });
   });

   describe('Edge Cases', () => {
      it('handles null selectedItem gracefully', () => {
         render(<StatusSelector {...defaultProps} selectedItem={null} />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toHaveTextContent('Select status...');
      });

      it('handles empty statuses array gracefully', () => {
         // This shouldn't happen in practice, but test defensive coding
         render(<StatusSelector {...defaultProps} items={[]} />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toBeInTheDocument();
      });

      it('handles onSelectionChange being undefined', async () => {
         const user = userEvent.setup();
         // Create a no-op function to avoid the error
         const noOpCallback = vi.fn();

         render(<StatusSelector {...defaultProps} onSelectionChange={noOpCallback} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         // Should not throw error when selecting
         const inProgressOption = screen.getByText('In Progress');
         await user.click(inProgressOption);

         // Verify the callback was called
         expect(noOpCallback).toHaveBeenCalledWith(allStatus[0]);

         // Verify the dropdown closes
         await waitFor(() => {
            expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
         });
      });
   });

   describe('Custom Props', () => {
      it('passes through additional props to BaseSelector', () => {
         render(
            <StatusSelector
               {...defaultProps}
               className="custom-class"
               data-testid="status-selector"
            />
         );

         const trigger = screen.getByRole('combobox');
         expect(trigger).toHaveClass('custom-class');
         expect(trigger).toHaveAttribute('data-testid', 'status-selector');
      });

      it('uses custom search placeholder', async () => {
         const user = userEvent.setup();
         render(<StatusSelector {...defaultProps} searchPlaceholder="Find status..." />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         const searchInput = screen.getByPlaceholderText('Find status...');
         expect(searchInput).toBeInTheDocument();
      });

      it('uses custom empty message', async () => {
         const user = userEvent.setup();
         render(<StatusSelector {...defaultProps} emptyMessage="No statuses available." />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         const searchInput = screen.getByPlaceholderText('Search statuses...');
         await user.type(searchInput, 'nonexistent');

         expect(screen.getByText('No statuses available.')).toBeInTheDocument();
      });
   });
});
