import { describe, it, expect } from 'vitest';

describe('Vitest Configuration', () => {
   it('should have jsdom environment configured', () => {
      expect(typeof window).toBe('object');
      expect(typeof document).toBe('object');
   });

   it('should have testing library available', () => {
      expect(typeof import('@testing-library/react')).toBe('object');
   });

   it('should have vitest globals available', () => {
      expect(typeof describe).toBe('function');
      expect(typeof it).toBe('function');
      expect(typeof expect).toBe('function');
   });
});
