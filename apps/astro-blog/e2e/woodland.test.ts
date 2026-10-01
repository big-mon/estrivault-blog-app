import { expect, test } from '@playwright/test';

for (const width of [320, 360, 390, 768, 1024, 1180, 1366, 1440, 1920, 2560]) {
  test(`woodland reading layout at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    for (const path of ['/', '/category/software/', '/post/about', '/notes/']) {
      await page.goto(path);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      ).toBe(true);
      const surface = await page.locator('body > main').boundingBox();
      expect(surface!.width).toBeLessThanOrEqual(860);
      if (width <= 900) expect(surface!.width).toBeGreaterThan(width - 24);
      await expect(page.locator('body > main')).toHaveCSS('background-color', 'rgb(255, 253, 242)');
    }
    await page.goto('/');
    await expect(page.locator('.editorial-masthead nav')).toHaveText(
      /記事\s*メモ\s*このブログについて/,
    );
    if (width <= 900) await expect(page.locator('.woodland-mobile')).toBeVisible();
    const first = page.locator('.post-row').first();
    if (width <= 900) expect((await first.boundingBox())!.width).toBeGreaterThan(width - 70);
    const metadata = await first.locator('.post-date').boundingBox();
    const title = await first.locator('.post-title').boundingBox();
    expect(metadata!.y + metadata!.height).toBeLessThanOrEqual(title!.y);
    await expect(first.locator('img')).toHaveCount(0);
    const category = first.locator('.post-date a');
    const categoryHref = await category.getAttribute('href');
    await category.click();
    await expect(page).toHaveURL(categoryHref!);
    await page.goBack();
    await expect(page).toHaveURL('/');
    await page.goto('/post/about');
    const articleMeta = await page.locator('.article-meta-inline').boundingBox();
    const articleTitle = await page.locator('.article-heading h1').boundingBox();
    expect(articleMeta!.y + articleMeta!.height).toBeLessThanOrEqual(articleTitle!.y);
  });
}

test('category dropdown supports keyboard, dismissal and routes', async ({ page }) => {
  await page.goto('/');
  const summary = page.locator('.category-menu summary');
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('navigation', { name: 'カテゴリー', exact: true })).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.locator('.category-menu a').first()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(summary).toBeFocused();
  await expect(page.locator('.category-menu')).not.toHaveAttribute('open', '');
  await summary.press('Enter');
  await page.locator('.category-menu a[href="/category/software/"]').click();
  await expect(page).toHaveURL('/category/software/');
  await expect(page.locator('h1')).toBeVisible();
});

test('scenery is static when reduced motion is requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  for (const decoration of await page.locator('.cloud, .water').all()) {
    await expect(decoration).toHaveCSS('animation-name', 'none');
  }
});

test('note dialogs preserve history, Escape and focus restoration', async ({ page }) => {
  await page.goto('/notes/');
  const note = page.locator('[data-note-card-link]').first();
  const href = await note.getAttribute('href');
  await note.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page).toHaveURL(href!);
  await page.goBack();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.goForward();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(note).toBeFocused();
});
