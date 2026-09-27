import { expect, test } from '@playwright/test';
import { processMarkdown } from '@estrivault/content-processor';

for (const width of [1280, 390]) {
  test(`native note dialog preserves navigation and focus at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/notes/');
    const card = page.locator('[data-note-card-link]').first();
    const href = await card.getAttribute('href');
    const dialog = page.getByRole('dialog');
    const close = dialog.getByRole('button', { name: 'Close note' });

    await card.click();
    await expect(dialog).toBeVisible();
    await expect(page).toHaveURL(new URL(href!, page.url()).href);
    expect(await dialog.evaluate((element) => element.matches('dialog:modal'))).toBe(true);
    await expect(close).toBeFocused();
    await expect(page.locator('html')).toHaveCSS('overflow', 'hidden');
    await page.keyboard.press('Tab');
    await expect(dialog.locator('[data-note-page-link]')).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(close).toBeFocused();
    await card.evaluate((element: HTMLElement) => element.focus());
    await expect(close).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(page).toHaveURL(/\/notes\/$/);
    await expect(card).toBeFocused();
    await expect(page.locator('html')).not.toHaveClass(/note-modal-open/);

    await page.goForward();
    await expect(dialog).toBeVisible();
    await page.goBack();
    await expect(dialog).not.toBeVisible();
    await expect(card).toBeFocused();

    await card.click();
    await page.mouse.click(2, 2);
    await expect(dialog).not.toBeVisible();
    await expect(card).toBeFocused();
    await card.click();
    await close.click();
    await expect(dialog).not.toBeVisible();

    await card.click();
    await dialog.locator('[data-note-page-link]').click();
    await expect(page.locator('.note-detail h1')).toBeVisible();
    await expect(dialog).toHaveCount(0);
    await page.goBack();
    await expect(page).toHaveURL(/\/notes\/$/);
    await expect(page.locator('[data-note-card-link]').first()).toBeVisible();
  });

  test(`OGP cards share responsive CSS in articles and notes at ${width}px`, async ({ page }) => {
    const url = 'https://example.test/card';
    const image =
      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="230" height="120"%3E%3C/svg%3E';
    const { html } = await processMarkdown(`---\ntitle: Card\n---\n${url}`, {
      cloudinaryCloudName: 'damonge',
      ogp: {
        mode: 'cache-only',
        metadataStore: {
          entries: { [url]: { title: 'Card title', description: 'Card description', image } },
        },
      },
    });
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/post/about');
    await page.locator('.article-body').evaluate((element, markup) => {
      element.innerHTML = markup;
      const note = document.createElement('div');
      note.className = 'note-body';
      note.innerHTML = markup;
      element.after(note);
    }, html);

    for (const body of ['.article-body', '.note-body']) {
      const card = page.locator(`${body} a.link-card`);
      await expect(card).toHaveCSS('display', 'flex');
      await expect(card).toHaveCSS('text-decoration-line', 'none');
      await expect(card.locator('.link-card-image')).toHaveCSS(
        'width',
        width < 640 ? '120px' : '230px',
      );
      await expect(card.locator('img')).toBeVisible();
      await expect(card.locator('.link-card-placeholder')).not.toBeVisible();
      await card.hover();
      await expect(card).toHaveCSS('border-top-color', 'rgb(9, 105, 218)');
      await card.locator('img').evaluate((element) => element.dispatchEvent(new Event('error')));
      await expect(card.locator('img')).not.toBeVisible();
      await expect(card.getByRole('img', { name: '画像の読み込みに失敗しました' })).toBeVisible();
    }
  });
}

test('note links remain standalone navigation without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4173/notes/');
    await page.locator('[data-note-card-link]').first().click();
    await expect(page.locator('.note-detail h1')).toBeVisible();
  } finally {
    await context.close();
  }
});
