import { expect, test } from '@playwright/test';

const previewRoutes = [
  '/design-preview/industrial-slate',
  '/design-preview/archive-grid',
  '/design-preview/signal-frame',
];

for (const route of previewRoutes) {
  test(`design preview route renders for ${route}`, async ({ page }) => {
    await page.goto(route);

    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow',
    );
    await expect(page.locator('.dp-switcher')).toBeVisible();
    await expect(page.locator('.dp-featured-card, .dp-empty-state').first()).toBeVisible();
  });
}
