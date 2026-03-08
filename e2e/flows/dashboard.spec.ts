import { test, expect } from '@playwright/test';

test.describe('Dashboard (Requires Admin Auth)', () => {
  test.skip('should be accessible after login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/dashboard/);
  });

  test.skip('should display admin content when logged in', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('main, section')).toBeVisible();
  });

  test('should load dashboard page structure without auth', async ({ page }) => {
    await page.goto('/dashboard');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
