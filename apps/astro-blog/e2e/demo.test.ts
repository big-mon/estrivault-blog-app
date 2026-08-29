import { readFile } from 'node:fs/promises';

import { expect, test } from '@playwright/test';

const countSerializedHeadings = (html: string, level: 1 | 2 | 3) =>
  html.match(new RegExp(`<h${level}\\b`, 'gi'))?.length ?? 0;

test('built deployment advertises discovery resources from the homepage only', async () => {
  const headers = await readFile(new URL('../dist/_headers', import.meta.url), 'utf8');
  const homepageRule = headers
    .split(/\r?\n\s*\r?\n/)
    .find((block) => block.split(/\r?\n/, 1)[0] === '/');

  expect(homepageRule).toBeDefined();
  expect(homepageRule).toContain('Link: </llms.txt>; rel="describedby"; type="text/markdown"');
  expect(homepageRule).toContain('Link: </sitemap.xml>; rel="describedby"; type="application/xml"');
  expect(homepageRule).toContain('Link: </sitemap.md>; rel="describedby"; type="text/markdown"');
});

test('home page has expected h1', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
});

test('homepage serializes site-name h1, hero h2, and recent notes hierarchy', async ({ page }) => {
  await page.goto('/');

  const html = await page.content();
  expect(countSerializedHeadings(html, 1)).toBe(1);
  await expect(page.locator('h1')).toHaveText('Estrilda');
  await expect(page.locator('.editorial-masthead h1')).toHaveText('Estrilda');
  await expect(page.locator('.hero-copy h1')).toHaveCount(0);
  await expect(page.locator('.hero-copy h2')).toHaveText('投資、開発、AI、趣味の実践ログ。');

  const recentNotes = page.locator('#recent-notes');
  await expect(recentNotes.locator('.section-heading-row > h2')).toHaveText('RECENT NOTES');

  const noteCards = recentNotes.locator('.recent-notes-grid > [data-note-card-link]');
  const noteCardCount = await noteCards.count();
  expect(noteCardCount).toBeGreaterThan(0);
  await expect(recentNotes.locator('.recent-notes-grid h2')).toHaveCount(0);
  await expect(recentNotes.locator('.recent-notes-grid h3')).toHaveCount(noteCardCount);
});

test('notes archive serializes one Notes h1 and uses h2 for note cards', async ({ page }) => {
  await page.goto('/notes/');

  const html = await page.content();
  expect(countSerializedHeadings(html, 1)).toBe(1);
  await expect(page.locator('h1')).toHaveText('Notes');
  await expect(page.locator('.editorial-masthead h1')).toHaveCount(0);

  const noteCards = page.locator('[data-notes-grid] > [data-note-card-link]');
  const noteCardCount = await noteCards.count();
  expect(noteCardCount).toBeGreaterThan(0);
  await expect(page.locator('[data-notes-grid] h2')).toHaveCount(noteCardCount);
  await expect(page.locator('[data-notes-grid] h3')).toHaveCount(0);
});

test('modal note title stays labelled while standalone notes retain an h1', async ({ page }) => {
  await page.goto('/');

  const noteCard = page.locator('#recent-notes [data-note-card-link]').first();
  const noteTitle = await noteCard.locator('h3').innerText();
  const noteHref = await noteCard.getAttribute('href');
  expect(noteHref).toBeTruthy();

  await noteCard.click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute('aria-labelledby', 'note-modal-title');
  const modalTitle = dialog.locator('h2#note-modal-title');
  await expect(modalTitle).toHaveText(noteTitle);
  await expect(dialog.locator('h1')).toHaveCount(0);
  await expect(modalTitle.locator('a[data-note-page-link]')).toHaveAttribute('href', noteHref!);

  await page.goto(noteHref!);
  const standaloneHtml = await page.content();
  expect(countSerializedHeadings(standaloneHtml, 1)).toBe(1);
  await expect(page.locator('.note-detail h1')).toHaveText(noteTitle);
  await expect(page.locator('.editorial-masthead h1')).toHaveCount(0);
});

test('Japanese tag pages render with unencoded route segments', async ({ page }) => {
  await page.goto('/tag/プログラミング/');

  await expect(page.locator('h1')).toContainText('プログラミング');
  await expect(page.locator('article').first()).toBeVisible();
});

