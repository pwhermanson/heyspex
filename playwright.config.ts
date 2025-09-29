import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for E2E testing
 *
 * This configuration is used to run visual regression tests
 * and E2E tests for the App Shell Branded system.
 */

export default defineConfig({
   testDir: './src/tests/e2e',
   fullyParallel: true,
   forbidOnly: !!process.env.CI,
   retries: process.env.CI ? 2 : 0,
   workers: process.env.CI ? 1 : undefined,
   reporter: 'html',
   use: {
      baseURL: 'http://localhost:3000',
      trace: 'on-first-retry',
   },

   projects: [
      {
         name: 'chromium',
         use: { ...devices['Desktop Chrome'] },
      },
      {
         name: 'firefox',
         use: { ...devices['Desktop Firefox'] },
      },
      {
         name: 'webkit',
         use: { ...devices['Desktop Safari'] },
      },
      {
         name: 'Mobile Chrome',
         use: { ...devices['Pixel 5'] },
      },
      {
         name: 'Mobile Safari',
         use: { ...devices['iPhone 12'] },
      },
   ],

   webServer: {
      command: 'pnpm dev:full',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
   },
});
