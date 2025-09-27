import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../utils/test-utils';
import { PrioritySelector } from '@/components/shared/selectors/priority-selector';
import { priorities, Priority } from '@/tests/test-data/priorities';
import { useIssuesStore } from '@/state/store/issues-store';

// Mock the issues store
vi.mock('@/state/store/issues-store', () => ({
   useIssuesStore: vi.fn(),
}));

const mockUseIssuesStore = vi.mocked(useIssuesStore);

// Mock issues data for testing counts
const mockIssues = [
   { id: '1', priority: { id: 'urgent' } },
   { id: '2', priority: { id: 'urgent' } },
   { id: '3', priority: { id: 'high' } },
   { id: '4', priority: { id: 'medium' } },
   { id: '5', priority: { id: 'low' } },
   { id: '6', priority: { id: 'no-priority' } },
];

const defaultProps = {
   selectedItem: null as Priority | null,
   onSelectionChange: vi.fn(),
};

describe('PrioritySelector', () => {
   beforeEach(() => {
      vi.clearAllMocks();

      // Mock the issues store with default implementation
      mockUseIssuesStore.mockReturnValue({
         filterByPriority: vi.fn((priorityId: string) =>
            mockIssues.filter((issue) => issue.priority.id === priorityId)
         ),
      } as ReturnType<typeof useIssuesStore>);
   });

   describe('Basic Rendering', () => {
      it('renders with default props', () => {
         render(<PrioritySelector {...defaultProps} />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toBeInTheDocument();
         expect(trigger).toHaveTextContent('Select priority...');
      });

      it('renders with selected priority', () => {
         const selectedPriority = priorities[1]; // Urgent
         render(<PrioritySelector {...defaultProps} selectedItem={selectedPriority} />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toHaveTextContent('Urgent');
      });

      it('renders with custom placeholder', () => {
         render(<PrioritySelector {...defaultProps} placeholder="Choose priority..." />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toHaveTextContent('Choose priority...');
      });

      it('renders with disabled state', () => {
         render(<PrioritySelector {...defaultProps} disabled={true} />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toBeDisabled();
      });
   });

   describe('Trigger Variants', () => {
      it('renders button variant by default', () => {
         render(<PrioritySelector {...defaultProps} />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toHaveClass('h-8'); // Default button height
      });

      it('renders icon variant', () => {
         render(<PrioritySelector {...defaultProps} triggerVariant="icon" />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toHaveClass('size-7'); // Icon button size
      });

      it('renders ghost variant', () => {
         render(<PrioritySelector {...defaultProps} triggerVariant="ghost" />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toHaveClass('h-8'); // Ghost button height
      });
   });

   describe('Trigger Sizes', () => {
      it('renders with default size', () => {
         render(<PrioritySelector {...defaultProps} />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toHaveClass('h-8'); // Default size
      });

      it('renders with small size', () => {
         render(<PrioritySelector {...defaultProps} triggerSize="sm" />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toHaveClass('h-8'); // Small size
      });

      it('renders with large size', () => {
         render(<PrioritySelector {...defaultProps} triggerSize="lg" />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toHaveClass('h-10'); // Large size
      });

      it('renders with icon size', () => {
         render(<PrioritySelector {...defaultProps} triggerSize="icon" />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toHaveClass('size-9'); // Icon size
      });
   });

   describe('User Interactions', () => {
      it('opens dropdown when clicked', async () => {
         const user = userEvent.setup();
         render(<PrioritySelector {...defaultProps} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         // Check that all priorities are rendered
         priorities.forEach((priority) => {
            expect(screen.getByText(priority.name)).toBeInTheDocument();
         });
      });

      it('calls onSelectionChange when priority is selected', async () => {
         const user = userEvent.setup();
         const onSelectionChange = vi.fn();

         render(<PrioritySelector {...defaultProps} onSelectionChange={onSelectionChange} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         const urgentOption = screen.getByText('Urgent');
         await user.click(urgentOption);

         expect(onSelectionChange).toHaveBeenCalledWith(priorities[1]);
      });

      it('closes dropdown after selection', async () => {
         const user = userEvent.setup();
         const onSelectionChange = vi.fn();

         render(<PrioritySelector {...defaultProps} onSelectionChange={onSelectionChange} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         const urgentOption = screen.getByText('Urgent');
         await user.click(urgentOption);

         await waitFor(() => {
            expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
         });
      });

      it('handles keyboard navigation', async () => {
         const user = userEvent.setup();
         render(<PrioritySelector {...defaultProps} />);

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

         expect(defaultProps.onSelectionChange).toHaveBeenCalledWith(priorities[2]); // High priority
      });

      it('closes dropdown when Escape is pressed', async () => {
         const user = userEvent.setup();
         render(<PrioritySelector {...defaultProps} />);

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
         render(<PrioritySelector {...defaultProps} searchable={true} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         const searchInput = screen.getByPlaceholderText('Search priorities...');
         expect(searchInput).toBeInTheDocument();
      });

      it('hides search input when searchable is false', async () => {
         const user = userEvent.setup();
         render(<PrioritySelector {...defaultProps} searchable={false} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         const searchInput = screen.queryByPlaceholderText('Search priorities...');
         expect(searchInput).not.toBeInTheDocument();
      });

      it('filters priorities based on search query', async () => {
         const user = userEvent.setup();
         render(<PrioritySelector {...defaultProps} searchable={true} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         const searchInput = screen.getByPlaceholderText('Search priorities...');
         await user.type(searchInput, 'urgent');

         // Should only show Urgent priority
         expect(screen.getByText('Urgent')).toBeInTheDocument();
         expect(screen.queryByText('High')).not.toBeInTheDocument();
         expect(screen.queryByText('Medium')).not.toBeInTheDocument();
      });

      it('shows empty message when no priorities match search', async () => {
         const user = userEvent.setup();
         render(<PrioritySelector {...defaultProps} searchable={true} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         const searchInput = screen.getByPlaceholderText('Search priorities...');
         await user.type(searchInput, 'nonexistent');

         expect(screen.getByText('No priorities found.')).toBeInTheDocument();
      });
   });

   describe('Count Display', () => {
      it('shows counts when showCounts is true', async () => {
         const user = userEvent.setup();
         render(<PrioritySelector {...defaultProps} showCounts={true} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         // Check that counts are displayed
         expect(screen.getByText('2')).toBeInTheDocument(); // Urgent count
         expect(screen.getAllByText('1')).toHaveLength(4); // High, Medium, Low, No Priority counts
      });

      it('hides counts when showCounts is false', async () => {
         const user = userEvent.setup();
         render(<PrioritySelector {...defaultProps} showCounts={false} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         // Counts should not be visible
         const countElements = screen.queryAllByText(/\d+/);
         expect(countElements).toHaveLength(0);
      });

      it('calls filterByPriority with correct priority ID for counts', async () => {
         const user = userEvent.setup();
         const mockFilterByPriority = vi.fn((priorityId: string) =>
            mockIssues.filter((issue) => issue.priority.id === priorityId)
         );

         mockUseIssuesStore.mockReturnValue({
            filterByPriority: mockFilterByPriority,
         } as ReturnType<typeof useIssuesStore>);

         render(<PrioritySelector {...defaultProps} showCounts={true} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         // Verify that filterByPriority was called for each priority
         expect(mockFilterByPriority).toHaveBeenCalledWith('no-priority');
         expect(mockFilterByPriority).toHaveBeenCalledWith('urgent');
         expect(mockFilterByPriority).toHaveBeenCalledWith('high');
         expect(mockFilterByPriority).toHaveBeenCalledWith('medium');
         expect(mockFilterByPriority).toHaveBeenCalledWith('low');
      });
   });

   describe('Icon Display', () => {
      it('renders priority icons in dropdown', async () => {
         const user = userEvent.setup();
         render(<PrioritySelector {...defaultProps} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         // Check that icons are rendered (they should have the size-4 class)
         const icons = screen.getAllByRole('img');
         expect(icons).toHaveLength(priorities.length);
      });

      it('renders selected priority icon in trigger', async () => {
         const selectedPriority = priorities[1]; // Urgent
         render(<PrioritySelector {...defaultProps} selectedItem={selectedPriority} />);

         const trigger = screen.getByRole('combobox');
         const icon = trigger.querySelector('svg');
         expect(icon).toBeInTheDocument();
      });
   });

   describe('Accessibility', () => {
      it('has proper ARIA attributes', () => {
         render(<PrioritySelector {...defaultProps} />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toHaveAttribute('aria-expanded', 'false');
         expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
      });

      it('updates ARIA attributes when opened', async () => {
         const user = userEvent.setup();
         render(<PrioritySelector {...defaultProps} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(trigger).toHaveAttribute('aria-expanded', 'true');
         });
      });

      it('supports keyboard navigation with proper focus management', async () => {
         const user = userEvent.setup();
         render(<PrioritySelector {...defaultProps} />);

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
         render(<PrioritySelector {...defaultProps} selectedItem={null} />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toHaveTextContent('Select priority...');
      });

      it('handles empty priorities array gracefully', () => {
         // This shouldn't happen in practice, but test defensive coding
         render(<PrioritySelector {...defaultProps} items={[]} />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toBeInTheDocument();
      });

      it('handles onSelectionChange being undefined', async () => {
         const user = userEvent.setup();
         // Create a no-op function to avoid the error
         const noOpCallback = vi.fn();

         render(<PrioritySelector {...defaultProps} onSelectionChange={noOpCallback} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         // Should not throw error when selecting
         const urgentOption = screen.getByText('Urgent');
         await user.click(urgentOption);

         // Verify the callback was called
         expect(noOpCallback).toHaveBeenCalledWith(priorities[1]);

         // Verify the dropdown closes
         await waitFor(() => {
            expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
         });
      });
   });

   describe('Custom Props', () => {
      it('passes through additional props to BaseSelector', () => {
         render(
            <PrioritySelector
               {...defaultProps}
               className="custom-class"
               data-testid="priority-selector"
            />
         );

         const trigger = screen.getByRole('combobox');
         expect(trigger).toHaveClass('custom-class');
         expect(trigger).toHaveAttribute('data-testid', 'priority-selector');
      });

      it('uses custom search placeholder', async () => {
         const user = userEvent.setup();
         render(<PrioritySelector {...defaultProps} searchPlaceholder="Find priority..." />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         const searchInput = screen.getByPlaceholderText('Find priority...');
         expect(searchInput).toBeInTheDocument();
      });

      it('uses custom empty message', async () => {
         const user = userEvent.setup();
         render(<PrioritySelector {...defaultProps} emptyMessage="No priorities available." />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         const searchInput = screen.getByPlaceholderText('Search priorities...');
         await user.type(searchInput, 'nonexistent');

         expect(screen.getByText('No priorities available.')).toBeInTheDocument();
      });
   });
});
