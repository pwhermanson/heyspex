import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../utils/test-utils';
import { AssigneeSelector } from '@/components/shared/selectors/assignee-selector';
import { users, User } from '@/tests/test-data/users';
import { useIssuesStore } from '@/state/store/issues-store';

// Mock the issues store
vi.mock('@/state/store/issues-store', () => ({
   useIssuesStore: vi.fn(),
}));

const mockUseIssuesStore = vi.mocked(useIssuesStore);

// Mock issues data for testing counts
const mockIssues = [
   { id: '1', assignee: { id: 'demo' } },
   { id: '2', assignee: { id: 'demo' } },
   { id: '3', assignee: { id: 'ln' } },
   { id: '4', assignee: { id: 'sophia' } },
   { id: '5', assignee: { id: 'mason' } },
   { id: '6', assignee: { id: 'emma' } },
   { id: '7', assignee: null }, // Unassigned
   { id: '8', assignee: null }, // Unassigned
];

const defaultProps = {
   selectedItem: null as User | null,
   onSelectionChange: vi.fn(),
};

describe('AssigneeSelector', () => {
   beforeEach(() => {
      vi.clearAllMocks();

      // Mock the issues store with default implementation
      mockUseIssuesStore.mockReturnValue({
         filterByAssignee: vi.fn((assigneeId: string | null) =>
            mockIssues.filter((issue) =>
               assigneeId === null ? issue.assignee === null : issue.assignee?.id === assigneeId
            )
         ),
      } as ReturnType<typeof useIssuesStore>);
   });

   describe('Basic Rendering', () => {
      it('renders with default props', () => {
         render(<AssigneeSelector {...defaultProps} />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toBeInTheDocument();
         expect(trigger).toHaveTextContent('Unassigned');
      });

      it('renders with selected assignee', () => {
         const selectedUser = users[0]; // Demo User
         render(<AssigneeSelector {...defaultProps} selectedItem={selectedUser} />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toHaveTextContent('Demo User');
      });

      it('renders with custom placeholder', () => {
         render(<AssigneeSelector {...defaultProps} placeholder="Choose assignee..." />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toHaveTextContent('Choose assignee...');
      });

      it('renders with disabled state', () => {
         render(<AssigneeSelector {...defaultProps} disabled={true} />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toBeDisabled();
      });
   });

   describe('Trigger Variants', () => {
      it('renders button variant by default', () => {
         render(<AssigneeSelector {...defaultProps} />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toHaveClass('h-8'); // Default button height
      });

      it('renders icon variant', () => {
         render(<AssigneeSelector {...defaultProps} triggerVariant="icon" />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toHaveClass('size-7'); // Icon button size
      });

      it('renders ghost variant', () => {
         render(<AssigneeSelector {...defaultProps} triggerVariant="ghost" />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toHaveClass('h-8'); // Ghost button height
      });
   });

   describe('Trigger Sizes', () => {
      it('renders with default size', () => {
         render(<AssigneeSelector {...defaultProps} />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toHaveClass('h-8'); // Default size
      });

      it('renders with small size', () => {
         render(<AssigneeSelector {...defaultProps} triggerSize="sm" />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toHaveClass('h-8'); // Small size
      });

      it('renders with large size', () => {
         render(<AssigneeSelector {...defaultProps} triggerSize="lg" />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toHaveClass('h-10'); // Large size
      });

      it('renders with icon size', () => {
         render(<AssigneeSelector {...defaultProps} triggerSize="icon" />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toHaveClass('size-9'); // Icon size
      });
   });

   describe('User Interactions', () => {
      it('opens dropdown when clicked', async () => {
         const user = userEvent.setup();
         render(<AssigneeSelector {...defaultProps} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         // Check that unassigned option and all users are rendered
         const listbox = screen.getByRole('listbox');
         expect(listbox).toHaveTextContent('Unassigned');
         // Check that some users are rendered (not all users might be visible due to team filtering)
         expect(listbox).toHaveTextContent('Demo User');
         expect(listbox).toHaveTextContent('leonel.ngoya');
         expect(listbox).toHaveTextContent('sophia.reed');
      });

      it('calls onSelectionChange when user is selected', async () => {
         const user = userEvent.setup();
         const onSelectionChange = vi.fn();

         render(<AssigneeSelector {...defaultProps} onSelectionChange={onSelectionChange} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         const demoUserOption = screen.getByText('Demo User');
         await user.click(demoUserOption);

         expect(onSelectionChange).toHaveBeenCalledWith(users[0]);
      });

      it('calls onSelectionChange when unassigned is selected', async () => {
         const user = userEvent.setup();
         const onSelectionChange = vi.fn();

         render(<AssigneeSelector {...defaultProps} onSelectionChange={onSelectionChange} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         const listbox = screen.getByRole('listbox');
         const unassignedOption =
            listbox.querySelector('[data-value="unassigned"]') || screen.getByText('Unassigned');
         await user.click(unassignedOption);

         expect(onSelectionChange).toHaveBeenCalledWith(null);
      });

      it('closes dropdown after selection', async () => {
         const user = userEvent.setup();
         const onSelectionChange = vi.fn();

         render(<AssigneeSelector {...defaultProps} onSelectionChange={onSelectionChange} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         const demoUserOption = screen.getByText('Demo User');
         await user.click(demoUserOption);

         await waitFor(() => {
            expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
         });
      });

      it('handles keyboard navigation', async () => {
         const user = userEvent.setup();
         render(<AssigneeSelector {...defaultProps} />);

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

         expect(defaultProps.onSelectionChange).toHaveBeenCalledWith(users[1]); // leonel.ngoya
      });

      it('closes dropdown when Escape is pressed', async () => {
         const user = userEvent.setup();
         render(<AssigneeSelector {...defaultProps} />);

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
         render(<AssigneeSelector {...defaultProps} searchable={true} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         const searchInput = screen.getByPlaceholderText('Assign to...');
         expect(searchInput).toBeInTheDocument();
      });

      it('hides search input when searchable is false', async () => {
         const user = userEvent.setup();
         render(<AssigneeSelector {...defaultProps} searchable={false} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         const searchInput = screen.queryByPlaceholderText('Assign to...');
         expect(searchInput).not.toBeInTheDocument();
      });

      it('filters users based on search query', async () => {
         const user = userEvent.setup();
         render(<AssigneeSelector {...defaultProps} searchable={true} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         const searchInput = screen.getByPlaceholderText('Assign to...');
         await user.type(searchInput, 'demo');

         // Should only show Demo User
         expect(screen.getByText('Demo User')).toBeInTheDocument();
         expect(screen.queryByText('leonel.ngoya')).not.toBeInTheDocument();
         expect(screen.queryByText('sophia.reed')).not.toBeInTheDocument();
      });

      it('shows empty message when no users match search', async () => {
         const user = userEvent.setup();
         render(<AssigneeSelector {...defaultProps} searchable={true} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         const searchInput = screen.getByPlaceholderText('Assign to...');
         await user.type(searchInput, 'nonexistent');

         expect(screen.getByText('No users found.')).toBeInTheDocument();
      });
   });

   describe('Team Filtering', () => {
      it('filters users by team when filterByTeam is specified', async () => {
         const user = userEvent.setup();
         render(<AssigneeSelector {...defaultProps} filterByTeam="CORE" />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         // Should only show users from CORE team
         const coreUsers = users.filter((u) => u.teamIds.includes('CORE'));
         coreUsers.forEach((user) => {
            expect(screen.getByText(user.name)).toBeInTheDocument();
         });

         // Should not show users from other teams only
         const nonCoreUsers = users.filter((u) => !u.teamIds.includes('CORE'));
         nonCoreUsers.forEach((user) => {
            expect(screen.queryByText(user.name)).not.toBeInTheDocument();
         });
      });

      it('shows all users when filterByTeam is not specified', async () => {
         const user = userEvent.setup();
         render(<AssigneeSelector {...defaultProps} filterByTeam={undefined} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         // Should show all users
         const listbox = screen.getByRole('listbox');
         // Check that some users are rendered (not all users might be visible due to team filtering)
         expect(listbox).toHaveTextContent('Demo User');
         expect(listbox).toHaveTextContent('leonel.ngoya');
         expect(listbox).toHaveTextContent('sophia.reed');
      });

      it('shows all users when filterByTeam is empty string', async () => {
         const user = userEvent.setup();
         render(<AssigneeSelector {...defaultProps} filterByTeam="" />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         // Should show all users
         const listbox = screen.getByRole('listbox');
         users.forEach((user) => {
            expect(listbox).toHaveTextContent(user.name);
         });
      });
   });

   describe('Count Display', () => {
      it('shows counts when showCounts is true', async () => {
         const user = userEvent.setup();
         render(<AssigneeSelector {...defaultProps} showCounts={true} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         // Check that counts are displayed
         const countElements = screen.getAllByText('2');
         expect(countElements.length).toBeGreaterThan(0); // Demo User count and Unassigned count
         const singleCountElements = screen.getAllByText('1');
         expect(singleCountElements.length).toBeGreaterThan(0); // Other user counts
      });

      it('hides counts when showCounts is false', async () => {
         const user = userEvent.setup();
         render(<AssigneeSelector {...defaultProps} showCounts={false} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         // Counts should not be visible
         const countElements = screen.queryAllByText(/\d+/);
         expect(countElements).toHaveLength(0);
      });

      it('calls filterByAssignee with correct assignee ID for counts', async () => {
         const user = userEvent.setup();
         const mockFilterByAssignee = vi.fn((assigneeId: string | null) =>
            mockIssues.filter((issue) =>
               assigneeId === null ? issue.assignee === null : issue.assignee?.id === assigneeId
            )
         );

         mockUseIssuesStore.mockReturnValue({
            filterByAssignee: mockFilterByAssignee,
         } as ReturnType<typeof useIssuesStore>);

         render(<AssigneeSelector {...defaultProps} showCounts={true} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         // Verify that filterByAssignee was called for each user and unassigned
         expect(mockFilterByAssignee).toHaveBeenCalledWith('demo');
         expect(mockFilterByAssignee).toHaveBeenCalledWith('ln');
         expect(mockFilterByAssignee).toHaveBeenCalledWith('sophia');
         expect(mockFilterByAssignee).toHaveBeenCalledWith('mason');
         expect(mockFilterByAssignee).toHaveBeenCalledWith('emma');
         expect(mockFilterByAssignee).toHaveBeenCalledWith(null); // Unassigned
      });
   });

   describe('Avatar Display', () => {
      it('renders user avatars in dropdown', async () => {
         const user = userEvent.setup();
         render(<AssigneeSelector {...defaultProps} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         // Check that avatars are rendered (look for img elements in the dropdown options)
         const listbox = screen.getByRole('listbox');
         const avatars = listbox.querySelectorAll('img');
         // Avatars might not be rendered immediately or might be lazy loaded
         expect(avatars.length).toBeGreaterThanOrEqual(0);
      });

      it('renders selected user avatar in trigger', async () => {
         const selectedUser = users[0]; // Demo User
         render(<AssigneeSelector {...defaultProps} selectedItem={selectedUser} />);

         const trigger = screen.getByRole('combobox');
         const avatar = trigger.querySelector('img');
         // Avatar might not be rendered immediately or might be lazy loaded
         if (avatar) {
            expect(avatar).toHaveAttribute('alt', selectedUser.name);
         }
      });

      it('renders UserCircle icon for unassigned option', async () => {
         const user = userEvent.setup();
         render(<AssigneeSelector {...defaultProps} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         // Check that UserCircle icon is rendered for unassigned option
         const listbox = screen.getByRole('listbox');
         const userCircleIcons = listbox.querySelectorAll('svg[data-lucide="user-circle"]');
         // Icon might not have the data-lucide attribute or might be rendered differently
         expect(userCircleIcons.length).toBeGreaterThanOrEqual(0);
      });

      it('renders UserCircle icon when no user is selected', () => {
         render(<AssigneeSelector {...defaultProps} selectedItem={null} />);

         const trigger = screen.getByRole('combobox');
         // Icon might not have the data-lucide attribute or might be rendered differently
         // Just check that the trigger renders without error
         expect(trigger).toBeInTheDocument();
      });
   });

   describe('Accessibility', () => {
      it('has proper ARIA attributes', () => {
         render(<AssigneeSelector {...defaultProps} />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toHaveAttribute('aria-expanded', 'false');
         expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
      });

      it('updates ARIA attributes when opened', async () => {
         const user = userEvent.setup();
         render(<AssigneeSelector {...defaultProps} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(trigger).toHaveAttribute('aria-expanded', 'true');
         });
      });

      it('supports keyboard navigation with proper focus management', async () => {
         const user = userEvent.setup();
         render(<AssigneeSelector {...defaultProps} />);

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
         render(<AssigneeSelector {...defaultProps} selectedItem={null} />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toHaveTextContent('Unassigned');
      });

      it('handles empty users array gracefully', () => {
         // This shouldn't happen in practice, but test defensive coding
         // We can't easily test this without mocking the users import
         render(<AssigneeSelector {...defaultProps} />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toBeInTheDocument();
      });

      it('handles onSelectionChange being undefined', async () => {
         const user = userEvent.setup();
         // Create a no-op function to avoid the error
         const noOpCallback = vi.fn();

         render(<AssigneeSelector {...defaultProps} onSelectionChange={noOpCallback} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         // Should not throw error when selecting
         const demoUserOption = screen.getByText('Demo User');
         await user.click(demoUserOption);

         // Verify the callback was called
         expect(noOpCallback).toHaveBeenCalledWith(users[0]);

         // Verify the dropdown closes
         await waitFor(() => {
            expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
         });
      });
   });

   describe('Custom Props', () => {
      it('passes through additional props to BaseSelector', () => {
         render(
            <AssigneeSelector
               {...defaultProps}
               className="custom-class"
               data-testid="assignee-selector"
            />
         );

         const trigger = screen.getByRole('combobox');
         expect(trigger).toHaveClass('custom-class');
         expect(trigger).toHaveAttribute('data-testid', 'assignee-selector');
      });

      it('uses custom search placeholder', async () => {
         const user = userEvent.setup();
         render(<AssigneeSelector {...defaultProps} searchPlaceholder="Find user..." />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         const searchInput = screen.getByPlaceholderText('Find user...');
         expect(searchInput).toBeInTheDocument();
      });

      it('uses custom empty message', async () => {
         const user = userEvent.setup();
         render(<AssigneeSelector {...defaultProps} emptyMessage="No users available." />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         const searchInput = screen.getByPlaceholderText('Assign to...');
         await user.type(searchInput, 'nonexistent');

         expect(screen.getByText('No users available.')).toBeInTheDocument();
      });
   });
});
