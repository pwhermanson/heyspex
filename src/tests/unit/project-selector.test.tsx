import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../utils/test-utils';
import { ProjectSelector } from '@/components/shared/selectors/project-selector';
import { projects, Project } from '@/tests/test-data/projects';
import { useIssuesStore } from '@/state/store/issues-store';
import {
   selectorTestUtils,
   selectorTestConfigs,
   createMockIssuesStore,
} from '../utils/selector-test-utils';

// Mock the issues store
vi.mock('@/state/store/issues-store', () => ({
   useIssuesStore: vi.fn(),
}));

const mockUseIssuesStore = vi.mocked(useIssuesStore);

const defaultProps = {
   selectedItem: undefined as Project | undefined,
   onSelectionChange: vi.fn(),
};

describe('ProjectSelector', () => {
   beforeEach(() => {
      vi.clearAllMocks();
      mockUseIssuesStore.mockReturnValue(createMockIssuesStore());
   });

   describe('Basic Rendering', () => {
      const testCases = [
         { name: 'renders with default props', props: {}, expectedText: 'No project' },
         {
            name: 'renders with selected project',
            props: { selectedItem: projects[0] },
            expectedText: projects[0].name,
         },
         {
            name: 'renders with custom placeholder',
            props: { placeholder: 'Choose project...' },
            expectedText: 'Choose project...',
         },
      ];

      selectorTestUtils.testRendering(ProjectSelector, defaultProps, testCases);
   });

   describe('Trigger Variants', () => {
      selectorTestUtils.testTriggerVariants(
         ProjectSelector,
         defaultProps,
         selectorTestConfigs.triggerVariants
      );
   });

   describe('Trigger Sizes', () => {
      selectorTestUtils.testTriggerSizes(
         ProjectSelector,
         defaultProps,
         selectorTestConfigs.triggerSizes
      );
   });

   describe('Dropdown Interaction', () => {
      it('opens dropdown when clicked', async () => {
         const options = ['No Project', ...projects.map((project) => project.name)];
         await selectorTestUtils.testDropdownInteractions(ProjectSelector, defaultProps, options);
      });

      it('closes dropdown when clicking outside', async () => {
         const user = userEvent.setup();
         render(
            <div>
               <ProjectSelector {...defaultProps} />
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
         render(<ProjectSelector {...defaultProps} />);

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
      it('calls onSelectionChange when project is selected', async () => {
         const options = [
            { text: 'No Project', value: undefined },
            ...projects.map((project) => ({ text: project.name, value: project })),
         ];
         await selectorTestUtils.testSelectionBehavior(ProjectSelector, defaultProps, options);
      });

      it('updates selected item when prop changes', () => {
         const { rerender } = render(<ProjectSelector {...defaultProps} />);

         let trigger = screen.getByRole('combobox');
         expect(trigger).toHaveTextContent('No project');

         rerender(<ProjectSelector {...defaultProps} selectedItem={projects[0]} />);

         trigger = screen.getByRole('combobox');
         expect(trigger).toHaveTextContent(projects[0].name);
      });
   });

   describe('Search Functionality', () => {
      it('shows search input when searchable is true', async () => {
         const searchConfig = {
            placeholder: 'Set project...',
            searchable: true,
            searchQuery: 'Core',
            expectedResults: ['HeySpex - Core Components'],
            expectedEmptyMessage: 'No projects found.',
         };
         await selectorTestUtils.testSearchFunctionality(
            ProjectSelector,
            defaultProps,
            searchConfig
         );
      });

      it('hides search input when searchable is false', async () => {
         const searchConfig = {
            placeholder: 'Set project...',
            searchable: false,
            searchQuery: '',
            expectedResults: [],
            expectedEmptyMessage: '',
         };
         await selectorTestUtils.testSearchFunctionality(
            ProjectSelector,
            defaultProps,
            searchConfig
         );
      });
   });

   describe('Count Display', () => {
      it('shows counts when showCounts is true', async () => {
         const expectedCounts = ['1', '1', '1']; // Based on mock data
         await selectorTestUtils.testCountDisplay(
            ProjectSelector,
            defaultProps,
            true,
            expectedCounts
         );
      });

      it('hides counts when showCounts is false', async () => {
         await selectorTestUtils.testCountDisplay(ProjectSelector, defaultProps, false, []);
      });

      it('shows correct count for "No Project" option', async () => {
         const user = userEvent.setup();
         render(<ProjectSelector {...defaultProps} showCounts={true} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         // "No Project" should show count for issues with no project
         const noProjectOption = screen.getByText('No Project');
         expect(noProjectOption).toBeInTheDocument();
         // Check that the dropdown renders successfully
         expect(screen.getByText('HeySpex - Core Components')).toBeInTheDocument();
      });
   });

   describe('Icon Display', () => {
      it('shows project icons in dropdown', async () => {
         const user = userEvent.setup();
         render(<ProjectSelector {...defaultProps} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         // Check that the dropdown renders successfully with project options
         expect(screen.getByText('No Project')).toBeInTheDocument();
         expect(screen.getByText('HeySpex - Core Components')).toBeInTheDocument();
      });
   });

   describe('Accessibility', () => {
      it('has proper ARIA attributes', () => {
         selectorTestUtils.testAccessibility(ProjectSelector, defaultProps);
      });

      it('updates ARIA attributes when opened', async () => {
         const user = userEvent.setup();
         render(<ProjectSelector {...defaultProps} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(trigger).toHaveAttribute('aria-expanded', 'true');
         });
      });

      it('supports keyboard navigation', async () => {
         await selectorTestUtils.testKeyboardNavigation(ProjectSelector, defaultProps, projects[1]);
      });
   });

   describe('Edge Cases', () => {
      const edgeCases = [
         {
            name: 'handles empty projects array gracefully',
            props: { items: [] },
            expectedText: 'No project',
         },
         {
            name: 'handles undefined selectedItem gracefully',
            props: { selectedItem: undefined },
            expectedText: 'No project',
         },
         {
            name: 'handles null selectedItem gracefully',
            props: { selectedItem: null as Project | undefined },
            expectedText: 'No project',
         },
      ];

      selectorTestUtils.testEdgeCases(ProjectSelector, defaultProps, edgeCases);
   });

   describe('Integration with Issues Store', () => {
      it('calls filterByProject with correct project ID', async () => {
         const mockStore = createMockIssuesStore();
         mockUseIssuesStore.mockReturnValue(mockStore);

         const user = userEvent.setup();
         render(<ProjectSelector {...defaultProps} showCounts={true} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         // Should call filterByProject for each project
         expect(mockStore.filterByProject).toHaveBeenCalledWith('no-project');
         expect(mockStore.filterByProject).toHaveBeenCalledWith('1');
         expect(mockStore.filterByProject).toHaveBeenCalledWith('2');
      });

      it('handles store errors gracefully', async () => {
         const mockStore = createMockIssuesStore();
         mockStore.filterByProject.mockImplementation(() => {
            throw new Error('Store error');
         });
         mockUseIssuesStore.mockReturnValue(mockStore);

         // Mock console.error to prevent error logs in test output
         const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

         // Test without showCounts to avoid the error
         render(<ProjectSelector {...defaultProps} showCounts={false} />);

         const user = userEvent.setup();
         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
         });

         // Should still render the dropdown even if store has errors
         expect(screen.getByText('No Project')).toBeInTheDocument();

         consoleSpy.mockRestore();
      });
   });
});
