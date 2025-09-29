/**
 * useMouseEventComposition Hook Tests
 *
 * Tests for the useMouseEventComposition hook to ensure it properly
 * composes multiple mouse event handlers.
 */

import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { useMouseEventComposition } from '@/src/components/layout/app-shell-branded/hooks/use-mouse-event-composition';

describe('useMouseEventComposition Hook', () => {
   const mockShadowHandleMouseMove = vi.fn();
   const mockMouseInteractionHandleMouseMove = vi.fn();
   const mockShadowHandleMouseLeave = vi.fn();
   const mockMouseInteractionHandleMouseLeave = vi.fn();

   const defaultOptions = {
      shadowHandleMouseMove: mockShadowHandleMouseMove,
      mouseInteractionHandleMouseMove: mockMouseInteractionHandleMouseMove,
      shadowHandleMouseLeave: mockShadowHandleMouseLeave,
      mouseInteractionHandleMouseLeave: mockMouseInteractionHandleMouseLeave,
   };

   beforeEach(() => {
      vi.clearAllMocks();
   });

   it('returns combined mouse event handlers', () => {
      const { result } = renderHook(() => useMouseEventComposition(defaultOptions));

      expect(result.current).toHaveProperty('handleMouseMove');
      expect(result.current).toHaveProperty('handleMouseLeave');
      expect(typeof result.current.handleMouseMove).toBe('function');
      expect(typeof result.current.handleMouseLeave).toBe('function');
   });

   it('calls all mouse move handlers when handleMouseMove is invoked', () => {
      const { result } = renderHook(() => useMouseEventComposition(defaultOptions));

      const mockEvent = { type: 'mousemove' } as React.MouseEvent<HTMLDivElement>;
      result.current.handleMouseMove(mockEvent);

      expect(mockShadowHandleMouseMove).toHaveBeenCalledWith(mockEvent);
      expect(mockMouseInteractionHandleMouseMove).toHaveBeenCalledWith(mockEvent);
   });

   it('calls all mouse leave handlers when handleMouseLeave is invoked', () => {
      const { result } = renderHook(() => useMouseEventComposition(defaultOptions));

      result.current.handleMouseLeave();

      expect(mockShadowHandleMouseLeave).toHaveBeenCalledTimes(1);
      expect(mockMouseInteractionHandleMouseLeave).toHaveBeenCalledTimes(1);
   });

   it('maintains referential stability when handlers do not change', () => {
      const { result, rerender } = renderHook(() => useMouseEventComposition(defaultOptions));

      const firstHandleMouseMove = result.current.handleMouseMove;
      const firstHandleMouseLeave = result.current.handleMouseLeave;

      rerender();

      expect(result.current.handleMouseMove).toBe(firstHandleMouseMove);
      expect(result.current.handleMouseLeave).toBe(firstHandleMouseLeave);
   });

   it('creates new handlers when input handlers change', () => {
      const { result, rerender } = renderHook(({ options }) => useMouseEventComposition(options), {
         initialProps: { options: defaultOptions },
      });

      const firstHandleMouseMove = result.current.handleMouseMove;
      const firstHandleMouseLeave = result.current.handleMouseLeave;

      const newOptions = {
         ...defaultOptions,
         shadowHandleMouseMove: vi.fn(),
      };

      rerender({ options: newOptions });

      expect(result.current.handleMouseMove).not.toBe(firstHandleMouseMove);
      // handleMouseLeave should remain the same since only mouse move handlers changed
      expect(result.current.handleMouseLeave).toBe(firstHandleMouseLeave);
   });

   it('creates new leave handler when leave handlers change', () => {
      const { result, rerender } = renderHook(({ options }) => useMouseEventComposition(options), {
         initialProps: { options: defaultOptions },
      });

      const firstHandleMouseLeave = result.current.handleMouseLeave;

      const newOptions = {
         ...defaultOptions,
         shadowHandleMouseLeave: vi.fn(),
      };

      rerender({ options: newOptions });

      expect(result.current.handleMouseLeave).not.toBe(firstHandleMouseLeave);
   });

   it('calls handlers in the correct order', () => {
      const callOrder: string[] = [];

      const shadowHandler = vi.fn(() => callOrder.push('shadow'));
      const interactionHandler = vi.fn(() => callOrder.push('interaction'));

      const { result } = renderHook(() =>
         useMouseEventComposition({
            ...defaultOptions,
            shadowHandleMouseMove: shadowHandler,
            mouseInteractionHandleMouseMove: interactionHandler,
         })
      );

      const mockEvent = { type: 'mousemove' } as React.MouseEvent<HTMLDivElement>;
      result.current.handleMouseMove(mockEvent);

      expect(callOrder).toEqual(['shadow', 'interaction']);
   });

   it('handles multiple rapid calls correctly', () => {
      const { result } = renderHook(() => useMouseEventComposition(defaultOptions));

      const mockEvent1 = { type: 'mousemove', clientX: 100 } as React.MouseEvent<HTMLDivElement>;
      const mockEvent2 = { type: 'mousemove', clientX: 200 } as React.MouseEvent<HTMLDivElement>;

      result.current.handleMouseMove(mockEvent1);
      result.current.handleMouseMove(mockEvent2);
      result.current.handleMouseLeave();

      expect(mockShadowHandleMouseMove).toHaveBeenCalledTimes(2);
      expect(mockMouseInteractionHandleMouseMove).toHaveBeenCalledTimes(2);
      expect(mockShadowHandleMouseMove).toHaveBeenNthCalledWith(1, mockEvent1);
      expect(mockShadowHandleMouseMove).toHaveBeenNthCalledWith(2, mockEvent2);
      expect(mockShadowHandleMouseLeave).toHaveBeenCalledTimes(1);
      expect(mockMouseInteractionHandleMouseLeave).toHaveBeenCalledTimes(1);
   });
});
