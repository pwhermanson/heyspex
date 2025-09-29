/**
 * InstructionText Component Tests
 *
 * Tests for the InstructionText component to ensure it renders correctly
 * and handles different text inputs properly.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { InstructionText } from '@/src/components/layout/app-shell-branded/components/instruction-text';

describe('InstructionText Component', () => {
   it('renders default instruction text with keyboard shortcuts', () => {
      render(<InstructionText />);

      // Test that the paragraph contains the expected text
      const paragraph = screen.getByRole('paragraph');
      expect(paragraph).toHaveTextContent('Press Ctrl + / to get started');
      expect(screen.getByText('Ctrl')).toBeInTheDocument();
      expect(screen.getByText('/')).toBeInTheDocument();
   });

   it('renders custom instruction text when provided', () => {
      const customText = 'Click here to begin';
      render(<InstructionText text={customText} />);

      expect(screen.getByText(customText)).toBeInTheDocument();
      expect(screen.queryByText('Ctrl')).not.toBeInTheDocument();
   });

   it('applies custom className when provided', () => {
      const customClass = 'custom-instruction-class';
      render(<InstructionText className={customClass} />);

      const container = screen.getByRole('paragraph').closest('div');
      expect(container).toHaveClass('text-center', 'relative', 'z-10', customClass);
   });

   it('renders keyboard shortcuts with proper styling', () => {
      render(<InstructionText />);

      const ctrlKey = screen.getByText('Ctrl');
      const slashKey = screen.getByText('/');

      expect(ctrlKey.tagName).toBe('KBD');
      expect(slashKey.tagName).toBe('KBD');
   });

   it('handles text without Ctrl keyword correctly', () => {
      const textWithoutCtrl = 'Just some regular text';
      render(<InstructionText text={textWithoutCtrl} />);

      expect(screen.getByText(textWithoutCtrl)).toBeInTheDocument();
      expect(screen.queryByText('Ctrl')).not.toBeInTheDocument();
   });
});
