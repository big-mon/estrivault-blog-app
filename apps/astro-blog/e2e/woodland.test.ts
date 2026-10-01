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
    if (width <= 1100) await expect(page.locator('.woodland-mobile')).toBeVisible();
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

for (const width of [320, 360, 390, 430, 768, 820, 1024]) {
  test(`mobile footer ends cleanly on short and long pages at ${width}px`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      baseURL,
      isMobile: true,
      hasTouch: true,
      viewport: { width, height: 800 },
    });
    const page = await context.newPage();
    for (const reducedMotion of ['no-preference', 'reduce'] as const) {
      await page.emulateMedia({ reducedMotion });
      for (const path of ['/', '/tag/aiコーディング/', '/post/about']) {
        await page.goto(path);
        // Resize through small/large browser viewports, including a viewport taller than the short archive.
        for (const height of [600, 1400, 800]) {
          await page.setViewportSize({ width, height });
          await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
          await expect(page.locator('.editorial-footer')).toBeInViewport();
          await expect(page.locator('.woodland-right')).toBeHidden();
          await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(255, 253, 242)');
          const geometry = await page.evaluate(() => ({
            end: document.querySelector('body > main')!.getBoundingClientRect().bottom + scrollY,
            pageEnd: document.documentElement.scrollHeight,
            sceneEnd: document.querySelector('.woodland')!.getBoundingClientRect().bottom + scrollY,
            overflow: document.documentElement.scrollWidth > innerWidth,
          }));
          expect(Math.abs(geometry.end - geometry.pageEnd)).toBeLessThanOrEqual(1);
          expect(geometry.sceneEnd).toBe(176);
          expect(geometry.overflow).toBe(false);
          if (reducedMotion === 'reduce') {
            await expect(page.locator('.woodland-mobile .water')).toHaveCSS(
              'animation-name',
              'none',
            );
          }
          await page.evaluate(() => window.scrollTo(0, 0));
          await expect(page.locator('.woodland-mobile')).toBeInViewport();
        }
      }
    }
    await context.close();
  });
}

for (const width of [390, 820, 1024, 1440]) {
  test(`archives share the reading layout and green link palette at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const typography = await page
      .locator('.post-title')
      .first()
      .evaluate((node) => {
        const style = getComputedStyle(node);
        return [style.fontFamily, style.fontSize, style.fontWeight, style.lineHeight];
      });
    for (const path of ['/2/', '/category/software/', '/tag/ai/']) {
      await page.goto(path);
      await expect(page.locator('.editorial-masthead')).toBeVisible();
      await expect(page.locator('.archive-index h1')).toBeVisible();
      await expect(page.locator('[data-testid="post-card"], .archive-hero, .kicker')).toHaveCount(
        0,
      );
      await expect(page.locator('.post-row').first()).toBeVisible();
      expect(
        await page
          .locator('.post-title')
          .first()
          .evaluate((node) => {
            const style = getComputedStyle(node);
            return [style.fontFamily, style.fontSize, style.fontWeight, style.lineHeight];
          }),
      ).toEqual(typography);
      const legacyColors = await page
        .locator('a')
        .evaluateAll(
          (links) =>
            links.filter((link) =>
              ['rgb(168, 56, 34)', 'rgb(214, 69, 42)'].includes(getComputedStyle(link).color),
            ).length,
        );
      expect(legacyColors).toBe(0);
      await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
      await expect(page.locator('.editorial-footer')).toBeInViewport();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
    await page.goto('/');
    await page.getByRole('link', { name: '2ページ目', exact: true }).click();
    await expect(page).toHaveURL('/2/');
    await expect(page.locator('h1')).toHaveText('記事一覧');
    await page.getByRole('link', { name: '前のページ', exact: true }).click();
    await expect(page).toHaveURL('/');
  });
}

test('article and note body links use accessible green normal, hover and focus states', async ({
  page,
}) => {
  for (const path of ['/post/about', '/notes/2026-06-19_itsme']) {
    await page.goto(path);
    const link = page
      .locator('.article-body a:not(.heading-anchor), .note-body a:not(.heading-anchor)')
      .first();
    await expect(link).toBeVisible();
    await expect(link).toHaveCSS('color', 'rgb(62, 98, 73)');
    await link.hover();
    await expect(link).toHaveCSS('color', 'rgb(36, 69, 47)');
    await page.mouse.move(0, 0);
    await link.focus();
    await expect(link).toHaveCSS('outline-style', 'solid');
    await expect(link).toHaveCSS('outline-color', 'rgb(36, 69, 47)');
  }
});
