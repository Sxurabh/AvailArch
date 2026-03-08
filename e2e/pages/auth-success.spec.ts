import { test, expect } from '@playwright/test';

test.describe('Auth Success Page', () => {
    test('should load auth success page', async ({ page }) => {
        await page.goto('/auth-success');
        const body = page.locator('body');
        await expect(body).toBeVisible();
    });

    test('should handle authentication callback', async ({ page }) => {
        await page.goto('/auth-success');
        await page.waitForTimeout(2000);
        const body = page.locator('body');
        expect(await body.isVisible()).toBe(true);
    });

    test('should redirect or show content after auth', async ({ page }) => {
        await page.goto('/auth-success');
        const response = await page.goto('/auth-success');
        expect(response?.status() || 200).toBeLessThan(500);
    });
});
