import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Next.js router
vi.mock('next/navigation', () => ({
   useRouter() {
      return {
         push: vi.fn(),
         replace: vi.fn(),
         prefetch: vi.fn(),
         back: vi.fn(),
         forward: vi.fn(),
         refresh: vi.fn(),
      };
   },
   useSearchParams() {
      return new URLSearchParams();
   },
   usePathname() {
      return '/';
   },
}));

// Mock Next.js dynamic imports
vi.mock('next/dynamic', () => () => {
   const DynamicComponent = () => null;
   DynamicComponent.displayName = 'LoadableComponent';
   DynamicComponent.preload = vi.fn();
   return DynamicComponent;
});

// Mock localStorage
const localStorageMock = {
   getItem: vi.fn(),
   setItem: vi.fn(),
   removeItem: vi.fn(),
   clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
   value: localStorageMock,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
   writable: true,
   value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
   })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
   observe: vi.fn(),
   unobserve: vi.fn(),
   disconnect: vi.fn(),
}));

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

// Suppress console warnings in tests
const originalError = console.error;
beforeAll(() => {
   console.error = (...args: unknown[]) => {
      if (
         typeof args[0] === 'string' &&
         args[0].includes('Warning: ReactDOM.render is no longer supported')
      ) {
         return;
      }
      originalError.call(console, ...args);
   };
});

afterAll(() => {
   console.error = originalError;
});
