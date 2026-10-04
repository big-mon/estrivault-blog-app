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

for (const [width, height, deviceScaleFactor] of [
  [3840, 2160, 1],
  [3072, 1728, 1.25],
  [2560, 1440, 1.5],
  [1920, 1080, 2],
]) {
  test(`4K scenery covers the gutters at ${width}x${height} CSS pixels, DPR ${deviceScaleFactor}`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      baseURL,
      viewport: { width, height },
      deviceScaleFactor,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    try {
      for (const path of [
        '/',
        '/post/about',
        '/2/',
        '/category/software/',
        '/tag/aiコーディング/',
      ]) {
        await page.goto(path);
        for (const bottom of [false, true]) {
          await page.evaluate(
            (end) => scrollTo(0, end ? document.documentElement.scrollHeight : 0),
            bottom,
          );
          const geometry = await page.evaluate(() => {
            const rect = (selector: string) =>
              document.querySelector(selector)!.getBoundingClientRect().toJSON();
            return {
              scene: rect('.woodland'),
              left: rect('.woodland-left'),
              right: rect('.woodland-right'),
              surface: rect('body > main'),
              // The body box excludes the root's reserved scrollbar gutter.
              width: document.body.getBoundingClientRect().width,
              height: innerHeight,
              dpr: devicePixelRatio,
              pageEnd: document.documentElement.scrollHeight,
              scroll: scrollY,
              overflow: document.documentElement.scrollWidth > innerWidth,
            };
          });
          expect(geometry.dpr).toBe(deviceScaleFactor);
          expect(geometry.scene.x).toBe(0);
          expect(geometry.scene.y).toBe(0);
          expect(geometry.scene.bottom).toBe(geometry.height);
          expect(geometry.left.x).toBe(0);
          expect(geometry.right.right).toBe(geometry.width);
          expect(geometry.left.right).toBeGreaterThanOrEqual(geometry.surface.left);
          expect(geometry.right.left).toBeLessThanOrEqual(geometry.surface.right);
          expect(geometry.left.height / geometry.left.width).toBeCloseTo(1.5);
          expect(geometry.right.height / geometry.right.width).toBeCloseTo(1.5);
          expect(geometry.overflow).toBe(false);
          expect(
            Math.abs(geometry.surface.bottom + geometry.scroll - geometry.pageEnd),
          ).toBeLessThanOrEqual(1);
        }
      }
    } finally {
      await context.close();
    }
  });
}

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
            for (const ripple of await page.locator('.woodland-mobile .water').all()) {
              await expect(ripple).toHaveCSS('animation-name', 'none');
            }
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

