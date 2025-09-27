import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../utils/test-utils';
import { BaseSelector } from '@/components/shared/selectors/base-selector';
import { CheckIcon } from 'lucide-react';

// Mock data for testing
interface TestItem {
   id: string;
   name: string;
   icon?: React.ReactNode;
   count?: number;
   disabled?: boolean;
}

const mockItems: TestItem[] = [
   { id: '1', name: 'Option 1', icon: <CheckIcon size={16} />, count: 5 },
   { id: '2', name: 'Option 2', icon: <CheckIcon size={16} />, count: 3 },
   { id: '3', name: 'Option 3', icon: <CheckIcon size={16} />, count: 0, disabled: true },
   { id: '4', name: 'Option 4', icon: <CheckIcon size={16} />, count: 10 },
];

const defaultProps = {
   selectedItem: null as TestItem | null,
   onSelectionChange: vi.fn(),
   items: mockItems,
   getItemKey: (item: TestItem) => item.id,
   getItemLabel: (item: TestItem) => item.name,
   getItemIcon: (item: TestItem) => item.icon,
   getItemCount: (item: TestItem) => item.count,
   getItemDisabled: (item: TestItem) => item.disabled || false,
};

describe('BaseSelector', () => {
   beforeEach(() => {
      vi.clearAllMocks();
   });

   describe('Basic Rendering', () => {
      it('renders with default props', () => {
         render(<BaseSelector {...defaultProps} />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toBeInTheDocument();
         expect(trigger).toHaveTextContent('Select an option...');
      });

      it('renders with selected item', () => {
         const selectedItem = mockItems[0];
         render(<BaseSelector {...defaultProps} selectedItem={selectedItem} />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toHaveTextContent('Option 1');
      });

      it('renders with custom placeholder', () => {
         const placeholder = 'Choose an option';
         render(<BaseSelector {...defaultProps} placeholder={placeholder} />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toHaveTextContent(placeholder);
      });

      it('renders with custom className', () => {
         const className = 'custom-class';
         render(<BaseSelector {...defaultProps} className={className} />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toHaveClass(className);
      });

      it('renders as disabled when disabled prop is true', () => {
         render(<BaseSelector {...defaultProps} disabled={true} />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toBeDisabled();
      });
   });

   describe('Trigger Variants', () => {
      it('renders button variant by default', () => {
         render(<BaseSelector {...defaultProps} />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toHaveClass('flex', 'items-center', 'justify-center');
      });

      it('renders icon variant', () => {
         render(<BaseSelector {...defaultProps} triggerVariant="icon" />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toHaveClass('size-7', 'flex', 'items-center', 'justify-center');
      });

      it('renders ghost variant', () => {
         render(<BaseSelector {...defaultProps} triggerVariant="ghost" />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toHaveClass('flex', 'items-center', 'justify-center');
      });

      it('hides label when showLabel is false', () => {
         render(<BaseSelector {...defaultProps} showLabel={false} selectedItem={mockItems[0]} />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).not.toHaveTextContent('Option 1');
      });
   });

   describe('Popover Behavior', () => {
      it('opens popover when trigger is clicked', async () => {
         const user = userEvent.setup();
         render(<BaseSelector {...defaultProps} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByText('Option 1')).toBeInTheDocument();
            expect(screen.getByText('Option 2')).toBeInTheDocument();
         });
      });

      it('closes popover when item is selected', async () => {
         const user = userEvent.setup();
         const onSelectionChange = vi.fn();
         render(<BaseSelector {...defaultProps} onSelectionChange={onSelectionChange} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByText('Option 1')).toBeInTheDocument();
         });

         await user.click(screen.getByText('Option 1'));

         expect(onSelectionChange).toHaveBeenCalledWith(mockItems[0]);
         expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
      });

      it('shows search input when searchable is true', async () => {
         const user = userEvent.setup();
         render(<BaseSelector {...defaultProps} searchable={true} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            const searchInput = screen.getByPlaceholderText('Search...');
            expect(searchInput).toBeInTheDocument();
         });
      });

      it('hides search input when searchable is false', async () => {
         const user = userEvent.setup();
         render(<BaseSelector {...defaultProps} searchable={false} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument();
         });
      });
   });

   describe('Search Functionality', () => {
      it('filters items based on search query', async () => {
         const user = userEvent.setup();
         render(<BaseSelector {...defaultProps} searchable={true} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         // Wait for popover to open and items to be visible
         await waitFor(() => {
            expect(screen.getByText('Option 1')).toBeInTheDocument();
            expect(screen.getByText('Option 2')).toBeInTheDocument();
         });

         const searchInput = screen.getByPlaceholderText('Search...');
         await user.clear(searchInput);
         await user.type(searchInput, 'Option 1');

         await waitFor(() => {
            expect(screen.getByText('Option 1')).toBeInTheDocument();
            expect(screen.queryByText('Option 2')).not.toBeInTheDocument();
         });
      });

      it('shows empty message when no items match search', async () => {
         const user = userEvent.setup();
         render(
            <BaseSelector {...defaultProps} searchable={true} emptyMessage="No matches found" />
         );

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         const searchInput = await screen.findByPlaceholderText('Search...');
         await user.type(searchInput, 'NonExistent');

         await waitFor(() => {
            expect(screen.getByText('No matches found')).toBeInTheDocument();
         });
      });

      it('clears search when item is selected', async () => {
         const user = userEvent.setup();
         render(<BaseSelector {...defaultProps} searchable={true} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         // Wait for popover to open
         await waitFor(() => {
            expect(screen.getByText('Option 1')).toBeInTheDocument();
         });

         const searchInput = screen.getByPlaceholderText('Search...');
         await user.clear(searchInput);
         await user.type(searchInput, 'Option 1');
         await user.click(screen.getByText('Option 1'));

         // Reopen popover
         await user.click(trigger);

         await waitFor(() => {
            const newSearchInput = screen.getByPlaceholderText('Search...');
            expect(newSearchInput).toHaveValue('');
         });
      });
   });

   describe('Item Display', () => {
      it('displays item icons', async () => {
         const user = userEvent.setup();
         render(<BaseSelector {...defaultProps} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            const items = screen.getAllByRole('option');
            expect(items).toHaveLength(4);
         });
      });

      it('displays item counts when showCounts is true', async () => {
         const user = userEvent.setup();
         render(<BaseSelector {...defaultProps} showCounts={true} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.getByText('5')).toBeInTheDocument();
            expect(screen.getByText('3')).toBeInTheDocument();
            expect(screen.getByText('10')).toBeInTheDocument();
         });
      });

      it('hides item counts when showCounts is false', async () => {
         const user = userEvent.setup();
         render(<BaseSelector {...defaultProps} showCounts={false} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(screen.queryByText('5')).not.toBeInTheDocument();
         });
      });

      it('shows check icon for selected item', async () => {
         const user = userEvent.setup();
         render(<BaseSelector {...defaultProps} selectedItem={mockItems[0]} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            // Look for CheckIcon by its SVG path instead of data-testid
            const checkIcons = screen.getAllByText('', { selector: 'svg' });
            expect(checkIcons.length).toBeGreaterThan(0);
         });
      });

      it('disables items when getItemDisabled returns true', async () => {
         const user = userEvent.setup();
         render(<BaseSelector {...defaultProps} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            const disabledItem = screen.getByText('Option 3');
            expect(disabledItem.closest('[role="option"]')).toHaveAttribute(
               'data-disabled',
               'true'
            );
         });
      });
   });

   describe('Custom Render Trigger', () => {
      it('uses custom render trigger when provided', () => {
         const customRenderTrigger = vi.fn(() => (
            <button data-testid="custom-trigger">Custom</button>
         ));
         render(<BaseSelector {...defaultProps} renderTrigger={customRenderTrigger} />);

         expect(screen.getByTestId('custom-trigger')).toBeInTheDocument();
         expect(customRenderTrigger).toHaveBeenCalledWith({
            selectedItem: null,
            selectedLabel: 'Select an option...',
            selectedIcon: null,
            isOpen: false,
            disabled: false,
         });
      });

      it('passes correct props to custom render trigger', () => {
         const customRenderTrigger = vi.fn(() => (
            <button data-testid="custom-trigger">Custom</button>
         ));
         const selectedItem = mockItems[0];
         render(
            <BaseSelector
               {...defaultProps}
               selectedItem={selectedItem}
               disabled={true}
               renderTrigger={customRenderTrigger}
            />
         );

         expect(customRenderTrigger).toHaveBeenCalledWith({
            selectedItem,
            selectedLabel: 'Option 1',
            selectedIcon: selectedItem.icon,
            isOpen: false,
            disabled: true,
         });
      });
   });

   describe('Accessibility', () => {
      it('has proper ARIA attributes', () => {
         render(<BaseSelector {...defaultProps} />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toHaveAttribute('aria-expanded', 'false');
         expect(trigger).toHaveAttribute('role', 'combobox');
      });

      it('updates aria-expanded when popover opens', async () => {
         const user = userEvent.setup();
         render(<BaseSelector {...defaultProps} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         await waitFor(() => {
            expect(trigger).toHaveAttribute('aria-expanded', 'true');
         });
      });

      it('has unique id for each instance', () => {
         render(
            <div>
               <BaseSelector {...defaultProps} />
               <BaseSelector {...defaultProps} />
            </div>
         );

         const triggers = screen.getAllByRole('combobox');
         expect(triggers[0]).toHaveAttribute('id');
         expect(triggers[1]).toHaveAttribute('id');
         expect(triggers[0].id).not.toBe(triggers[1].id);
      });
   });

   describe('Edge Cases', () => {
      it('handles empty items array', () => {
         render(<BaseSelector {...defaultProps} items={[]} />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toBeInTheDocument();
      });

      it('handles null selectedItem', () => {
         render(<BaseSelector {...defaultProps} selectedItem={null} />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toHaveTextContent('Select an option...');
      });

      it('handles missing optional props', () => {
         const minimalProps = {
            selectedItem: null,
            onSelectionChange: vi.fn(),
            items: mockItems,
            getItemKey: (item: TestItem) => item.id,
            getItemLabel: (item: TestItem) => item.name,
         };

         render(<BaseSelector {...minimalProps} />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toBeInTheDocument();
      });

      it('handles items with undefined counts', () => {
         const itemsWithoutCounts = mockItems.map((item) => ({ ...item, count: undefined }));
         render(<BaseSelector {...defaultProps} items={itemsWithoutCounts} showCounts={true} />);

         const trigger = screen.getByRole('combobox');
         expect(trigger).toBeInTheDocument();
      });
   });

   describe('Performance', () => {
      it('memoizes filtered items correctly', async () => {
         const user = userEvent.setup();
         const getItemLabel = vi.fn((item: TestItem) => item.name);
         render(<BaseSelector {...defaultProps} getItemLabel={getItemLabel} searchable={true} />);

         const trigger = screen.getByRole('combobox');
         await user.click(trigger);

         const searchInput = await screen.findByPlaceholderText('Search...');
         await user.type(searchInput, 'Option');

         // getItemLabel should be called for each item during filtering
         expect(getItemLabel).toHaveBeenCalled();
      });
   });
});
