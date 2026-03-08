import { test, expect } from '@playwright/test';

test.describe('Dashboard - Admin User', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('domcontentloaded');
        // Wait for auth and dashboard to load
        await page.waitForTimeout(3000);
    });

    test.skip('should load dashboard without Access Denied', async ({ page }) => {
        // Should see admin dashboard content, not home page
        const pageContent = await page.content();
        const isAdminDashboard = pageContent.includes('Admin Dashboard') ||
                                 pageContent.includes('Manage Requests');
        expect(isAdminDashboard).toBe(true);
    });

    test.skip('should display admin features', async ({ page }) => {
        await page.waitForTimeout(2000);

        const pageContent = await page.content();
        const hasAdminIndicators = pageContent.includes('Manage Requests') ||
                                    pageContent.includes('Manage Projects') ||
                                    pageContent.includes('Manage Responses') ||
                                    pageContent.includes('Admin Dashboard');
        expect(hasAdminIndicators).toBe(true);
    });

    test.skip('should show requests tab by default', async ({ page }) => {
        await page.waitForTimeout(2000);

        const requestsTab = page.locator('text=Manage Requests').first();
        await expect(requestsTab).toBeVisible({ timeout: 5000 });
    });

    test.skip('should have navigation to projects and responses tabs', async ({ page }) => {
        await page.waitForTimeout(2000);

        const projectsTab = page.locator('text=Manage Projects');
        const responsesTab = page.locator('text=Manage Responses');

        const hasProjectsTab = await projectsTab.count() > 0;
        const hasResponsesTab = await responsesTab.count() > 0;

        expect(hasProjectsTab || hasResponsesTab).toBe(true);
    });
});
