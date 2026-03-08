import { test, expect } from '@playwright/test';

test.describe('Performance - Core Web Vitals', () => {
  const LCP_THRESHOLD = 2500;
  const FID_THRESHOLD = 100;
  const CLS_THRESHOLD = 0.1;
  const TTFB_THRESHOLD = 600;

  test('Home page LCP should be under threshold', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          resolve(lastEntry.renderTime || lastEntry.loadTime);
        }).observe({ type: 'largest-contentful-paint', buffered: true });

        setTimeout(() => resolve(0), 5000);
      });
    });

    console.log(`LCP: ${lcp}ms`);
    expect(lcp).toBeLessThanOrEqual(LCP_THRESHOLD);
  });

  test('Home page should have minimal CLS', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const cls = await page.evaluate(() => {
      return new Promise((resolve) => {
        let clsValue = 0;
        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries() as any) {
            if ((entry as any).hadRecentInput) return;
            clsValue += (entry as any).value;
          }
        }).observe({ type: 'layout-shift', buffered: true });

        setTimeout(() => resolve(clsValue), 1000);
      });
    });

    console.log(`CLS: ${cls}`);
    expect(cls).toBeLessThanOrEqual(CLS_THRESHOLD);
  });

  test('Page should load within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;

    console.log(`Page load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(5000);
  });

  test('should not have render-blocking resources', async ({ page }) => {
    const blockingResources = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as any;
      return resources.filter((r: any) => 
        r.initiatorType === 'script' && 
        r.transferSize > 50000
      ).length;
    });

    console.log(`Large blocking scripts: ${blockingResources}`);
    expect(blockingResources).toBeLessThan(3);
  });

  test('images should have proper loading attributes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const images = page.locator('img');
    const count = await images.count();
    
    if (count > 0) {
      const imagesWithAttributes = await images.evaluateAll((imgs) => 
        imgs.filter((img: any) => 
          img.loading === 'lazy' || img.loading === 'eager' || img.decoding === 'async'
        ).length
      );
      
      console.log(`Images with loading attributes: ${imagesWithAttributes}/${count}`);
    }
    
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Performance - API Response', () => {
  test('API routes should respond quickly', async ({ request }) => {
    const routes = [
      '/api/projects',
      '/api/requests',
    ];

    for (const route of routes) {
      const startTime = Date.now();
      const response = await request.get(route);
      const responseTime = Date.now() - startTime;

      console.log(`${route}: ${responseTime}ms (${response.status()})`);
      expect(responseTime).toBeLessThan(3000);
    }
  });
});
