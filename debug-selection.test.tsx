import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from './src/tests/utils/test-utils';
import { ProjectSelector } from './src/components/shared/selectors/project-selector';
import { projects } from './src/tests/test-data/projects';
import { createMockIssuesStore } from './src/tests/utils/mock-issues-store';

// Mock the issues store
vi.mock('./src/state/store/issues-store', () => ({
   useIssuesStore: vi.fn(),
}));

const mockUseIssuesStore = vi.mocked(useIssuesStore);

describe('Debug Selection', () => {
   beforeEach(() => {
      vi.clearAllMocks();
      mockUseIssuesStore.mockReturnValue(createMockIssuesStore());
   });

   it('should debug selection behavior', async () => {
      const onSelectionChange = vi.fn();
      const user = userEvent.setup();

      render(<ProjectSelector selectedItem={undefined} onSelectionChange={onSelectionChange} />);

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
         expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      // Debug: Log the DOM structure
      const listbox = screen.getByRole('listbox');
      console.log('Listbox HTML:', listbox.innerHTML);

      // Try to find and click the first option
      const firstOption = screen.getByText('No Project');
      console.log('First option element:', firstOption);
      console.log('First option parent:', firstOption.parentElement);

      await user.click(firstOption);

      console.log('onSelectionChange calls:', onSelectionChange.mock.calls);
      expect(onSelectionChange).toHaveBeenCalled();
   });
});
