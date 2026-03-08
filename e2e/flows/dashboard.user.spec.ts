import { test, expect } from '@playwright/test';

test.describe('Dashboard - Regular User', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000);
    });

    test.skip('should show Access Denied or redirect for non-admin user', async ({ page }) => {
        const pageContent = await page.content();
        // Either shows Access Denied or redirects to home
        const isAccessDenied = pageContent.includes('Access Denied');
        const isHomePage = pageContent.includes('K Shire') || pageContent.includes('Courtyard');
        expect(isAccessDenied || isHomePage).toBe(true);
    });

    test.skip('should not show admin features for regular user', async ({ page }) => {
        await page.waitForTimeout(2000);

        const pageContent = await page.content();

        const hasAdminFeatures = pageContent.includes('Admin Dashboard') ||
                                  pageContent.includes('Manage Requests');
        expect(hasAdminFeatures).toBe(false);
    });
});