test('colliding AI tags render distinct archive headings and article sets', async ({ page }) => {
  const articleTitle = 'AI時代に人間が手放してはいけないもの';

  await page.goto('/tag/ai/');
  await expect(page.locator('h1')).toHaveText('#AI');
  const aiArticleTitles = await page.locator('.post-title').allTextContents();
  expect(aiArticleTitles).toContain(articleTitle);

  await page.goto('/tag/aiコーディング/');
  await expect(page.locator('h1')).toHaveText('#AIコーディング');
  await expect(page.locator('.post-title')).toHaveText([articleTitle]);
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
  expect(markdown.split(/\r?\n/, 1)[0]).toBe('# Estrilda public sitemap');
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
  expect(guide.split(/\r?\n/, 1)[0]).toBe('# Estrilda');
  expect(guide).toContain('https://estrilda.damonge.com/sitemap.xml');
  expect(guide).toContain('https://estrilda.damonge.com/sitemap.md');

  const removedResponse = await request.get('/llms-full.txt');
  expect(removedResponse.status()).toBe(404);
});

test('standard pages expose the canonical public site name in the footer', async ({ page }) => {
  await page.goto('/2/');

  await expect(page.locator('footer p')).toContainText('Estrilda');
  await expect(page.locator('footer p')).not.toContainText('Estrivault');
});

