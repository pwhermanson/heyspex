// Re-export all test utilities
export * from './test-utils';
export * from './store-test-utils';
export * from './component-test-utils';

// Common test constants
export const TEST_CONSTANTS = {
   TIMEOUTS: {
      SHORT: 1000,
      MEDIUM: 5000,
      LONG: 10000,
   },

   TEST_IDS: {
      LOADING: 'loading',
      ERROR: 'error',
      SUCCESS: 'success',
      EMPTY: 'empty',
   },

   MOCK_DELAYS: {
      FAST: 0,
      NORMAL: 100,
      SLOW: 500,
   },
} as const;
