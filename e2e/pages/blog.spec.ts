import { test, expect } from '@playwright/test';

test.describe('Blog Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/blog');
  });

  test('should load without crash', async ({ page }) => {
    await expect(page).toHaveURL(/blog/);
  });

  test('should display blog page', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should not have critical console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/blog');
    await page.waitForLoadState('networkidle');

    const criticalErrors = errors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('404')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
});
