import { test, expect } from '@playwright/test';

test.describe('Dashboard - Regular User', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');
    });

    test('should show Access Denied for non-admin user', async ({ page }) => {
        await page.waitForTimeout(2000);
        
        const accessDenied = page.locator('text=Access Denied');
        await expect(accessDenied).toBeVisible({ timeout: 10000 });
    });

    test('should not show admin features for regular user', async ({ page }) => {
        await page.waitForTimeout(2000);
        
        const body = page.locator('body');
        const pageContent = await body.textContent() || '';
        
        const hasAdminFeatures = pageContent.includes('ProjectManager') || 
                                  pageContent.includes('ResponseManager');
        expect(hasAdminFeatures).toBe(false);
    });
});
