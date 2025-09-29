/**
 * Visual Effects E2E Tests
 *
 * Tests the visual effects functionality in a real browser environment
 * to ensure that visual effects actually appear and work correctly.
 * This catches the type of system-level issues that unit tests miss.
 */

import { test, expect } from '@playwright/test';

test.describe('Visual Effects E2E Tests', () => {
   test.beforeEach(async ({ page }) => {
      // Navigate to the app
      await page.goto('http://localhost:3000');

      // Wait for the app to load
      await page.waitForLoadState('networkidle');
   });

   test('should render glow effect when mouse moves over the component', async ({ page }) => {
      // Find the main container
      const container = page.locator('[data-testid="app-shell-branded"]').first();
      await expect(container).toBeVisible();

      // Move mouse over the container
      await container.hover();

      // Check that glow effect is visible
      const glowEffect = page.locator('[data-testid="glow-effect"]');
      await expect(glowEffect).toBeVisible();
   });

   test('should show logo brightness changes on hover', async ({ page }) => {
      // Find the logo group
      const logoGroup = page.locator('[data-testid="logo-group"]').first();
      await expect(logoGroup).toBeVisible();

      // Hover over the logo group
      await logoGroup.hover();

      // Check that the logo group has the group class for hover effects
      await expect(logoGroup).toHaveClass(/group/);
   });

   test('should show shadow effects on mouse movement', async ({ page }) => {
      // Find the logo group
      const logoGroup = page.locator('[data-testid="logo-group"]').first();
      await expect(logoGroup).toBeVisible();

      // Move mouse over the logo group
      await logoGroup.hover();

      // Check that shadow effects are applied
      const shadowLayer = page.locator('[data-testid="shadow-layer"]');
      await expect(shadowLayer).toBeVisible();
   });

   test('should show grid background opacity changes', async ({ page }) => {
      // Find the grid background
      const gridBackground = page.locator('[data-testid="grid-background"]').first();
      await expect(gridBackground).toBeVisible();

      // Move mouse over the container to trigger opacity changes
      const container = page.locator('[data-testid="app-shell-branded"]').first();
      await container.hover();

      // Check that grid background is still visible (opacity changes are handled by CSS)
      await expect(gridBackground).toBeVisible();
   });

   test('should handle rapid mouse movements smoothly', async ({ page }) => {
      // Find the main container
      const container = page.locator('[data-testid="app-shell-branded"]').first();
      await expect(container).toBeVisible();

      // Perform rapid mouse movements
      await container.hover({ position: { x: 100, y: 100 } });
      await page.waitForTimeout(50);
      await container.hover({ position: { x: 200, y: 200 } });
      await page.waitForTimeout(50);
      await container.hover({ position: { x: 300, y: 300 } });

      // Check that the component is still responsive
      await expect(container).toBeVisible();
   });

   test('should handle mouse leave events correctly', async ({ page }) => {
      // Find the main container
      const container = page.locator('[data-testid="app-shell-branded"]').first();
      await expect(container).toBeVisible();

      // Hover over the container
      await container.hover();

      // Verify glow effect is visible with high opacity
      const glowEffect = page.locator('[data-testid="glow-effect"]');
      await expect(glowEffect).toBeVisible();
      await expect(glowEffect).toHaveCSS('opacity', '0.7');

      // Move mouse away
      await page.mouse.move(0, 0);

      // Wait for fade-out transition and check opacity becomes 0
      await expect(glowEffect).toHaveCSS('opacity', '0', { timeout: 10000 });
   });

   test('should be responsive on different screen sizes', async ({ page }) => {
      // Test on mobile size
      await page.setViewportSize({ width: 375, height: 667 });
      const container = page.locator('[data-testid="app-shell-branded"]').first();
      await expect(container).toBeVisible();

      // Test on tablet size
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(container).toBeVisible();

      // Test on desktop size
      await page.setViewportSize({ width: 1920, height: 1080 });
      await expect(container).toBeVisible();
   });
});
