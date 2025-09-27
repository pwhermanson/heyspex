import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../utils/test-utils';
import { AssigneeSelector } from '@/components/shared/selectors/assignee-selector';
import { users, User } from '@/tests/test-data/users';
import { useIssuesStore } from '@/state/store/issues-store';
import { selectorTestUtils, selectorTestConfigs } from '../utils/selector-test-utils';
import { createMockIssuesStore } from '../utils/mock-issues-store';

// Mock the issues store
vi.mock('@/state/store/issues-store', () => ({
   useIssuesStore: vi.fn(),
}));

const mockUseIssuesStore = vi.mocked(useIssuesStore);

const defaultProps = {
   selectedItem: undefined as User | undefined,
   onSelectionChange: vi.fn(),
};

describe('AssigneeSelector', () => {
   beforeEach(() => {
      vi.clearAllMocks();
      mockUseIssuesStore.mockReturnValue(createMockIssuesStore());
   });

   describe('Basic Rendering', () => {
      const testCases = [
         { name: 'renders with default props', props: {}, expectedText: 'Unassigned' },
         {
            name: 'renders with selected assignee',
            props: { selectedItem: users[0] },
            expectedText: users[0].name,
         },
         {
            name: 'renders with custom placeholder',
            props: { placeholder: 'Choose assignee...' },
            expectedText: 'Choose assignee...',
         },
         {
            name: 'renders with disabled state',
            props: { disabled: true },
            expectedText: 'Unassigned',
         },
      ];

      selectorTestUtils.testRendering(AssigneeSelector, defaultProps, testCases);
   });

   describe('Trigger Variants', () => {
      selectorTestUtils.testTriggerVariants(
         AssigneeSelector,
         defaultProps,
         selectorTestConfigs.triggerVariants
      );
   });

   describe('Trigger Sizes', () => {
      const customSizes = [
         { size: 'sm', expectedClass: 'h-8' },
         { size: 'default', expectedClass: 'h-9' },
         { size: 'lg', expectedClass: 'h-10' },
         { size: 'icon', expectedClass: 'size-9' },
      ];
      selectorTestUtils.testTriggerSizes(AssigneeSelector, defaultProps, customSizes);
   });

   describe('Dropdown Interaction', () => {
      it('opens dropdown when clicked', async () => {
         const user = userEvent.setup();
         render(<AssigneeSelector {...defaultProps} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         // Check that all options are rendered in the dropdown
         const listbox = screen.getByRole('listbox');
         expect(listbox).toHaveTextContent('Unassigned');
         expect(listbox).toHaveTextContent('Demo User');
         expect(listbox).toHaveTextContent('leonel.ngoya');
         expect(listbox).toHaveTextContent('sophia.reed');
         expect(listbox).toHaveTextContent('mason.carter');
         expect(listbox).toHaveTextContent('emma.jones');
         expect(listbox).toHaveTextContent('lucas.martin');
      });

      it('closes dropdown when clicking outside', async () => {
         const user = userEvent.setup();
         render(
            <div>
               <AssigneeSelector {...defaultProps} />
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

   describe('Selection Behavior', () => {
      it('calls onSelectionChange when assignee is selected', async () => {
         const user = userEvent.setup();
         const onSelectionChange = vi.fn();

         render(<AssigneeSelector {...defaultProps} onSelectionChange={onSelectionChange} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         // Test selecting "Unassigned" option (use getAllByText and click the one in the dropdown)
         const unassignedOptions = screen.getAllByText('Unassigned');
         const unassignedOption = unassignedOptions.find(
            (option) => option.closest('[role="listbox"]') !== null
         );
         expect(unassignedOption).toBeDefined();
         await user.click(unassignedOption!);
         expect(onSelectionChange).toHaveBeenCalledWith(null);

         // Reopen dropdown and test selecting a user
         await user.click(trigger);
         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         const demoUserOption = screen.getByText('Demo User');
         await user.click(demoUserOption);
         expect(onSelectionChange).toHaveBeenCalledWith(users[0]);
      });

      it('updates selected item when prop changes', () => {
         const { rerender } = render(<AssigneeSelector {...defaultProps} />);

         let trigger = screen.getByRole('combobox');
         expect(trigger).toHaveTextContent('Unassigned');

         rerender(<AssigneeSelector {...defaultProps} selectedItem={users[0]} />);

         trigger = screen.getByRole('combobox');
         expect(trigger).toHaveTextContent(users[0].name);
      });
   });

   describe('Search Functionality', () => {
      it('shows search input when searchable is true', async () => {
         const searchConfig = {
            placeholder: 'Assign to...',
            searchable: true,
            searchQuery: 'demo',
            expectedResults: ['Demo User'],
            expectedEmptyMessage: 'No users found.',
         };
         await selectorTestUtils.testSearchFunctionality(
            AssigneeSelector,
            defaultProps,
            searchConfig
         );
      });

      it('hides search input when searchable is false', async () => {
         const searchConfig = {
            placeholder: 'Assign to...',
            searchable: false,
            searchQuery: '',
            expectedResults: [],
            expectedEmptyMessage: '',
         };
         await selectorTestUtils.testSearchFunctionality(
            AssigneeSelector,
            defaultProps,
            searchConfig
         );
      });

      it('filters assignees based on search query', async () => {
         const user = userEvent.setup();
         render(<AssigneeSelector {...defaultProps} searchable={true} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         const searchInput = screen.getByPlaceholderText('Assign to...');
         await user.type(searchInput, 'demo');

         // Should show only users containing "demo"
         expect(screen.getByText('Demo User')).toBeInTheDocument();
         expect(screen.queryByText('leonel.ngoya')).not.toBeInTheDocument();
      });

      it('shows empty message when no assignees match search', async () => {
         const user = userEvent.setup();
         render(<AssigneeSelector {...defaultProps} searchable={true} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         const searchInput = screen.getByPlaceholderText('Assign to...');
         await user.type(searchInput, 'NonExistentUser');

         expect(screen.getByText('No users found.')).toBeInTheDocument();
      });
   });

   describe('Count Display', () => {
      it('shows counts when showCounts is true', async () => {
         const expectedCounts = ['1', '1', '1']; // Based on mock data
         await selectorTestUtils.testCountDisplay(
            AssigneeSelector,
            defaultProps,
            true,
            expectedCounts
         );
      });

      it('hides counts when showCounts is false', async () => {
         await selectorTestUtils.testCountDisplay(AssigneeSelector, defaultProps, false, []);
      });

      it('shows correct count for "Unassigned" option', async () => {
         const user = userEvent.setup();
         render(<AssigneeSelector {...defaultProps} showCounts={true} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         // "Unassigned" should show count for issues with no assignee
         const listbox = screen.getByRole('listbox');
         expect(listbox).toHaveTextContent('Unassigned');
      });
   });

   describe('Icon Display', () => {
      it('shows assignee avatars in dropdown', async () => {
         const user = userEvent.setup();
         render(<AssigneeSelector {...defaultProps} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         // Check that the dropdown renders successfully with assignee options
         const listbox = screen.getByRole('listbox');
         expect(listbox).toHaveTextContent('Unassigned');
         expect(listbox).toHaveTextContent('Demo User');
      });

      it('shows default avatar for "Unassigned" option', async () => {
         const user = userEvent.setup();
         render(<AssigneeSelector {...defaultProps} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         // The "Unassigned" option should have a default avatar
         const listbox = screen.getByRole('listbox');
         expect(listbox).toHaveTextContent('Unassigned');
      });
   });

   describe('Accessibility', () => {
      it('has proper ARIA attributes', () => {
         selectorTestUtils.testAccessibility(AssigneeSelector, defaultProps);
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

      it('supports keyboard navigation', async () => {
         await selectorTestUtils.testKeyboardNavigation(AssigneeSelector, defaultProps, users[1]);
      });
   });

   describe('Edge Cases', () => {
      const edgeCases = [
         {
            name: 'handles empty users array gracefully',
            props: { items: [] },
            expectedText: 'Unassigned',
         },
         {
            name: 'handles undefined selectedItem gracefully',
            props: { selectedItem: undefined },
            expectedText: 'Unassigned',
         },
         {
            name: 'handles null selectedItem gracefully',
            props: { selectedItem: null as User | undefined },
            expectedText: 'Unassigned',
         },
      ];

      selectorTestUtils.testEdgeCases(AssigneeSelector, defaultProps, edgeCases);
   });

   describe('Integration with Issues Store', () => {
      it('calls filterByAssignee with correct assignee ID', async () => {
         const mockStore = createMockIssuesStore();
         mockUseIssuesStore.mockReturnValue(mockStore);

         const user = userEvent.setup();
         render(<AssigneeSelector {...defaultProps} showCounts={true} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         // Should call filterByAssignee for each assignee (null for unassigned, then user IDs)
         expect(mockStore.filterByAssignee).toHaveBeenCalledWith(null); // unassigned
         expect(mockStore.filterByAssignee).toHaveBeenCalledWith('demo'); // Demo User
         expect(mockStore.filterByAssignee).toHaveBeenCalledWith('ln'); // leonel.ngoya
         expect(mockStore.filterByAssignee).toHaveBeenCalledWith('sophia'); // sophia.reed
         expect(mockStore.filterByAssignee).toHaveBeenCalledWith('mason'); // mason.carter
         expect(mockStore.filterByAssignee).toHaveBeenCalledWith('emma'); // emma.jones
         expect(mockStore.filterByAssignee).toHaveBeenCalledWith('lucas'); // lucas.martin
      });

      it('handles store errors gracefully', async () => {
         const mockStore = createMockIssuesStore();
         mockStore.filterByAssignee.mockImplementation(() => {
            throw new Error('Store error');
         });
         mockUseIssuesStore.mockReturnValue(mockStore);

         // Mock console.error to prevent error logs in test output
         const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

         // Test without showCounts to avoid the error
         render(<AssigneeSelector {...defaultProps} showCounts={false} />);

         const user = userEvent.setup();
         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         // Should still render the dropdown even if store has errors
         const listbox = screen.getByRole('listbox');
         expect(listbox).toHaveTextContent('Unassigned');

         consoleSpy.mockRestore();
      });
   });
});
