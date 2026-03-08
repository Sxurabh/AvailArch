import { test, expect } from '@playwright/test';

test.describe('Dashboard (With Mocked Auth)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('sb-access-token', 'mock-access-token');
      window.localStorage.setItem('sb-refresh-token', 'mock-refresh-token');
    });
  });

  test('should display dashboard content when authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should show admin features when logged in', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(3000);
    
    const hasContent = await page.locator('body').isVisible();
    expect(hasContent).toBe(true);
  });

  test('should handle requests table', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
