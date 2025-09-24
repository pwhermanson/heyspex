import { act, renderHook } from '@testing-library/react';
import { ReactNode } from 'react';

// Utility for testing Zustand stores
export const createStoreTestWrapper = (providers: ReactNode[] = []) => {
   return ({ children }: { children: ReactNode }) => {
      return providers.reduce((acc, provider) => {
         if (React.isValidElement(provider)) {
            return React.cloneElement(provider, {}, acc);
         }
         return acc;
      }, children as ReactNode);
   };
};

// Helper to test store actions with proper act wrapping
export const testStoreAction = async (storeHook: any, action: () => void | Promise<void>) => {
   await act(async () => {
      await action();
   });

   return storeHook.result.current;
};

// Mock localStorage for store persistence tests
export const mockLocalStorage = () => {
   const store: Record<string, string> = {};

   return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
         store[key] = value;
      },
      removeItem: (key: string) => {
         delete store[key];
      },
      clear: () => {
         Object.keys(store).forEach((key) => delete store[key]);
      },
   };
};

// Helper to create mock data for testing
export const createMockData = {
   member: (overrides = {}) => ({
      id: '1',
      name: 'Test Member',
      email: 'test@example.com',
      avatar: null,
      role: 'member',
      ...overrides,
   }),

   project: (overrides = {}) => ({
      id: '1',
      name: 'Test Project',
      description: 'Test project description',
      status: 'active',
      createdAt: new Date().toISOString(),
      ...overrides,
   }),

   team: (overrides = {}) => ({
      id: '1',
      name: 'Test Team',
      description: 'Test team description',
      members: [],
      projects: [],
      ...overrides,
   }),
};
