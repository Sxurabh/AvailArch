import { test, expect } from '@playwright/test';

test.describe('Dashboard (Unauthenticated)', () => {
  test('should redirect to home when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);
    
    await expect(page).toHaveURL('/');
  });
});
