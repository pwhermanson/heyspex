/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import {
   PrioritySelector,
   StatusSelector,
   AssigneeSelector,
   ProjectSelector,
   LabelSelector,
} from '../index';
import { priorities } from '@/tests/test-data/priorities';
import { status as allStatus } from '@/tests/test-data/status';
import { users } from '@/tests/test-data/users';
import { labels } from '@/tests/test-data/labels';

// Mock the issues store
vi.mock('@/state/issues-store', () => ({
   useIssuesStore: () => ({
      filterByPriority: vi.fn(() => []),
      filterByStatus: vi.fn(() => []),
      filterByAssignee: vi.fn(() => []),
      filterByProject: vi.fn(() => []),
      filterByLabel: vi.fn(() => []),
   }),
}));

describe('Selector Consolidation', () => {
   describe('PrioritySelector', () => {
      it('renders with correct props', () => {
         const mockOnChange = vi.fn();
         render(
            <PrioritySelector
               selectedItem={priorities[0]}
               onSelectionChange={mockOnChange}
               showCounts={true}
               triggerVariant="button"
            />
         );

         expect(screen.getByRole('combobox')).toBeInTheDocument();
         expect(screen.getByText(priorities[0].name)).toBeInTheDocument();
      });

      it('handles selection change', () => {
         const mockOnChange = vi.fn();
         render(<PrioritySelector selectedItem={priorities[0]} onSelectionChange={mockOnChange} />);

         fireEvent.click(screen.getByRole('combobox'));
         fireEvent.click(screen.getByText(priorities[1].name));

         expect(mockOnChange).toHaveBeenCalledWith(priorities[1]);
      });
   });

   describe('StatusSelector', () => {
      it('renders with correct props', () => {
         const mockOnChange = vi.fn();
         render(
            <StatusSelector
               selectedItem={allStatus[0]}
               onSelectionChange={mockOnChange}
               showCounts={true}
               triggerVariant="icon"
            />
         );

         expect(screen.getByRole('combobox')).toBeInTheDocument();
      });
   });

   describe('AssigneeSelector', () => {
      it('renders with unassigned option', () => {
         const mockOnChange = vi.fn();
         render(
            <AssigneeSelector
               selectedItem={null}
               onSelectionChange={mockOnChange}
               showCounts={true}
            />
         );

         expect(screen.getByRole('combobox')).toBeInTheDocument();
         expect(screen.getByText('Unassigned')).toBeInTheDocument();
      });

      it('renders with selected user', () => {
         const mockOnChange = vi.fn();
         render(<AssigneeSelector selectedItem={users[0]} onSelectionChange={mockOnChange} />);

         expect(screen.getByText(users[0].name)).toBeInTheDocument();
      });
   });

   describe('ProjectSelector', () => {
      it('renders with no project option', () => {
         const mockOnChange = vi.fn();
         render(
            <ProjectSelector
               selectedItem={undefined}
               onSelectionChange={mockOnChange}
               showCounts={true}
            />
         );

         expect(screen.getByRole('combobox')).toBeInTheDocument();
         expect(screen.getByText('No Project')).toBeInTheDocument();
      });
   });

   describe('LabelSelector', () => {
      it('renders with multi-select functionality', () => {
         const mockOnChange = vi.fn();
         render(
            <LabelSelector selectedLabels={[labels[0]]} onChange={mockOnChange} showCounts={true} />
         );

         expect(screen.getByRole('combobox')).toBeInTheDocument();
      });
   });

   describe('API Consistency', () => {
      it('all selectors support showCounts prop', () => {
         const mockOnChange = vi.fn();

         const { rerender } = render(
            <PrioritySelector
               selectedItem={priorities[0]}
               onSelectionChange={mockOnChange}
               showCounts={true}
            />
         );

         expect(screen.getByRole('combobox')).toBeInTheDocument();

         rerender(
            <StatusSelector
               selectedItem={allStatus[0]}
               onSelectionChange={mockOnChange}
               showCounts={true}
            />
         );

         expect(screen.getByRole('combobox')).toBeInTheDocument();
      });

      it('all selectors support searchable prop', () => {
         const mockOnChange = vi.fn();

         const { rerender } = render(
            <PrioritySelector
               selectedItem={priorities[0]}
               onSelectionChange={mockOnChange}
               searchable={true}
            />
         );

         fireEvent.click(screen.getByRole('combobox'));
         expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();

         rerender(
            <StatusSelector
               selectedItem={allStatus[0]}
               onSelectionChange={mockOnChange}
               searchable={true}
            />
         );

         fireEvent.click(screen.getByRole('combobox'));
         expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
      });

      it('all selectors support trigger variants', () => {
         const mockOnChange = vi.fn();

         const variants = ['button', 'icon', 'ghost'] as const;

         variants.forEach((variant) => {
            const { unmount } = render(
               <PrioritySelector
                  selectedItem={priorities[0]}
                  onSelectionChange={mockOnChange}
                  triggerVariant={variant}
               />
            );

            expect(screen.getByRole('combobox')).toBeInTheDocument();
            unmount();
         });
      });
   });
});
