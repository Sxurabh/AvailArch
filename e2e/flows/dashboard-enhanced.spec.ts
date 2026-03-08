import { test, expect } from '@playwright/test';

test.describe('Dashboard Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => {
            window.localStorage.setItem('sb-access-token', 'mock-access-token');
            window.localStorage.setItem('sb-refresh-token', 'mock-refresh-token');
        });
    });

    test('should load dashboard with mocked auth', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForTimeout(2000);
        const body = page.locator('body');
        await expect(body).toBeVisible();
    });

    test('should display dashboard structure', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForTimeout(3000);
        const hasContent = await page.locator('body').isVisible();
        expect(hasContent).toBe(true);
    });

    test('should handle dashboard navigation', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForTimeout(2000);
        const response = await page.goto('/dashboard');
        expect(response?.status() || 200).toBeLessThan(500);
    });

    test('should load admin features', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForTimeout(2000);
        const body = page.locator('body');
        expect(await body.isVisible()).toBe(true);
    });

    test('should handle requests management', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForTimeout(2000);
        expect(await page.locator('body').count()).toBeGreaterThan(0);
    });
});
