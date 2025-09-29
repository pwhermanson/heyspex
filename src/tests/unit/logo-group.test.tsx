/**
 * LogoGroup Component Tests
 *
 * Tests for the LogoGroup component to ensure it renders correctly
 * and handles all visual effects properly.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { LogoGroup } from '@/src/components/layout/app-shell-branded/components/logo-group';

// Mock the LogoImage component
vi.mock('@/src/components/layout/app-shell-branded/components/logo-image', () => ({
   LogoImage: ({ src, alt, width, height, priority }: any) => (
      <img
         src={src}
         alt={alt}
         width={width}
         height={height}
         data-priority={priority}
         data-testid="logo-image"
      />
   ),
}));

// Mock the ShadowLayer component
vi.mock('@/src/components/layout/app-shell-branded/shadow', () => ({
   ShadowLayer: ({
      shadowFilter,
      shadowOpacity,
      isShadowFading,
      logoWidth,
      logoHeight,
      logoSrc,
   }: any) => (
      <div
         data-testid="shadow-layer"
         data-shadow-filter={shadowFilter}
         data-shadow-opacity={shadowOpacity}
         data-is-shadow-fading={isShadowFading}
         data-logo-width={logoWidth}
         data-logo-height={logoHeight}
         data-logo-src={logoSrc}
      />
   ),
}));

// Mock the style generators
vi.mock('@/src/components/layout/app-shell-branded/style-generators', () => ({
   COMPONENT_STYLES: {
      explosiveGlow: {
         width: '0px',
         height: '0px',
         borderRadius: '50%',
      },
   },
   STYLE_GENERATORS: {
      getExplosiveGlowBackground: () =>
         'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
   },
}));

// Mock visual constants
vi.mock('@/src/components/layout/app-shell-branded/visual-constants', () => ({
   VISUAL_CONSTANTS: {
      LOGO_Z_INDEX: 10,
      LOGO_WIDTH: 300,
      LOGO_HEIGHT: 273,
      LOGO_BRIGHTNESS_TRANSITION_DURATION: '0.3s',
   },
}));

describe('LogoGroup Component', () => {
   const defaultProps = {
      logoRef: { current: null },
      isMouseOver: false,
      isIdle: false,
      shadowFilter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
      shadowOpacity: 0.5,
      isShadowFading: false,
   };

   it('renders with all required elements', () => {
      render(<LogoGroup {...defaultProps} />);

      // Check that the main container is rendered by looking for the specific class combination
      const container = document.querySelector('.mb-6.group.cursor-pointer.relative');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('mb-6', 'group', 'cursor-pointer', 'relative');

      // Check that logo images are rendered (shadow base and main logo)
      const logoImages = screen.getAllByTestId('logo-image');
      expect(logoImages).toHaveLength(2);

      // Check that shadow layer is rendered
      const shadowLayer = screen.getByTestId('shadow-layer');
      expect(shadowLayer).toBeInTheDocument();
   });

   it('renders shadow base with correct properties', () => {
      render(<LogoGroup {...defaultProps} />);

      const logoImages = screen.getAllByTestId('logo-image');
      const shadowBase = logoImages[0];

      expect(shadowBase).toHaveAttribute('src', '/heyspex-logo-stacked.png');
      expect(shadowBase).toHaveAttribute('alt', '');
      expect(shadowBase).toHaveAttribute('data-priority', 'true');
   });

   it('renders main logo with correct properties', () => {
      render(<LogoGroup {...defaultProps} />);

      const logoImages = screen.getAllByTestId('logo-image');
      const mainLogo = logoImages[1];

      expect(mainLogo).toHaveAttribute('src', '/heyspex-logo-stacked.png');
      expect(mainLogo).toHaveAttribute('alt', 'HeySpex');
      expect(mainLogo).toHaveAttribute('data-priority', 'true');
   });

   it('applies correct brightness filter when mouse is over and not idle', () => {
      render(<LogoGroup {...defaultProps} isMouseOver={true} isIdle={false} />);

      const mainLogoContainer = screen.getAllByTestId('logo-image')[1].closest('div');
      expect(mainLogoContainer).toHaveStyle('filter: brightness(1)');
   });

   it('applies dimmed brightness filter when mouse is not over', () => {
      render(<LogoGroup {...defaultProps} isMouseOver={false} isIdle={false} />);

      const mainLogoContainer = screen.getAllByTestId('logo-image')[1].closest('div');
      expect(mainLogoContainer).toHaveStyle('filter: brightness(0.7)');
   });

   it('applies dimmed brightness filter when idle', () => {
      render(<LogoGroup {...defaultProps} isMouseOver={true} isIdle={true} />);

      const mainLogoContainer = screen.getAllByTestId('logo-image')[1].closest('div');
      expect(mainLogoContainer).toHaveStyle('filter: brightness(0.7)');
   });

   it('passes correct props to ShadowLayer', () => {
      const shadowFilter = 'drop-shadow(4px 4px 8px rgba(0,0,0,0.5))';
      const shadowOpacity = 0.8;
      const isShadowFading = true;

      render(
         <LogoGroup
            {...defaultProps}
            shadowFilter={shadowFilter}
            shadowOpacity={shadowOpacity}
            isShadowFading={isShadowFading}
         />
      );

      const shadowLayer = screen.getByTestId('shadow-layer');
      expect(shadowLayer).toHaveAttribute('data-shadow-filter', shadowFilter);
      expect(shadowLayer).toHaveAttribute('data-shadow-opacity', shadowOpacity.toString());
      expect(shadowLayer).toHaveAttribute('data-is-shadow-fading', isShadowFading.toString());
      expect(shadowLayer).toHaveAttribute('data-logo-width', '300');
      expect(shadowLayer).toHaveAttribute('data-logo-height', '273');
      expect(shadowLayer).toHaveAttribute('data-logo-src', '/heyspex-logo-stacked.png');
   });

   it('applies custom className when provided', () => {
      const customClass = 'custom-logo-group';
      render(<LogoGroup {...defaultProps} className={customClass} />);

      const container = document.querySelector('.mb-6.group.cursor-pointer.relative');
      expect(container).toHaveClass('mb-6', 'group', 'cursor-pointer', 'relative', customClass);
   });

   it('renders explosive glow element with correct classes', () => {
      render(<LogoGroup {...defaultProps} />);

      const explosiveGlow = document.querySelector('.radial-glow-explosion');
      expect(explosiveGlow).toBeInTheDocument();
      expect(explosiveGlow).toHaveClass('group-hover:radial-glow-explosion-active');
   });

   it('applies correct z-index styling', () => {
      render(<LogoGroup {...defaultProps} />);

      const container = document.querySelector('.mb-6.group.cursor-pointer.relative');
      expect(container).toHaveStyle('z-index: 10');
   });
});
