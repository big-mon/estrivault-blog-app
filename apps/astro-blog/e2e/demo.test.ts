import { expect, test } from '@playwright/test';

test('home page has expected h1', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
});

test('Japanese tag pages render with unencoded route segments', async ({ page }) => {
  await page.goto('/tag/プログラミング/');

  await expect(page.locator('h1')).toContainText('プログラミング');
  await expect(page.locator('article').first()).toBeVisible();
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

test('public discovery endpoints share one canonical URL inventory', async ({ request }) => {
  const [xmlResponse, markdownResponse] = await Promise.all([
    request.get('/sitemap.xml'),
    request.get('/sitemap.md'),
  ]);

  expect(xmlResponse.ok()).toBeTruthy();
  expect(xmlResponse.headers()['content-type']).toContain('application/xml');
  expect(markdownResponse.ok()).toBeTruthy();
  expect(markdownResponse.headers()['content-type']).toContain('text/markdown');

  const xml = await xmlResponse.text();
  const markdown = await markdownResponse.text();
  const xmlUrls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const markdownUrls = [...markdown.matchAll(/\]\(<([^>]+)>\)/g)].map((match) => match[1]);

  expect(new Set(markdownUrls)).toEqual(new Set(xmlUrls));
  expect(markdownUrls).toHaveLength(xmlUrls.length);

  const importantUrls = [
    'https://estrilda.damonge.com/post/about',
    'https://estrilda.damonge.com/notes/2026-06-20_独自性のある価値ある投稿',
    'https://estrilda.damonge.com/category/software/',
    'https://estrilda.damonge.com/tag/プログラミング/',
  ];
  for (const url of importantUrls) {
    const encodedUrl = encodeURI(url);
    expect(xmlUrls).toContain(encodedUrl);
    expect(markdownUrls).toContain(encodedUrl);
  }

  expect(markdown).toContain('[S\\&P500に勝てない、それでも個別株投資がやめられない]');
  expect(markdown).toContain('AT\\&T');
});

test('LLM guide points to both sitemaps and the removed full endpoint stays absent', async ({
  request,
}) => {
  const guideResponse = await request.get('/llms.txt');

  expect(guideResponse.ok()).toBeTruthy();
  expect(guideResponse.headers()['content-type']).toContain('text/markdown');
  const guide = await guideResponse.text();
  expect(guide).toContain('https://estrilda.damonge.com/sitemap.xml');
  expect(guide).toContain('https://estrilda.damonge.com/sitemap.md');

  const removedResponse = await request.get('/llms-full.txt');
  expect(removedResponse.status()).toBe(404);
});
