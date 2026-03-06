import { expect, test } from '@playwright/test';

test('home page has expected h1', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
});

test('post pages expose generated OGP images', async ({ page, request }) => {
  await page.goto('/post/about');

  const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
  const twitterImage = await page.locator('meta[name="twitter:image"]').getAttribute('content');

  expect(ogImage).toBe('https://estrilda.damonge.com/post/about/og.png');
  expect(twitterImage).toBe('https://estrilda.damonge.com/post/about/og.png');
  expect(ogImage).not.toContain('/Hero/');
  expect(twitterImage).not.toContain('/Hero/');

  const response = await request.get('/post/about/og.png');

  expect(response.ok()).toBeTruthy();
  expect(response.headers()['content-type']).toContain('image/png');
});
