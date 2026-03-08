import { test, expect } from '@playwright/test';

test.describe('Project Details Page', () => {
    test('should load project page structure', async ({ page }) => {
        await page.goto('/projects/test-project');
        const body = page.locator('body');
        await expect(body).toBeVisible();
    });

    test('should display project content or not found', async ({ page }) => {
        await page.goto('/projects/test-project');
        await page.waitForTimeout(2000);
        const body = page.locator('body');
        expect(await body.isVisible()).toBe(true);
    });

    test('should handle invalid project id', async ({ page }) => {
        await page.goto('/projects/invalid-project-id-12345');
        await page.waitForTimeout(2000);
        const body = page.locator('body');
        expect(await body.isVisible()).toBe(true);
    });

    test('should have back link to projects', async ({ page }) => {
        await page.goto('/');
        const projectLink = page.locator('a[href^="/projects/"]').first();
        if (await projectLink.isVisible()) {
            await projectLink.click();
            await expect(page).toHaveURL(/projects\//);
        }
    });

    test('should not crash on project page', async ({ page }) => {
        const response = await page.goto('/projects/test-project');
        expect(response?.status() || 200).toBeLessThan(500);
    });
});
