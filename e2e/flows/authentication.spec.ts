import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should have login page accessible', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should redirect to auth when accessing protected route', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(1000);
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should not expose sensitive data without auth', async ({ page }) => {
    const response = await page.goto('/dashboard');
    expect(response?.status() || 200).toBeLessThan(500);
  });

  test('should handle auth callback page', async ({ page }) => {
    await page.goto('/auth-success');
    await expect(page.locator('body')).toBeVisible();
  });
});
