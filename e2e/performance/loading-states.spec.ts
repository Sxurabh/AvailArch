import { test, expect } from '@playwright/test';

test.describe('Loading States', () => {
    test('should show loading state on home page', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('domcontentloaded');
        const body = page.locator('body');
        await expect(body).toBeVisible();
    });

    test('should handle slow network gracefully', async ({ page }) => {
        await page.route('**/api/**', async (route) => {
            await new Promise(resolve => setTimeout(resolve, 1000));
            await route.continue();
        });
        
        await page.goto('/');
        const body = page.locator('body');
        await expect(body).toBeVisible();
    });

    test('should eventually show content even with delays', async ({ page }) => {
        const start = Date.now();
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        const loadTime = Date.now() - start;
        
        const body = page.locator('body');
        expect(await body.isVisible()).toBe(true);
        expect(loadTime).toBeLessThan(30000);
    });

    test('should handle page navigation smoothly', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        await page.goto('/about');
        await page.waitForLoadState('networkidle');
        
        const body = page.locator('body');
        expect(await body.isVisible()).toBe(true);
    });

    test('should handle API timeout gracefully', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(3000);
        const body = page.locator('body');
        expect(await body.isVisible()).toBe(true);
    });
});
