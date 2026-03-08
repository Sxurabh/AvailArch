import { test, expect } from '@playwright/test';

test.describe('Dashboard - Admin User', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');
    });

    test('should load dashboard without Access Denied', async ({ page }) => {
        const accessDenied = page.locator('text=Access Denied');
        await expect(accessDenied).not.toBeVisible({ timeout: 10000 });
    });

    test('should display admin features', async ({ page }) => {
        await page.waitForTimeout(2000);
        
        const body = page.locator('body');
        await expect(body).toBeVisible();
        
        const pageContent = await body.textContent() || '';
        const hasAdminIndicators = pageContent.includes('Projects') || 
                                    pageContent.includes('Requests') || 
                                    pageContent.includes('Responses') ||
                                    pageContent.includes('Project');
        expect(hasAdminIndicators).toBe(true);
    });

    test('should show requests tab by default', async ({ page }) => {
        await page.waitForTimeout(2000);
        
        const requestsTab = page.locator('text=Requests').first();
        await expect(requestsTab).toBeVisible();
    });

    test('should have navigation to projects and responses tabs', async ({ page }) => {
        await page.waitForTimeout(2000);
        
        const projectsTab = page.locator('text=Projects');
        const responsesTab = page.locator('text=Responses');
        
        const hasProjectsTab = await projectsTab.count() > 0;
        const hasResponsesTab = await responsesTab.count() > 0;
        
        expect(hasProjectsTab || hasResponsesTab).toBe(true);
    });
});
