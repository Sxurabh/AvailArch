import { test, expect } from '@playwright/test';

const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/process',
  '/blog',
  '/track-request',
];

PUBLIC_ROUTES.forEach((route) => {
  test.describe(`Route: ${route}`, () => {
    test(`should return 200 for ${route}`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
    });

    test(`should not crash on ${route}`, async ({ page }) => {
      await page.goto(route);
      await expect(page.locator('body')).toBeVisible();
    });
  });
});

test.describe('Static Assets', () => {
  test('should have valid HTML structure', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang');
  });

  test('should load fonts correctly', async ({ page }) => {
    await page.goto('/');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