for (const width of [390, 820, 1440, 3840]) {
  test(`ambient motion stays decorative and pauses offscreen at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 3840 ? 2160 : 900 });
    await page.goto('/');
    const scene = page.locator('.woodland');
    await expect(scene).not.toHaveAttribute('data-motion-paused');
    const contentBefore = await page.locator('body > main').boundingBox();
    const cloud = page.locator('.cloud-left');
    const before = (await cloud.boundingBox())!.x;
    await expect.poll(async () => (await cloud.boundingBox())!.x).toBeGreaterThan(before + 2);
    expect(await page.locator('body > main').boundingBox()).toEqual(contentBefore);

    const cadence = await page.locator('.cloud').evaluateAll(async (clouds) => {
      const samples: number[][] = [];
      const started = performance.now();
      for (let i = 0; i <= 40; i++) {
        samples.push(clouds.map((element) => element.getBoundingClientRect().x));
        if (i < 40) await new Promise((resolve) => setTimeout(resolve, 50));
      }
      return clouds.map((_, index) => ({
        seconds: (performance.now() - started) / 1000,
        changes: samples
          .slice(1)
          .map((sample, i) => sample[index] - samples[i][index])
          .filter((delta) => delta !== 0),
      }));
    });
    for (const { seconds, changes } of cadence) {
      expect(changes.length / seconds).toBeGreaterThan(1.4);
      expect(changes.length / seconds).toBeLessThan(2.6);
      for (const step of changes) expect(step).toBeCloseTo(1, 3);
    }

    const layers = width <= 1100 ? '.woodland-mobile' : '.woodland-right';
    const motion = await page.evaluate(async (scope) => {
      const leaf = document.querySelector(`${scope} .breeze`)!;
      const water = document.querySelector(`${scope} .water`)!;
      const crown = document.querySelector(`${scope} .tree-crown > path:first-child`)!;
      const fixed = JSON.stringify(crown.getBoundingClientRect());
      const main = document.querySelector('body > main')!.getBoundingClientRect();
      const visible = [leaf, water].every((element) => {
        const rect = element.getBoundingClientRect();
        return (
          rect.right > 0 &&
          rect.left < innerWidth &&
          rect.bottom > 0 &&
          rect.top < innerHeight &&
          (innerWidth <= 1100 ?
            rect.bottom <= 176
          : rect.right - Math.max(rect.left, main.right) >= 20)
        );
      });
      const samples: number[][] = [];
      let crownStationary = true;
      for (let i = 0; i <= 30; i++) {
        samples.push(
          [leaf, water].map((element) => new DOMMatrix(getComputedStyle(element).transform).m41),
        );
        crownStationary &&= JSON.stringify(crown.getBoundingClientRect()) === fixed;
        if (i < 30) await new Promise((resolve) => setTimeout(resolve, 200));
      }
      return {
        visible,
        crownStationary,
        spans: [0, 1].map((index) => {
          const positions = samples.map((sample) => sample[index]);
          return Math.max(...positions) - Math.min(...positions);
        }),
      };
    }, layers);
    expect(motion.visible).toBe(true);
    expect(motion.crownStationary).toBe(true);
    expect(motion.spans[0]).toBeGreaterThanOrEqual(3);
    expect(motion.spans[1]).toBeGreaterThanOrEqual(6);
    expect(await page.locator('body > main').boundingBox()).toEqual(contentBefore);

    // Both sides of a cloud's loop are outside the viewport: no visible teleport.
    const loop = await cloud.evaluate((element) => {
      const animation = element.getAnimations()[0];
      animation.pause();
      const { duration, delay } = animation.effect!.getTiming();
      animation.currentTime = Number(duration) + Number(delay) - 1;
      const exit = element.getBoundingClientRect().left;
      animation.currentTime = Number(duration) + Number(delay);
      const entrance = element.getBoundingClientRect().right;
      return { exit, entrance, width: innerWidth };
    });
    expect(loop.exit).toBeGreaterThanOrEqual(loop.width - 4);
    expect(loop.entrance).toBeLessThanOrEqual(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );

    if (width <= 1100) {
      await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
      await expect(scene).toHaveAttribute('data-motion-paused');
      await expect(page.locator('.woodland-mobile .breeze').first()).toHaveCSS(
        'animation-play-state',
        'paused',
      );
      await page.evaluate(() => scrollTo(0, 0));
      await expect(scene).not.toHaveAttribute('data-motion-paused');
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    expect(await scene.evaluate((element) => element.getAnimations({ subtree: true }).length)).toBe(
      0,
    );
    await expect(cloud).toBeInViewport();
    expect(await page.locator('body > main').boundingBox()).toEqual(contentBefore);
  });
}

for (const width of [320, 390, 820, 1440]) {
  test(`category context stays distinct without redundant counts at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/category/software/', '/category/software/2/']) {
      await page.goto(path);
      await expect(page.locator('.category-eyebrow')).toHaveText('カテゴリー');
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      await expect(page.locator('.category-heading h1')).toHaveText('開発・Web');
      await expect(page.locator('.archive-context')).not.toContainText(
        /件の記事|\d+\s*\/\s*\d+ページ/,
      );
      await expect(page.locator('.post-title').first()).toHaveJSProperty('tagName', 'H2');
      await expect(page.locator('.category-heading h1')).toHaveCSS('font-size', '24px');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
      await expect(page.getByRole('navigation', { name: 'ページネーション' })).toBeInViewport();
    }
    await page.getByRole('link', { name: '前のページ', exact: true }).click();
    await expect(page).toHaveURL('/category/software/');
    await page.getByRole('link', { name: '次のページ', exact: true }).click();
    await expect(page).toHaveURL('/category/software/2/');
    for (const path of ['/2/', '/tag/ai/']) {
      await page.goto(path);
      await expect(page.locator('.category-eyebrow')).toHaveCount(0);
      await expect(page.locator('.archive-context')).toContainText('件の記事');
    }
  });
}
