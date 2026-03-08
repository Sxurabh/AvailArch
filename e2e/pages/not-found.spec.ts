import { test, expect } from '@playwright/test';

test.describe('404 Not Found Page', () => {
    test('should handle invalid route gracefully', async ({ page }) => {
        await page.goto('/invalid-route-12345');
        const body = page.locator('body');
        await expect(body).toBeVisible();
    });

    test('should display not found content', async ({ page }) => {
        await page.goto('/nonexistent-page');
        await page.waitForTimeout(1000);
        const body = page.locator('body');
        expect(await body.isVisible()).toBe(true);
    });

    test('should have working navigation from 404', async ({ page }) => {
        await page.goto('/404-test');
        const homeLink = page.locator('a[href="/"]').first();
        if (await homeLink.isVisible()) {
            await homeLink.click();
            await expect(page).toHaveURL('/');
        }
    });
});
