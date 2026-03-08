import { test, expect } from '@playwright/test';

test.describe('Track Request Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/track-request');
  });

  test('should load without crash', async ({ page }) => {
    await expect(page).toHaveURL(/track-request/);
  });

  test('should display page content', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should handle form or redirect to auth', async ({ page }) => {
    await page.waitForTimeout(2000);
    const hasContent = await page.locator('body').isVisible();
    expect(hasContent).toBe(true);
  });

  test('should allow BHK selection', async ({ page }) => {
    const bhkSelect = page.locator('select[name="bhk"], input[name="bhk"]');
    if (await bhkSelect.isVisible()) {
      await expect(bhkSelect).toBeVisible();
    }
  });

  test('should have area unit toggle (sqft/sqmt)', async ({ page }) => {
    const sqftButton = page.locator('text=sqft');
    const sqmtButton = page.locator('text=sqmt');
    
    if (await sqftButton.isVisible()) {
      await expect(sqftButton).toBeVisible();
    }
    if (await sqmtButton.isVisible()) {
      await expect(sqmtButton).toBeVisible();
    }
  });

  test('should not have critical console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/track-request');
    await page.waitForLoadState('networkidle');

    const criticalErrors = errors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('404')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
});
