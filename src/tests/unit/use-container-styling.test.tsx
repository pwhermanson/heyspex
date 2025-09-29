/**
 * useContainerStyling Hook Tests
 *
 * Tests for the useContainerStyling hook to ensure it properly
 * handles container styling and conditional rendering logic.
 */

import { renderHook } from '@testing-library/react';
import { useContainerStyling } from '@/src/components/layout/app-shell-branded/hooks/use-container-styling';

describe('useContainerStyling Hook', () => {
   const defaultOptions = {
      isClient: true,
      isMouseOver: false,
      logoData: null,
      className: '',
   };

   it('returns container styling properties', () => {
      const { result } = renderHook(() => useContainerStyling(defaultOptions));

      expect(result.current).toHaveProperty('containerClassName');
      expect(result.current).toHaveProperty('containerStyle');
      expect(result.current).toHaveProperty('shouldShowGlowEffect');
      expect(typeof result.current.containerClassName).toBe('string');
      expect(typeof result.current.containerStyle).toBe('object');
      expect(typeof result.current.shouldShowGlowEffect).toBe('boolean');
   });

   it('generates correct container className', () => {
      const { result } = renderHook(() => useContainerStyling(defaultOptions));

      expect(result.current.containerClassName).toContain(
         'flex flex-col items-center justify-center'
      );
      expect(result.current.containerClassName).toContain('h-full w-full');
      expect(result.current.containerClassName).toContain('bg-background text-foreground');
      expect(result.current.containerClassName).toContain('relative overflow-hidden');
   });

   it('merges custom className correctly', () => {
      const customClassName = 'custom-class another-class';
      const { result } = renderHook(() =>
         useContainerStyling({
            ...defaultOptions,
            className: customClassName,
         })
      );

      expect(result.current.containerClassName).toContain('custom-class');
      expect(result.current.containerClassName).toContain('another-class');
   });

   it('generates correct container style object', () => {
      const { result } = renderHook(() => useContainerStyling(defaultOptions));

      expect(result.current.containerStyle).toEqual({
         zIndex: 0,
         position: 'absolute',
         top: 0,
         left: 0,
         right: 0,
         bottom: 0,
      });
   });

   it('determines shouldShowGlowEffect correctly when all conditions are met', () => {
      const logoData = { some: 'data' };
      const { result } = renderHook(() =>
         useContainerStyling({
            ...defaultOptions,
            isClient: true,
            isMouseOver: true,
            logoData,
         })
      );

      expect(result.current.shouldShowGlowEffect).toBe(logoData);
   });

   it('determines shouldShowGlowEffect correctly when client is not ready', () => {
      const { result } = renderHook(() =>
         useContainerStyling({
            ...defaultOptions,
            isClient: false,
            isMouseOver: true,
            logoData: { some: 'data' },
         })
      );

      expect(result.current.shouldShowGlowEffect).toBe(false);
   });

   it('determines shouldShowGlowEffect correctly when mouse is not over', () => {
      const { result } = renderHook(() =>
         useContainerStyling({
            ...defaultOptions,
            isClient: true,
            isMouseOver: false,
            logoData: { some: 'data' },
         })
      );

      expect(result.current.shouldShowGlowEffect).toBe(false);
   });

   it('determines shouldShowGlowEffect correctly when logoData is null', () => {
      const { result } = renderHook(() =>
         useContainerStyling({
            ...defaultOptions,
            isClient: true,
            isMouseOver: true,
            logoData: null,
         })
      );

      expect(result.current.shouldShowGlowEffect).toBe(null);
   });

   it('maintains referential stability when options do not change', () => {
      const { result, rerender } = renderHook(() => useContainerStyling(defaultOptions));

      const firstContainerClassName = result.current.containerClassName;
      const firstContainerStyle = result.current.containerStyle;
      const firstShouldShowGlowEffect = result.current.shouldShowGlowEffect;

      rerender();

      expect(result.current.containerClassName).toBe(firstContainerClassName);
      expect(result.current.containerStyle).toBe(firstContainerStyle);
      expect(result.current.shouldShowGlowEffect).toBe(firstShouldShowGlowEffect);
   });

   it('creates new values when className changes', () => {
      const { result, rerender } = renderHook(({ options }) => useContainerStyling(options), {
         initialProps: { options: defaultOptions },
      });

      const firstContainerClassName = result.current.containerClassName;

      rerender({ options: { ...defaultOptions, className: 'new-class' } });

      expect(result.current.containerClassName).not.toBe(firstContainerClassName);
      expect(result.current.containerClassName).toContain('new-class');
   });

   it('creates new values when glow effect conditions change', () => {
      const { result, rerender } = renderHook(({ options }) => useContainerStyling(options), {
         initialProps: { options: defaultOptions },
      });

      const firstShouldShowGlowEffect = result.current.shouldShowGlowEffect;
      const logoData = { some: 'data' };

      rerender({
         options: {
            ...defaultOptions,
            isMouseOver: true,
            logoData,
         },
      });

      expect(result.current.shouldShowGlowEffect).not.toBe(firstShouldShowGlowEffect);
      expect(result.current.shouldShowGlowEffect).toBe(logoData);
   });
});