test('agent API index and posts expose the public read-only collection', async ({ request }) => {
  const indexResponse = await request.get('/api/v1/index.json');
  expect(indexResponse.ok()).toBeTruthy();
  expect(indexResponse.headers()['content-type']).toContain('application/json');

  const index = await indexResponse.json();
  expect(index).toMatchObject({
    api_version: '1',
    site: {
      name: 'Estrilda',
      url: 'https://estrilda.damonge.com/',
    },
    links: {
      posts: 'https://estrilda.damonge.com/api/v1/posts.json',
      categories: 'https://estrilda.damonge.com/api/v1/categories.json',
      tags: 'https://estrilda.damonge.com/api/v1/tags.json',
      notes: 'https://estrilda.damonge.com/api/v1/notes.json',
      openapi: 'https://estrilda.damonge.com/api/v1/openapi.json',
      api_catalog: 'https://estrilda.damonge.com/.well-known/api-catalog',
    },
  });
  expect(index.content_modified_at).toMatch(/Z$/);

  const postsResponse = await request.get('/api/v1/posts.json');
  expect(postsResponse.ok()).toBeTruthy();
  expect(postsResponse.headers()['content-type']).toContain('application/json');

  const posts = await postsResponse.json();
  expect(posts).toMatchObject({
    api_version: '1',
    total: 131,
    sort: '-date_published',
  });
  expect(posts.items).toHaveLength(posts.total);
  expect(new Set(posts.items.map((post: { slug: string }) => post.slug)).size).toBe(posts.total);

  const firstPost = posts.items[0];
  expect(firstPost).toMatchObject({
    slug: expect.any(String),
    title: expect.any(String),
    description: expect.any(String),
    canonical_url: expect.stringMatching(/^https:\/\/estrilda\.damonge\.com\/post\//),
    date_published: expect.stringMatching(/Z$/),
    date_modified: expect.stringMatching(/Z$/),
    category: {
      slug: expect.any(String),
      label: expect.any(String),
    },
    tags: expect.any(Array),
    representations: {
      html: {
        url: expect.stringMatching(/^https:\/\/estrilda\.damonge\.com\/post\//),
        media_type: 'text/html',
      },
      markdown: {
        url: expect.stringMatching(/^https:\/\/estrilda\.damonge\.com\/post\//),
        media_type: 'text/markdown',
        request_headers: { Accept: 'text/markdown' },
      },
    },
  });
});

test('agent API categories expose exact post projections', async ({ request }) => {
  const postsResponse = await request.get('/api/v1/posts.json');
  expect(postsResponse.ok()).toBeTruthy();
  const posts = await postsResponse.json();

  const categoriesResponse = await request.get('/api/v1/categories.json');
  expect(categoriesResponse.ok()).toBeTruthy();
  expect(categoriesResponse.headers()['content-type']).toContain('application/json');

  const categories = await categoriesResponse.json();
  expect(categories).toMatchObject({
    api_version: '1',
    sort: 'slug',
    total: categories.items.length,
  });
  expect(new Set(categories.items.map((category: { slug: string }) => category.slug)).size).toBe(
    categories.total,
  );

  for (const category of categories.items) {
    const expectedItems = posts.items.filter(
      (post: { category: { slug: string } }) => post.category.slug === category.slug,
    );
    expect(category).toMatchObject({
      slug: expect.any(String),
      label: expect.any(String),
      description: expect.any(String),
      article_count: expectedItems.length,
      html_url: `https://estrilda.damonge.com/category/${category.slug}/`,
      api_url: `https://estrilda.damonge.com/api/v1/categories/${category.slug}.json`,
    });

    const detailResponse = await request.get(`/api/v1/categories/${category.slug}.json`);
    expect(detailResponse.ok()).toBeTruthy();
    expect(detailResponse.headers()['content-type']).toContain('application/json');
    const detail = await detailResponse.json();
    expect(detail.category).toEqual(category);
    expect(detail.total).toBe(category.article_count);
    expect(detail.items).toEqual(expectedItems);
  }
});

test('agent API tags preserve collision-aware labels and post projections', async ({ request }) => {
  const postsResponse = await request.get('/api/v1/posts.json');
  expect(postsResponse.ok()).toBeTruthy();
  const posts = await postsResponse.json();

  const tagsResponse = await request.get('/api/v1/tags.json');
  expect(tagsResponse.ok()).toBeTruthy();
  expect(tagsResponse.headers()['content-type']).toContain('application/json');

  const tags = await tagsResponse.json();
  expect(tags).toMatchObject({
    api_version: '1',
    sort: 'slug',
    total: tags.items.length,
  });
  expect(new Set(tags.items.map((tag: { slug: string }) => tag.slug)).size).toBe(tags.total);

  const tagsByLabel = new Map(
    tags.items.map((tag: { label: string; slug: string }) => [tag.label, tag.slug]),
  );
  expect(tagsByLabel.get('AI')).toBe('ai');
  expect(tagsByLabel.get('AIコーディング')).toBe('aiコーディング');
  expect(tagsByLabel.get('SBI証券')).toBe('sbi');
  expect(tagsByLabel.get('自作PC')).toBe('pc');

  for (const tag of tags.items) {
    const expectedItems = posts.items.filter((post: { tags: string[] }) =>
      post.tags.includes(tag.label),
    );
    expect(tag).toMatchObject({
      slug: expect.any(String),
      label: expect.any(String),
      article_count: expectedItems.length,
      html_url: `https://estrilda.damonge.com/tag/${encodeURIComponent(tag.slug)}/`,
      api_url: `https://estrilda.damonge.com/api/v1/tags/${encodeURIComponent(tag.slug)}.json`,
    });

    const detailResponse = await request.get(`/api/v1/tags/${encodeURIComponent(tag.slug)}.json`);
    expect(detailResponse.ok()).toBeTruthy();
    expect(detailResponse.headers()['content-type']).toContain('application/json');
    const detail = await detailResponse.json();
    expect(detail.tag).toEqual(tag);
    expect(detail.total).toBe(tag.article_count);
    expect(detail.items).toEqual(expectedItems);
    expect(new Set(detail.items.map((post: { slug: string }) => post.slug)).size).toBe(
      detail.items.length,
    );
  }
});

test('agent API notes expose the analogous public document representations', async ({
  request,
}) => {
  const response = await request.get('/api/v1/notes.json');
  expect(response.ok()).toBeTruthy();
  expect(response.headers()['content-type']).toContain('application/json');

  const notes = await response.json();
  expect(notes).toMatchObject({
    api_version: '1',
    total: 2,
    sort: '-date_published',
  });
  expect(notes.items).toHaveLength(notes.total);
  expect(new Set(notes.items.map((note: { slug: string }) => note.slug)).size).toBe(notes.total);

  for (const note of notes.items) {
    expect(note).toMatchObject({
      slug: expect.any(String),
      title: expect.any(String),
      description: expect.any(String),
      canonical_url: expect.stringMatching(/^https:\/\/estrilda\.damonge\.com\/notes\//),
      date_published: expect.stringMatching(/Z$/),
      date_modified: expect.stringMatching(/Z$/),
      tags: expect.any(Array),
      representations: {
        html: {
          url: expect.stringMatching(/^https:\/\/estrilda\.damonge\.com\/notes\//),
          media_type: 'text/html',
        },
        markdown: {
          url: expect.stringMatching(/^https:\/\/estrilda\.damonge\.com\/notes\//),
          media_type: 'text/markdown',
          request_headers: { Accept: 'text/markdown' },
        },
      },
    });
    expect(note).not.toHaveProperty('category');
  }
});

test('agent API OpenAPI, catalog, and homepage discovery are complete and explicit', async () => {
  const readJson = async (relativePath: string) =>
    JSON.parse(await readFile(new URL(`../${relativePath}`, import.meta.url), 'utf8'));

  const openapi = await readJson('dist/api/v1/openapi.json');
  expect(openapi.openapi).toMatch(/^3\.1\./);
  expect(openapi.servers).toEqual([{ url: 'https://estrilda.damonge.com' }]);
  expect(openapi.security).toBeUndefined();
  expect(openapi.components?.securitySchemes).toBeUndefined();

  const expectedPaths = [
    '/api/v1/index.json',
    '/api/v1/posts.json',
    '/api/v1/categories.json',
    '/api/v1/categories/{slug}.json',
    '/api/v1/tags.json',
    '/api/v1/tags/{tag}.json',
    '/api/v1/notes.json',
    '/api/v1/openapi.json',
  ];
  expect(Object.keys(openapi.paths).sort()).toEqual(expectedPaths.sort());
  for (const path of expectedPaths) {
    const operation = openapi.paths[path].get;
    expect(operation.responses['200'].content['application/json'].schema).toBeDefined();
  }
  expect(openapi.paths['/api/v1/categories/{slug}.json'].get.parameters).toEqual([
    { name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
  ]);
  expect(openapi.paths['/api/v1/tags/{tag}.json'].get.parameters).toEqual([
    { name: 'tag', in: 'path', required: true, schema: { type: 'string' } },
  ]);
  expect(JSON.stringify(openapi)).not.toMatch(/search|pagination|status/i);

  const apiIndex = await readJson('dist/api/v1/index.json');
  const catalog = await readJson('dist/.well-known/api-catalog');
  expect(Object.keys(catalog)).toEqual(['linkset']);
  expect(catalog.linkset).toHaveLength(1);
  expect(catalog.linkset[0]).toEqual({
    anchor: 'https://estrilda.damonge.com/api/v1/index.json',
    'service-desc': [
      {
        href: 'https://estrilda.damonge.com/api/v1/openapi.json',
        type: 'application/json',
      },
    ],
    'service-doc': [
      {
        href: 'https://estrilda.damonge.com/llms.txt',
        type: 'text/markdown',
      },
    ],
  });
  expect(catalog.linkset[0].status).toBeUndefined();
  const anchoredApiPath = new URL(catalog.linkset[0].anchor).pathname;
  expect(anchoredApiPath).toBe('/api/v1/index.json');
  expect(
    JSON.parse(await readFile(new URL(`../dist${anchoredApiPath}`, import.meta.url), 'utf8')),
  ).toEqual(apiIndex);

  const guide = await readFile(new URL('../dist/llms.txt', import.meta.url), 'utf8');
  expect(guide).toContain('https://estrilda.damonge.com/api/v1/index.json');
  expect(guide).toContain('https://estrilda.damonge.com/.well-known/api-catalog');

  const homepage = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
  expect(homepage).toContain(
    '<link rel="api-catalog" type="application/linkset+json" href="/.well-known/api-catalog"',
  );

  const headers = await readFile(new URL('../dist/_headers', import.meta.url), 'utf8');
  const homepageRule = headers
    .split(/\r?\n\s*\r?\n/)
    .find((block) => block.split(/\r?\n/, 1)[0] === '/');
  expect(homepageRule).toContain('Link: </.well-known/api-catalog>; rel="api-catalog"');
  const catalogRule = headers
    .split(/\r?\n\s*\r?\n/)
    .find((block) => block.split(/\r?\n/, 1)[0] === '/.well-known/api-catalog');
  expect(catalogRule).toContain('Content-Type: application/linkset+json; charset=utf-8');
  expect(catalogRule).toContain('Link: </.well-known/api-catalog>; rel="api-catalog"');
  const apiRule = headers
    .split(/\r?\n\s*\r?\n/)
    .find((block) => block.split(/\r?\n/, 1)[0] === '/api/v1/*');
  expect(apiRule).toContain('Access-Control-Allow-Origin: *');
  expect(apiRule).toContain('X-Content-Type-Options: nosniff');
  expect(apiRule).toContain('Content-Type: application/json; charset=utf-8');
});

test('agent API output is public-only, internally consistent, and deterministic', async () => {
  const readText = (relativePath: string) =>
    readFile(new URL(`../${relativePath}`, import.meta.url), 'utf8');
  const readJson = async (relativePath: string) => JSON.parse(await readText(relativePath));
  const maxDate = (items: Array<{ date_published: string; date_modified: string }>) =>
    items.reduce(
      (latest, item) =>
        [item.date_published, item.date_modified].reduce(
          (itemLatest, date) => (date > itemLatest ? date : itemLatest),
          latest,
        ),
      '1970-01-01T00:00:00.000Z',
    );
  const assertStableJson = async (relativePath: string, value: unknown) => {
    expect(await readText(relativePath)).toBe(`${JSON.stringify(value)}\n`);
  };

  const posts = await readJson('dist/api/v1/posts.json');
  const notes = await readJson('dist/api/v1/notes.json');
  const categories = await readJson('dist/api/v1/categories.json');
  const tags = await readJson('dist/api/v1/tags.json');
  const index = await readJson('dist/api/v1/index.json');

  expect(posts.total).toBe(131);
  expect(notes.total).toBe(2);
  expect(new Set(posts.items.map((post: { slug: string }) => post.slug)).size).toBe(131);
  expect(new Set(notes.items.map((note: { slug: string }) => note.slug)).size).toBe(2);
  expect(posts.items.every((post: object) => !('draft' in post))).toBeTruthy();
  for (const item of [...posts.items, ...notes.items]) {
    expect(item.tags).toEqual(
      [...item.tags].sort((left: string, right: string) =>
        left < right ? -1
        : left > right ? 1
        : 0,
      ),
    );
  }

  const sitemap = await readText('dist/sitemap.xml');
  const sitemapPostSlugs = new Set(
    [...sitemap.matchAll(/<loc>(https:\/\/estrilda\.damonge\.com\/post\/[^<]+)<\/loc>/g)].map(
      (match) => decodeURIComponent(match[1].slice('https://estrilda.damonge.com/post/'.length)),
    ),
  );
  expect(sitemapPostSlugs.size).toBe(posts.total);
  expect(new Set(posts.items.map((post: { slug: string }) => post.slug))).toEqual(sitemapPostSlugs);

  expect(posts.content_modified_at).toBe(maxDate(posts.items));
  expect(notes.content_modified_at).toBe(maxDate(notes.items));
  expect(categories.content_modified_at).toBe(maxDate(posts.items));
  expect(tags.content_modified_at).toBe(maxDate(posts.items));
  expect(index.content_modified_at).toBe(maxDate([...posts.items, ...notes.items]));

  for (const post of posts.items) {
    expect(new URL(post.canonical_url).origin).toBe('https://estrilda.damonge.com');
    expect(post.representations.html.url).toBe(post.canonical_url);
    expect(post.representations.markdown.url).toBe(post.canonical_url);
    expect(post.representations.markdown.request_headers).toEqual({ Accept: 'text/markdown' });
  }
  for (const note of notes.items) {
    expect(new URL(note.canonical_url).origin).toBe('https://estrilda.damonge.com');
    expect(note.representations.html.url).toBe(note.canonical_url);
    expect(note.representations.markdown.url).toBe(note.canonical_url);
    expect(note.representations.markdown.request_headers).toEqual({ Accept: 'text/markdown' });
  }

  expect(
    categories.items.reduce(
      (total: number, item: { article_count: number }) => total + item.article_count,
      0,
    ),
  ).toBe(posts.total);
  for (const category of categories.items) {
    const detail = await readJson(`dist/api/v1/categories/${category.slug}.json`);
    expect(detail.content_modified_at).toBe(maxDate(detail.items));
    expect(detail.total).toBe(category.article_count);
    expect(new URL(category.html_url).origin).toBe('https://estrilda.damonge.com');
    expect(new URL(category.api_url).origin).toBe('https://estrilda.damonge.com');
  }

  expect(
    tags.items.reduce(
      (total: number, item: { article_count: number }) => total + item.article_count,
      0,
    ),
  ).toBeGreaterThanOrEqual(posts.total);
  for (const tag of tags.items) {
    const detail = await readJson(`dist/api/v1/tags/${tag.slug}.json`);
    expect(detail.content_modified_at).toBe(maxDate(detail.items));
    expect(detail.total).toBe(tag.article_count);
    expect(new URL(tag.html_url).origin).toBe('https://estrilda.damonge.com');
    expect(new URL(tag.api_url).origin).toBe('https://estrilda.damonge.com');
    expect(new Set(detail.items.map((post: { slug: string }) => post.slug)).size).toBe(
      detail.total,
    );
  }

  for (const relativePath of [
    'dist/api/v1/index.json',
    'dist/api/v1/posts.json',
    'dist/api/v1/categories.json',
    'dist/api/v1/tags.json',
    'dist/api/v1/notes.json',
    'dist/api/v1/openapi.json',
    'dist/.well-known/api-catalog',
  ]) {
    await assertStableJson(relativePath, await readJson(relativePath));
  }
});
