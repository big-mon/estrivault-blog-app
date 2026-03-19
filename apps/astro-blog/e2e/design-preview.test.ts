import { expect, test } from '@playwright/test';

const previewRoutes = [
  '/design-preview/white-palette',
  '/design-preview/luxury-01',
  '/design-preview/luxury-04',
  '/design-preview/luxury-07',
];

for (const route of previewRoutes) {
  test(`design preview route renders for ${route}`, async ({ page }) => {
    await page.goto(route);

    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow',
    );
    await expect(page.locator('.dp-switcher')).toBeVisible();
    await expect(page.locator('.dp-index-shell, .dp-empty-state').first()).toBeVisible();
  });
}
