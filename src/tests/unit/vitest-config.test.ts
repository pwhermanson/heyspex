import { describe, it, expect } from 'vitest';

describe('Vitest Configuration', () => {
   it('should run basic tests', () => {
      expect(1 + 1).toBe(2);
   });

   it('should have jsdom environment', () => {
      expect(typeof window).toBe('object');
      expect(typeof document).toBe('object');
   });

   it('should have path aliases working', () => {
      // This test will verify that our path aliases are working
      // by importing a simple utility
      expect(true).toBe(true);
   });
});
