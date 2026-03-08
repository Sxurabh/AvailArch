import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load without crash', async ({ page }) => {
    await expect(page).toHaveTitle(/Avail/i);
  });

  test('should display main content', async ({ page }) => {
    await expect(page.locator('section')).toBeVisible();
  });

  test('should not have critical console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const criticalErrors = errors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('404') &&
      !e.includes('Failed to fetch') &&
      !e.includes('net::ERR')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('should have valid meta tags', async ({ page }) => {
    const title = await page.title();
    expect(title).toBeTruthy();
    const description = page.locator('meta[name="description"]');
    await expect(description).toBeAttached();
  });
});
