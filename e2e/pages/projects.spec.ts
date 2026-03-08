import { test, expect } from '@playwright/test';

test.describe('Projects Page', () => {
  test('should load project list page', async ({ page }) => {
    await page.goto('/');
    const projectLinks = page.locator('a[href^="/projects/"]');
    await expect(projectLinks.first()).toBeVisible();
  });

  test('should navigate to individual project page', async ({ page }) => {
    await page.goto('/');
    
    const projectLink = page.locator('a[href^="/projects/"]').first();
    if (await projectLink.isVisible()) {
      await projectLink.click();
      await expect(page).toHaveURL(/projects\//);
    }
  });

  test('should display project details without crash', async ({ page }) => {
    await page.goto('/projects/test-project');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should not have critical console errors on projects', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const projectLink = page.locator('a[href^="/projects/"]').first();
    if (await projectLink.isVisible()) {
      await projectLink.click();
      await page.waitForLoadState('networkidle');
    }

    const criticalErrors = errors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('404') &&
      !e.includes('not found')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
});
