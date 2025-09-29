/**
 * LogoImage Component Tests
 *
 * Tests for the LogoImage component to ensure it renders correctly
 * and handles all props properly.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { LogoImage } from '@/src/components/layout/app-shell-branded/components/logo-image';

// Mock Next.js Image component
vi.mock('next/image', () => ({
   default: function MockImage({ src, alt, width, height, className, priority, srcSet }: any) {
      return (
         <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={className}
            data-priority={priority}
            data-srcset={srcSet}
         />
      );
   },
}));

describe('LogoImage Component', () => {
   const defaultProps = {
      src: '/test-logo.png',
      alt: 'Test Logo',
      width: 300,
      height: 273,
   };

   it('renders with required props', () => {
      render(<LogoImage {...defaultProps} />);

      const image = screen.getByAltText('Test Logo');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/test-logo.png');
      expect(image).toHaveAttribute('width', '300');
      expect(image).toHaveAttribute('height', '273');
   });

   it('applies default className styling', () => {
      render(<LogoImage {...defaultProps} />);

      const image = screen.getByAltText('Test Logo');
      expect(image).toHaveClass('h-auto', 'w-auto', 'max-w-[300px]');
   });

   it('applies custom className when provided', () => {
      const customClass = 'custom-logo-class';
      render(<LogoImage {...defaultProps} className={customClass} />);

      const image = screen.getByAltText('Test Logo');
      expect(image).toHaveClass('h-auto', 'w-auto', 'max-w-[300px]', customClass);
   });

   it('sets priority attribute when priority is true', () => {
      render(<LogoImage {...defaultProps} priority={true} />);

      const image = screen.getByAltText('Test Logo');
      expect(image).toHaveAttribute('data-priority', 'true');
   });

   it('does not set priority attribute when priority is false', () => {
      render(<LogoImage {...defaultProps} priority={false} />);

      const image = screen.getByAltText('Test Logo');
      expect(image).toHaveAttribute('data-priority', 'false');
   });

   it('applies srcSet when provided', () => {
      const srcSet = '/test-logo-2x.png 2x, /test-logo-3x.png 3x';
      render(<LogoImage {...defaultProps} logoSrcSet={srcSet} />);

      const image = screen.getByAltText('Test Logo');
      expect(image).toHaveAttribute('data-srcset', srcSet);
   });

   it('handles different image sources', () => {
      const customSrc = '/custom-logo.svg';
      render(<LogoImage {...defaultProps} src={customSrc} />);

      const image = screen.getByAltText('Test Logo');
      expect(image).toHaveAttribute('src', customSrc);
   });

   it('handles different dimensions', () => {
      render(<LogoImage {...defaultProps} width={400} height={300} />);

      const image = screen.getByAltText('Test Logo');
      expect(image).toHaveAttribute('width', '400');
      expect(image).toHaveAttribute('height', '300');
   });

   it('handles different alt text', () => {
      const customAlt = 'Custom Alt Text';
      render(<LogoImage {...defaultProps} alt={customAlt} />);

      const image = screen.getByAltText(customAlt);
      expect(image).toBeInTheDocument();
   });
});
