import { expect, test } from '@playwright/test';

for (const width of [375, 1280]) {
  test(`article listings omit thumbnails and use the full row at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });

    for (const path of ['/', '/2/', '/category/software/', '/tag/ai/']) {
      await page.goto(path);
      const articles = page.locator('.featured, [data-testid="post-card"], .post-row');
      await expect(articles.first()).toBeVisible();
      await expect(articles.locator('img')).toHaveCount(0);

      for (const row of await page.locator('.post-row').all()) {
        const rowBox = await row.boundingBox();
        const copyBox = await row.locator('.post-copy').boundingBox();
        expect(rowBox).not.toBeNull();
        expect(copyBox).not.toBeNull();
        expect(copyBox!.x).toBeCloseTo(rowBox!.x, 0);
        expect(copyBox!.width).toBeCloseTo(rowBox!.width, 0);
        expect(rowBox!.x + rowBox!.width).toBeLessThanOrEqual(width);
      }
    }

    await page.goto('/post/about');
    await expect(page.locator('.article-thumbnail img')).toBeVisible();
  });
}
