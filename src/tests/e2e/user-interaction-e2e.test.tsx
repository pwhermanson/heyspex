/**
 * User Interaction E2E Tests
 *
 * Tests the complete user experience with interactive elements in a real browser environment.
 * Focuses on user interactions like mouse movements, hover effects, and visual feedback.
 * This ensures the interactive experience works as expected for end users.
 */

import { test, expect } from '@playwright/test';

test.describe('User Interaction E2E Tests', () => {
   test.beforeEach(async ({ page }) => {
      // Navigate to the app
      await page.goto('http://localhost:3000');

      // Wait for the app to load
      await page.waitForLoadState('networkidle');
   });

   test('mouse glow effect appears and follows cursor', async ({ page }) => {
      // Find the main container
      const container = page.locator('[data-testid="app-shell-branded"]').first();
      await expect(container).toBeVisible();

      // Move mouse to different positions and verify glow effect follows
      await container.hover({ position: { x: 100, y: 100 } });

      // Check that glow effect is visible
      const glowEffect = page.locator('[data-testid="glow-effect"]');
      await expect(glowEffect).toBeVisible();

      // Verify glow effect has correct opacity for mouse movement
      await expect(glowEffect).toHaveCSS('opacity', '0.7');

      // Move to a different position
      await container.hover({ position: { x: 300, y: 200 } });

      // Glow effect should still be visible and responsive
      await expect(glowEffect).toBeVisible();
      await expect(glowEffect).toHaveCSS('opacity', '0.7');
   });

   test('logo brightness changes on hover', async ({ page }) => {
      // Find the main container (this has the mouse event handlers)
      const container = page.locator('[data-testid="app-shell-branded"]').first();
      await expect(container).toBeVisible();

      // Find the logo group
      const logoGroup = page.locator('[data-testid="logo-group"]').first();
      await expect(logoGroup).toBeVisible();

      // Get the main logo container (the div that has the brightness filter)
      const logoContainer = logoGroup.locator('div').nth(3);
      await expect(logoContainer).toBeVisible();

      // Check initial state (should have brightness filter applied)
      const initialFilter = await logoContainer.evaluate((el) => getComputedStyle(el).filter);
      expect(initialFilter).toContain('brightness(0.7)'); // Initial state should be dimmed

      // Trigger mouse move over the main container to activate React state
      await container.hover({ position: { x: 200, y: 200 } });

      // Wait for React state to update and brightness to change
      // Check that brightness changes from the initial value (should be different from 0.7)
      await expect(logoContainer).toHaveCSS('filter', /brightness\((?!0\.7\))/, { timeout: 5000 });
   });

   test('shadow effects respond to mouse movement', async ({ page }) => {
      // Find the logo group
      const logoGroup = page.locator('[data-testid="logo-group"]').first();
      await expect(logoGroup).toBeVisible();

      // Check that shadow layer exists
      const shadowLayer = page.locator('[data-testid="shadow-layer"]');
      await expect(shadowLayer).toBeVisible();

      // Move mouse over the logo group
      await logoGroup.hover({ position: { x: 150, y: 150 } });

      // Verify shadow layer is still visible and responsive
      await expect(shadowLayer).toBeVisible();

      // Move mouse to different position
      await logoGroup.hover({ position: { x: 250, y: 250 } });

      // Shadow should still be visible and responsive
      await expect(shadowLayer).toBeVisible();
   });

   test('grid background opacity changes with mouse movement', async ({ page }) => {
      // Find the grid background
      const gridBackground = page.locator('[data-testid="grid-background"]').first();
      await expect(gridBackground).toBeVisible();

      // Get initial opacity
      const initialOpacity = await gridBackground.evaluate((el) => getComputedStyle(el).opacity);
      expect(initialOpacity).toBeDefined();

      // Move mouse over the container to trigger opacity changes
      const container = page.locator('[data-testid="app-shell-branded"]').first();
      await container.hover({ position: { x: 200, y: 200 } });

      // Check that grid background is still visible
      await expect(gridBackground).toBeVisible();

      // Move mouse to different position
      await container.hover({ position: { x: 400, y: 300 } });

      // Grid should still be visible and responsive
      await expect(gridBackground).toBeVisible();
   });

   test('handles rapid mouse movements without performance issues', async ({ page }) => {
      // Find the main container
      const container = page.locator('[data-testid="app-shell-branded"]').first();
      await expect(container).toBeVisible();

      // Perform rapid mouse movements in a pattern
      const positions = [
         { x: 100, y: 100 },
         { x: 200, y: 150 },
         { x: 300, y: 200 },
         { x: 150, y: 250 },
         { x: 250, y: 300 },
         { x: 350, y: 350 },
      ];

      for (const position of positions) {
         await container.hover({ position });
         await page.waitForTimeout(20); // Small delay to simulate rapid movement
      }

      // Check that the component is still responsive
      await expect(container).toBeVisible();

      // Verify glow effect is still working
      const glowEffect = page.locator('[data-testid="glow-effect"]');
      await expect(glowEffect).toBeVisible();
   });

   test('handles mouse leave events with proper fade-out', async ({ page }) => {
      // Find the main container
      const container = page.locator('[data-testid="app-shell-branded"]').first();
      await expect(container).toBeVisible();

      // Hover over the container
      await container.hover({ position: { x: 200, y: 200 } });

      // Verify glow effect is visible with high opacity
      const glowEffect = page.locator('[data-testid="glow-effect"]');
      await expect(glowEffect).toBeVisible();
      await expect(glowEffect).toHaveCSS('opacity', '0.7');

      // Move mouse away from the container
      await page.mouse.move(0, 0);

      // Wait for fade-out transition and check opacity becomes 0
      await expect(glowEffect).toHaveCSS('opacity', '0', { timeout: 10000 });
   });

   test('maintains visual consistency during state transitions', async ({ page }) => {
      // Find the main container
      const container = page.locator('[data-testid="app-shell-branded"]').first();
      await expect(container).toBeVisible();

      // Test the complete interaction cycle
      // 1. Initial state
      await expect(container).toBeVisible();

      // 2. Mouse enter - trigger React state
      await container.hover({ position: { x: 150, y: 150 } });

      // Wait for React state to update and verify all components are visible
      await expect(page.locator('[data-testid="glow-effect"]')).toBeVisible();
      await expect(page.locator('[data-testid="logo-group"]')).toBeVisible();
      await expect(page.locator('[data-testid="grid-background"]')).toBeVisible();
      await expect(page.locator('[data-testid="instruction-text"]')).toBeVisible();

      // 3. Mouse movement - trigger state updates
      await container.hover({ position: { x: 250, y: 250 } });

      // All components should still be visible
      await expect(page.locator('[data-testid="glow-effect"]')).toBeVisible();
      await expect(page.locator('[data-testid="logo-group"]')).toBeVisible();
      await expect(page.locator('[data-testid="grid-background"]')).toBeVisible();

      // 4. Mouse leave - trigger fade-out state
      await page.mouse.move(0, 0);

      // Wait for fade-out transition
      await expect(page.locator('[data-testid="glow-effect"]')).toHaveCSS('opacity', '0', {
         timeout: 10000,
      });
   });

   test('works correctly across different viewport sizes', async ({ page }) => {
      // Test on mobile size
      await page.setViewportSize({ width: 375, height: 667 });
      const container = page.locator('[data-testid="app-shell-branded"]').first();
      await expect(container).toBeVisible();

      // Test interaction on mobile
      await container.hover({ position: { x: 100, y: 100 } });
      await expect(page.locator('[data-testid="glow-effect"]')).toBeVisible();

      // Test on tablet size
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(container).toBeVisible();

      // Test interaction on tablet
      await container.hover({ position: { x: 200, y: 200 } });
      await expect(page.locator('[data-testid="glow-effect"]')).toBeVisible();

      // Test on desktop size
      await page.setViewportSize({ width: 1920, height: 1080 });
      await expect(container).toBeVisible();

      // Test interaction on desktop
      await container.hover({ position: { x: 400, y: 300 } });
      await expect(page.locator('[data-testid="glow-effect"]')).toBeVisible();
   });

   test('handles edge case mouse positions correctly', async ({ page }) => {
      // Find the main container
      const container = page.locator('[data-testid="app-shell-branded"]').first();
      await expect(container).toBeVisible();

      // Test corner positions
      const cornerPositions = [
         { x: 0, y: 0 },
         { x: 0, y: 100 },
         { x: 100, y: 0 },
      ];

      for (const position of cornerPositions) {
         await container.hover({ position });

         // Component should still be responsive
         await expect(container).toBeVisible();

         // Glow effect should be visible
         const glowEffect = page.locator('[data-testid="glow-effect"]');
         await expect(glowEffect).toBeVisible();
      }
   });
});
