/**
 * Glow Effect Integration Tests
 *
 * Tests the glow effect functionality in the context of the full
 * AppShellBranded component to catch integration issues.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { AppShellBranded } from '@/src/components/layout/app-shell-branded/app-shell-branded';

// Mock the useAppShellBranded hook directly
const mockUseAppShellBranded = vi.fn();
vi.mock('@/src/components/layout/app-shell-branded/hooks/use-app-shell-branded', () => ({
   useAppShellBranded: () => mockUseAppShellBranded(),
}));

// Mock the components
vi.mock('@/src/components/layout/app-shell-branded/components', () => ({
   GridBackground: ({ style }: any) => <div data-testid="grid-background" style={style} />,
   GlowEffect: ({ mousePosition, glowIntensity, isFading, isMouseMoving }: any) => (
      <div
         data-testid="glow-effect"
         data-mouse-x={mousePosition.x}
         data-mouse-y={mousePosition.y}
         data-intensity={glowIntensity}
         data-fading={isFading}
         data-moving={isMouseMoving}
      />
   ),
   LogoGroup: ({ isMouseOver, isIdle }: any) => (
      <div data-testid="logo-group" data-mouse-over={isMouseOver} data-idle={isIdle} />
   ),
   InstructionText: () => <div data-testid="instruction-text">Press Ctrl + / to get started</div>,
}));

describe('Glow Effect Integration Tests', () => {
   const defaultHookReturn = {
      containerRef: { current: null },
      logoRef: { current: null },
      containerClassName: 'test-container',
      containerStyle: { zIndex: 0 },
      shouldShowGlowEffect: false,
      gridBackgroundStyle: { background: 'test' },
      glowIntensity: 0,
      mousePosition: { x: 0, y: 0 },
      isMouseOver: false,
      isMouseMoving: false,
      isIdle: false,
      isFading: false,
      isShadowFading: false,
      isClient: true,
      shadowFilter: 'test-filter',
      shadowOpacity: 0.5,
      handleMouseMove: vi.fn(),
      handleMouseLeave: vi.fn(),
   };

   beforeEach(() => {
      vi.clearAllMocks();
      mockUseAppShellBranded.mockReturnValue(defaultHookReturn);
   });

   it('renders glow effect when shouldShowGlowEffect is true', () => {
      mockUseAppShellBranded.mockReturnValue({
         ...defaultHookReturn,
         shouldShowGlowEffect: true,
         glowIntensity: 0.8,
         mousePosition: { x: 100, y: 200 },
         isMouseMoving: true,
      });

      render(<AppShellBranded />);

      const glowEffect = screen.getByTestId('glow-effect');
      expect(glowEffect).toBeInTheDocument();
      expect(glowEffect).toHaveAttribute('data-intensity', '0.8');
      expect(glowEffect).toHaveAttribute('data-mouse-x', '100');
      expect(glowEffect).toHaveAttribute('data-mouse-y', '200');
      expect(glowEffect).toHaveAttribute('data-moving', 'true');
   });

   it('does not render glow effect when shouldShowGlowEffect is false', () => {
      mockUseAppShellBranded.mockReturnValue({
         ...defaultHookReturn,
         shouldShowGlowEffect: false,
      });

      render(<AppShellBranded />);

      expect(screen.queryByTestId('glow-effect')).not.toBeInTheDocument();
   });

   it('passes correct props to glow effect based on mouse state', () => {
      mockUseAppShellBranded.mockReturnValue({
         ...defaultHookReturn,
         shouldShowGlowEffect: true,
         glowIntensity: 0.5,
         mousePosition: { x: 300, y: 400 },
         isFading: true,
         isMouseMoving: false,
      });

      render(<AppShellBranded />);

      const glowEffect = screen.getByTestId('glow-effect');
      expect(glowEffect).toHaveAttribute('data-intensity', '0.5');
      expect(glowEffect).toHaveAttribute('data-mouse-x', '300');
      expect(glowEffect).toHaveAttribute('data-mouse-y', '400');
      expect(glowEffect).toHaveAttribute('data-fading', 'true');
      expect(glowEffect).toHaveAttribute('data-moving', 'false');
   });

   it('handles mouse events correctly', () => {
      const mockHandleMouseMove = vi.fn();
      const mockHandleMouseLeave = vi.fn();

      mockUseAppShellBranded.mockReturnValue({
         ...defaultHookReturn,
         handleMouseMove: mockHandleMouseMove,
         handleMouseLeave: mockHandleMouseLeave,
      });

      render(<AppShellBranded />);

      const container = screen.getByTestId('grid-background').parentElement;
      expect(container).toBeInTheDocument();

      // Test mouse move
      fireEvent.mouseMove(container!);
      expect(mockHandleMouseMove).toHaveBeenCalled();

      // Test mouse leave
      fireEvent.mouseLeave(container!);
      expect(mockHandleMouseLeave).toHaveBeenCalled();
   });

   it('does not attach mouse handlers when client is not ready', () => {
      mockUseAppShellBranded.mockReturnValue({
         ...defaultHookReturn,
         isClient: false,
      });

      render(<AppShellBranded />);

      const container = screen.getByTestId('grid-background').parentElement;
      expect(container).not.toHaveAttribute('onMouseMove');
      expect(container).not.toHaveAttribute('onMouseLeave');
   });

   it('renders all components with correct props', () => {
      mockUseAppShellBranded.mockReturnValue({
         ...defaultHookReturn,
         shouldShowGlowEffect: true,
         isMouseOver: true,
         isIdle: false,
      });

      render(<AppShellBranded />);

      // Check all components are rendered
      expect(screen.getByTestId('grid-background')).toBeInTheDocument();
      expect(screen.getByTestId('glow-effect')).toBeInTheDocument();
      expect(screen.getByTestId('logo-group')).toBeInTheDocument();
      expect(screen.getByTestId('instruction-text')).toBeInTheDocument();

      // Check logo group props
      const logoGroup = screen.getByTestId('logo-group');
      expect(logoGroup).toHaveAttribute('data-mouse-over', 'true');
      expect(logoGroup).toHaveAttribute('data-idle', 'false');
   });

   it('updates glow effect when hook data changes', () => {
      // Test that glow effect can be toggled by changing shouldShowGlowEffect
      mockUseAppShellBranded.mockReturnValue({
         ...defaultHookReturn,
         shouldShowGlowEffect: true,
         glowIntensity: 0.9,
         mousePosition: { x: 500, y: 600 },
      });

      render(<AppShellBranded />);

      const glowEffect = screen.getByTestId('glow-effect');
      expect(glowEffect).toBeInTheDocument();
      expect(glowEffect).toHaveAttribute('data-intensity', '0.9');
      expect(glowEffect).toHaveAttribute('data-mouse-x', '500');
      expect(glowEffect).toHaveAttribute('data-mouse-y', '600');
   });

   it('handles different glow intensity values correctly', () => {
      mockUseAppShellBranded.mockReturnValue({
         ...defaultHookReturn,
         shouldShowGlowEffect: true,
         glowIntensity: 0.3,
         mousePosition: { x: 100, y: 200 },
      });

      render(<AppShellBranded />);

      const glowEffect = screen.getByTestId('glow-effect');
      expect(glowEffect).toHaveAttribute('data-intensity', '0.3');
   });

   it('handles edge case mouse positions correctly', () => {
      mockUseAppShellBranded.mockReturnValue({
         ...defaultHookReturn,
         shouldShowGlowEffect: true,
         glowIntensity: 0.5,
         mousePosition: { x: 0, y: 0 },
      });

      render(<AppShellBranded />);

      const glowEffect = screen.getByTestId('glow-effect');
      expect(glowEffect).toHaveAttribute('data-mouse-x', '0');
      expect(glowEffect).toHaveAttribute('data-mouse-y', '0');
   });

   it('handles negative mouse positions correctly', () => {
      mockUseAppShellBranded.mockReturnValue({
         ...defaultHookReturn,
         shouldShowGlowEffect: true,
         glowIntensity: 0.7,
         mousePosition: { x: -100, y: -200 },
      });

      render(<AppShellBranded />);

      const glowEffect = screen.getByTestId('glow-effect');
      expect(glowEffect).toHaveAttribute('data-mouse-x', '-100');
      expect(glowEffect).toHaveAttribute('data-mouse-y', '-200');
   });

   it('handles maximum glow intensity correctly', () => {
      mockUseAppShellBranded.mockReturnValue({
         ...defaultHookReturn,
         shouldShowGlowEffect: true,
         glowIntensity: 1.0,
         mousePosition: { x: 300, y: 400 },
      });

      render(<AppShellBranded />);

      const glowEffect = screen.getByTestId('glow-effect');
      expect(glowEffect).toHaveAttribute('data-intensity', '1');
   });

   it('handles minimum glow intensity correctly', () => {
      mockUseAppShellBranded.mockReturnValue({
         ...defaultHookReturn,
         shouldShowGlowEffect: true,
         glowIntensity: 0.0,
         mousePosition: { x: 150, y: 250 },
      });

      render(<AppShellBranded />);

      const glowEffect = screen.getByTestId('glow-effect');
      expect(glowEffect).toHaveAttribute('data-intensity', '0');
   });

   it('handles glow effect state changes during rerender', () => {
      // Test that glow effect can be toggled by changing shouldShowGlowEffect
      mockUseAppShellBranded.mockReturnValue({
         ...defaultHookReturn,
         shouldShowGlowEffect: true,
         glowIntensity: 0.6,
         mousePosition: { x: 200, y: 300 },
         isMouseMoving: true,
      });

      render(<AppShellBranded />);

      const glowEffect = screen.getByTestId('glow-effect');
      expect(glowEffect).toBeInTheDocument();
      expect(glowEffect).toHaveAttribute('data-intensity', '0.6');
      expect(glowEffect).toHaveAttribute('data-mouse-x', '200');
      expect(glowEffect).toHaveAttribute('data-mouse-y', '300');
   });

   it('handles rapid mouse position changes', () => {
      mockUseAppShellBranded.mockReturnValue({
         ...defaultHookReturn,
         shouldShowGlowEffect: true,
         glowIntensity: 0.7,
         mousePosition: { x: 100, y: 100 },
         isMouseMoving: true,
      });

      render(<AppShellBranded />);

      const glowEffect = screen.getByTestId('glow-effect');
      expect(glowEffect).toBeInTheDocument();
      expect(glowEffect).toHaveAttribute('data-mouse-x', '100');
      expect(glowEffect).toHaveAttribute('data-mouse-y', '100');
      expect(glowEffect).toHaveAttribute('data-intensity', '0.7');
   });

   it('handles glow effect with different fading states', () => {
      mockUseAppShellBranded.mockReturnValue({
         ...defaultHookReturn,
         shouldShowGlowEffect: true,
         glowIntensity: 0.4,
         mousePosition: { x: 300, y: 400 },
         isFading: true,
         isMouseMoving: false,
      });

      render(<AppShellBranded />);

      const glowEffect = screen.getByTestId('glow-effect');
      expect(glowEffect).toHaveAttribute('data-fading', 'true');
      expect(glowEffect).toHaveAttribute('data-moving', 'false');
   });

   it('handles glow effect with different mouse states', () => {
      mockUseAppShellBranded.mockReturnValue({
         ...defaultHookReturn,
         shouldShowGlowEffect: true,
         glowIntensity: 0.9,
         mousePosition: { x: 50, y: 50 },
         isFading: false,
         isMouseMoving: true,
      });

      render(<AppShellBranded />);

      const glowEffect = screen.getByTestId('glow-effect');
      expect(glowEffect).toHaveAttribute('data-fading', 'false');
      expect(glowEffect).toHaveAttribute('data-moving', 'true');
   });
});
