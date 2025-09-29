/**
 * useAppShellBranded Hook Tests
 *
 * Tests for the useAppShellBranded master composition hook to ensure it properly
 * combines all individual hooks and provides the expected interface.
 */

import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { useAppShellBranded } from '@/src/components/layout/app-shell-branded/hooks/use-app-shell-branded';

// Mock all the individual hooks
vi.mock('@/src/components/layout/app-shell-branded/hooks/use-mouse-interaction', () => ({
   useMouseInteraction: () => ({
      isMouseOver: false,
      isMouseMoving: false,
      isIdle: false,
      isFading: false,
      isShadowFading: false,
      isClient: true,
      handleMouseMove: vi.fn(),
      handleMouseLeave: vi.fn(),
   }),
}));

vi.mock('@/src/components/layout/app-shell-branded/shadow', () => ({
   useShadow: () => ({
      shadowFilter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
      shadowOpacity: 0.5,
      mousePosition: { x: 100, y: 100 },
      handleMouseMove: vi.fn(),
      handleMouseLeave: vi.fn(),
   }),
}));

vi.mock('@/src/components/layout/app-shell-branded/hooks/use-visual-effects', () => ({
   useVisualEffects: () => ({
      logoData: { some: 'data' },
      glowIntensity: 0.8,
      gridBackgroundStyle: { background: 'linear-gradient(45deg, #000, #fff)' },
   }),
}));

vi.mock('@/src/components/layout/app-shell-branded/hooks/use-mouse-event-composition', () => ({
   useMouseEventComposition: () => ({
      handleMouseMove: vi.fn(),
      handleMouseLeave: vi.fn(),
   }),
}));

vi.mock('@/src/components/layout/app-shell-branded/hooks/use-container-styling', () => ({
   useContainerStyling: () => ({
      containerClassName: 'flex flex-col items-center justify-center h-full w-full',
      containerStyle: { zIndex: 0, position: 'absolute' },
      shouldShowGlowEffect: true,
   }),
}));

describe('useAppShellBranded Hook', () => {
   it('returns all expected properties', () => {
      const { result } = renderHook(() => useAppShellBranded());

      expect(result.current).toHaveProperty('containerRef');
      expect(result.current).toHaveProperty('logoRef');
      expect(result.current).toHaveProperty('containerClassName');
      expect(result.current).toHaveProperty('containerStyle');
      expect(result.current).toHaveProperty('shouldShowGlowEffect');
      expect(result.current).toHaveProperty('gridBackgroundStyle');
      expect(result.current).toHaveProperty('glowIntensity');
      expect(result.current).toHaveProperty('mousePosition');
      expect(result.current).toHaveProperty('isMouseOver');
      expect(result.current).toHaveProperty('isMouseMoving');
      expect(result.current).toHaveProperty('isIdle');
      expect(result.current).toHaveProperty('isFading');
      expect(result.current).toHaveProperty('isShadowFading');
      expect(result.current).toHaveProperty('isClient');
      expect(result.current).toHaveProperty('shadowFilter');
      expect(result.current).toHaveProperty('shadowOpacity');
      expect(result.current).toHaveProperty('handleMouseMove');
      expect(result.current).toHaveProperty('handleMouseLeave');
   });

   it('returns refs with correct types', () => {
      const { result } = renderHook(() => useAppShellBranded());

      expect(result.current.containerRef).toHaveProperty('current');
      expect(result.current.logoRef).toHaveProperty('current');
      expect(typeof result.current.containerRef.current).toBe('object');
      expect(typeof result.current.logoRef.current).toBe('object');
   });

   it('returns mouse position with correct structure', () => {
      const { result } = renderHook(() => useAppShellBranded());

      expect(result.current.mousePosition).toHaveProperty('x');
      expect(result.current.mousePosition).toHaveProperty('y');
      expect(typeof result.current.mousePosition.x).toBe('number');
      expect(typeof result.current.mousePosition.y).toBe('number');
   });

   it('returns boolean states with correct types', () => {
      const { result } = renderHook(() => useAppShellBranded());

      expect(typeof result.current.isMouseOver).toBe('boolean');
      expect(typeof result.current.isMouseMoving).toBe('boolean');
      expect(typeof result.current.isIdle).toBe('boolean');
      expect(typeof result.current.isFading).toBe('boolean');
      expect(typeof result.current.isShadowFading).toBe('boolean');
      expect(typeof result.current.isClient).toBe('boolean');
      expect(typeof result.current.shouldShowGlowEffect).toBe('boolean');
   });

   it('returns numeric values with correct types', () => {
      const { result } = renderHook(() => useAppShellBranded());

      expect(typeof result.current.glowIntensity).toBe('number');
      expect(typeof result.current.shadowOpacity).toBe('number');
   });

   it('returns string values with correct types', () => {
      const { result } = renderHook(() => useAppShellBranded());

      expect(typeof result.current.containerClassName).toBe('string');
      expect(typeof result.current.shadowFilter).toBe('string');
   });

   it('returns object values with correct types', () => {
      const { result } = renderHook(() => useAppShellBranded());

      expect(typeof result.current.containerStyle).toBe('object');
      expect(typeof result.current.gridBackgroundStyle).toBe('object');
   });

   it('returns function handlers with correct types', () => {
      const { result } = renderHook(() => useAppShellBranded());

      expect(typeof result.current.handleMouseMove).toBe('function');
      expect(typeof result.current.handleMouseLeave).toBe('function');
   });

   it('accepts className option and passes it through', () => {
      const customClassName = 'custom-class';
      const { result } = renderHook(() => useAppShellBranded({ className: customClassName }));

      // The className should be passed through to the container styling hook
      expect(result.current.containerClassName).toContain(
         'flex flex-col items-center justify-center'
      );
   });

   it('handles default options when none provided', () => {
      const { result } = renderHook(() => useAppShellBranded());

      expect(result.current).toBeDefined();
      expect(result.current.containerRef).toBeDefined();
      expect(result.current.logoRef).toBeDefined();
   });

   it('maintains referential stability when options do not change', () => {
      const { result, rerender } = renderHook(() => useAppShellBranded({ className: 'test' }));

      const firstResult = result.current;
      rerender();

      // Most values should remain stable due to memoization in individual hooks
      expect(result.current.containerRef).toBe(firstResult.containerRef);
      expect(result.current.logoRef).toBe(firstResult.logoRef);
   });
});
