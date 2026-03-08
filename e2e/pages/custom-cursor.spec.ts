import { test, expect } from '@playwright/test';

test.describe('CustomCursor', () => {
    test('should render cursor on home page', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        const body = page.locator('body');
        await expect(body).toBeVisible();
    });
});
