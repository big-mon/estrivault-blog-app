import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import yaml from 'yaml';
import { processMarkdown } from '@estrivault/content-processor';

import {
  generateMarkdownArtifacts,
  renderArticleMarkdown,
  renderHomepageMarkdown,
  renderNoteMarkdown,
} from './generate-markdown-artifacts.mjs';

const require = createRequire(
  new URL('../../../packages/content-processor/package.json', import.meta.url),
);
const matter = require('gray-matter');

const ARTICLE_METADATA_KEYS = [
  'title',
  'description',
  'canonical_url',
  'site_name',
  'site_url',
  'language',
  'content_type',
  'author',
  'date_published',
  'date_modified',
  'category',
  'tags',
  'featured_image',
];

const HOMEPAGE_METADATA_KEYS = [
  'title',
  'description',
  'canonical_url',
  'site_name',
  'site_url',
  'language',
  'content_type',
  'author',
];

const site = {
  title: 'Example Site',
  description: 'A source-native archive.',
  author: 'Example Author',
  url: 'https://example.test/',
  language: 'ja',
};

const codeFence = '```';
const rootRelativeMarkdownImageDestination = /!\[[^\]]*\]\(\s*<?\//m;

const articleMeta = {
  slug: 'resolved-article',
  title: 'Resolved article title',
  description: 'Resolved article description.',
  publishedAt: new Date('2026-01-02T03:04:05.000Z'),
  updatedAt: undefined,
  category: 'software',
  tags: ['one', 'two'],
  coverImage: '/images/article.png',
  draft: false,
  readingTime: 3,
  sourceOnlyField: 'must not be published',
};

const articleSource = `---
title: Source title that must not leak
description: Source description that must not leak
slug: source-slug
draft: true
secret: must not be published
---
Lead text is preserved.

## Existing H2

### Existing H3

###### Existing H6

::amazon{asin="ASIN" name="Private book"}
::youtube{id="youtube-id"}
::twitter{id="tweet-id"}
:::amazon{asin="CONTAINER-ASIN"}
Private Amazon content.
:::
:::info
Info body with **markdown**.
:::

:::warn
Warning body.
:::

:::alert
Alert body.
:::

:::message
Note body.
:::

:::custom{foo="bar"}
Unknown body.
:::

${codeFence}md
# heading inside code
::youtube
${codeFence}

After directives.
`;

function parseGenerated(markdown) {
  const parsed = matter(markdown);
  return { data: parsed.data, body: parsed.content };
}

test('article output uses an explicit public metadata allowlist and transforms source Markdown', () => {
  const { data, body } = parseGenerated(
    renderArticleMarkdown({
      source: articleSource,
      meta: articleMeta,
      site,
      canonicalUrl: 'https://example.test/post/resolved-article',
    }),
  );

  assert.deepEqual(Object.keys(data).sort(), [
    'author',
    'canonical_url',
    'category',
    'content_type',
    'date_modified',
    'date_published',
    'description',
    'featured_image',
    'language',
    'site_name',
    'site_url',
    'tags',
    'title',
  ]);
  assert.equal(data.title, articleMeta.title);
  assert.equal(data.description, articleMeta.description);
  assert.equal(data.canonical_url, 'https://example.test/post/resolved-article');
  assert.equal(data.content_type, 'article');
  assert.equal(data.category, articleMeta.category);
  assert.deepEqual(data.tags, articleMeta.tags);
  assert.equal(data.featured_image, articleMeta.coverImage);
  assert.equal(data.date_published, articleMeta.publishedAt.toISOString());
  assert.equal(data.date_modified, articleMeta.publishedAt.toISOString());

  assert.match(body, /^# Resolved article title\n/m);
  assert.match(body, /^## Existing H2$/m);
  assert.match(body, /^### Existing H3$/m);
  assert.match(body, /^###### Existing H6$/m);
  assert.doesNotMatch(body, /Source title that must not leak|secret:|draft:/);
  assert.doesNotMatch(body, /amazon|ASIN|Private book/);
  assert.ok(body.includes('\n[YouTube動画](https://www.youtube.com/watch?v=youtube-id)\n'));
  assert.ok(body.includes('\n[Xの投稿](https://x.com/i/status/tweet-id)\n'));
  assert.match(body, /> \*\*Info\*\*\n>\n> Info body with \*\*markdown\*\*\./);
  assert.match(body, /> \*\*Warning\*\*\n>\n> Warning body\./);
  assert.match(body, /> \*\*Warning\*\*\n>\n> Alert body\./);
  assert.match(body, /> \*\*Note\*\*\n>\n> Note body\./);
  assert.match(body, /> \*\*custom\*\*\n>\n> Unknown body\./);
  assert.match(body, /```md\n# heading inside code\n::youtube\n```/);
  assert.match(body, /After directives\./);
});

test('article body image destinations use Cloudinary without reserializing Markdown', () => {
  const fencedImage = [
    codeFence + 'svelte',
    '<img src="/Tech/fenced-raw.png" alt="Raw image" />',
    `![Fenced image](/Tech/fenced.png 'Fenced title')`,
    codeFence,
  ].join('\n');
  const rootRelativeImage = `![Alt text](/Tech/example.png 'Image title')`;
  const absoluteImage = `![Remote alt](https://cdn.example/remote.png "Remote title")`;
  const dataImage = `![Data alt](data:image/png;base64,abc 'Data title')`;
  const rootRelativeLink = '[Article link](/article/prose)';
  const source = `---\ntitle: Source\npublishedAt: 2026-01-01\n---\n${rootRelativeImage}\n${absoluteImage}\n${dataImage}\n${rootRelativeLink}\n${fencedImage}\n`;

  const { body } = parseGenerated(
    renderArticleMarkdown({
      source,
      meta: articleMeta,
      site,
      canonicalUrl: 'https://example.test/post/resolved-article',
      processorOptions: { cloudinaryCloudName: 'damonge' },
    }),
  );

  assert.match(
    body,
    /!\[Alt text\]\(https:\/\/res\.cloudinary\.com\/damonge\/image\/upload\/c_fit,w_1200\/f_auto\/q_90\/v1\/Tech\/example\?_a=[^ )]+ 'Image title'\)/,
  );
  assert.ok(body.includes(absoluteImage));
  assert.ok(body.includes(dataImage));
  assert.ok(body.includes(rootRelativeLink));
  assert.ok(body.includes(fencedImage));
  assert.doesNotMatch(body, /!\[Alt text\]\(\/Tech\/example\.png 'Image title'\)/);
});

test('image destination lookup ignores duplicate alt and title text', () => {
  const source =
    '---\ntitle: Source\npublishedAt: 2026-01-01\n---\n![/Tech/repeated.png](/Tech/repeated.png "/Tech/repeated.png")\n';

  const { body } = parseGenerated(
    renderArticleMarkdown({
      source,
      meta: articleMeta,
      site,
      canonicalUrl: 'https://example.test/post/resolved-article',
      processorOptions: { cloudinaryCloudName: 'damonge' },
    }),
  );

  assert.match(
    body,
    /!\[\/Tech\/repeated\.png\]\(https:\/\/res\.cloudinary\.com\/damonge\/image\/upload\/c_fit,w_1200\/f_auto\/q_90\/v1\/Tech\/repeated\?_a=[^ )]+ "\/Tech\/repeated\.png"\)/,
  );
});

test('body images inside demoted headings are projected without replacing heading text', () => {
  const source =
    '---\ntitle: Source\npublishedAt: 2026-01-01\n---\n# Heading ![Heading image](/Tech/heading.png)\n';
  const { body } = parseGenerated(
    renderArticleMarkdown({
      source,
      meta: articleMeta,
      site,
      canonicalUrl: 'https://example.test/post/resolved-article',
      processorOptions: { cloudinaryCloudName: 'damonge' },
    }),
  );

  assert.match(
    body,
    /^## Heading !\[Heading image\]\(https:\/\/res\.cloudinary\.com\/damonge\/image\/upload\/c_fit,w_1200\/f_auto\/q_90\/v1\/Tech\/heading\?_a=[^ )]+\)$/m,
  );
  assert.doesNotMatch(body, /^# Heading !\[Heading image\]\(\/Tech\/heading\.png\)$/m);
});

test('public Markdown and HTML body images share the same resolved URL', async () => {
  const source = `---\ntitle: Source\npublishedAt: 2026-01-01\n---\n![Alt text](/Tech/example.png 'Image title')\n`;
  const processorOptions = { cloudinaryCloudName: 'damonge' };
  const { body } = parseGenerated(
    renderArticleMarkdown({
      source,
      meta: articleMeta,
      site,
      canonicalUrl: 'https://example.test/post/resolved-article',
      processorOptions,
    }),
  );
  const publicImageMatch = body.match(/!\[Alt text\]\((\S+) 'Image title'\)/);
  assert.ok(publicImageMatch);

  const html = await processMarkdown(source, processorOptions, articleMeta.slug);
  assert.ok(html.html.includes(`<img src="${publicImageMatch[1]}"`));
});

test('note body images receive the Cloudinary processor options', () => {
  const source = `---\ntitle: Source note\npublishedAt: 2026-01-01\ntags: []\n---\n![Note alt](/Stocks/note.png 'Note title')\n`;
  const { body } = parseGenerated(
    renderNoteMarkdown({
      source,
      meta: {
        slug: 'resolved-note',
        title: 'Resolved note title',
        publishedAt: new Date('2026-01-01T00:00:00.000Z'),
        tags: [],
      },
      site,
      canonicalUrl: 'https://example.test/notes/resolved-note',
      processorOptions: { cloudinaryCloudName: 'damonge' },
    }),
  );

  assert.match(
    body,
    /!\[Note alt\]\(https:\/\/res\.cloudinary\.com\/damonge\/image\/upload\/c_fit,w_1200\/f_auto\/q_90\/v1\/Stocks\/note\?_a=[^ )]+ 'Note title'\)/,
  );
  assert.doesNotMatch(body, /!\[Note alt\]\(\/Stocks\/note\.png 'Note title'\)/);
});

test('transformable public body images require a usable Cloudinary cloud name', () => {
  assert.throws(
    () =>
      renderArticleMarkdown({
        source: '---\ntitle: Source\npublishedAt: 2026-01-01\n---\n![Alt](/Tech/image.png)\n',
        meta: articleMeta,
        site,
        canonicalUrl: 'https://example.test/post/resolved-article',
      }),
    /cloudinaryCloudName is required for body image transformation/,
  );
});

test('nested callout body image destinations use Cloudinary too', () => {
  const nestedImage = `![Nested alt](/Hero/nested.png 'Nested title')`;
  const source = `---\ntitle: Source\npublishedAt: 2026-01-01\n---\n:::info\n${nestedImage}\n:::\n`;

  const { body } = parseGenerated(
    renderArticleMarkdown({
      source,
      meta: articleMeta,
      site,
      canonicalUrl: 'https://example.test/post/resolved-article',
      processorOptions: { cloudinaryCloudName: 'damonge' },
    }),
  );

  assert.match(
    body,
    /> !\[Nested alt\]\(https:\/\/res\.cloudinary\.com\/damonge\/image\/upload\/c_fit,w_1200\/f_auto\/q_90\/v1\/Hero\/nested\?_a=[^ )]+ 'Nested title'\)/,
  );
  assert.doesNotMatch(body, /> !\[Nested alt\]\(\/Hero\/nested\.png 'Nested title'\)/);
});

test('standard containers recursively project nested directives without leaking affiliate markers', () => {
  const { body } = parseGenerated(
    renderArticleMarkdown({
      source:
        '---\ntitle: Source\npublishedAt: 2026-01-01\n---\n:::info\nInfo lead.\n::amazon{asin="NESTED-ASIN" name="Private book"}\n::youtube{id="nested-youtube"}\nInfo tail.\n:::\n',
      meta: articleMeta,
      site,
      canonicalUrl: 'https://example.test/post/resolved-article',
    }),
  );

  assert.match(body, /> \*\*Info\*\*/);
  assert.match(body, /> Info lead\./);
  assert.match(body, /> \[YouTube動画\]\(https:\/\/www\.youtube\.com\/watch\?v=nested-youtube\)/);
  assert.match(body, /> Info tail\./);
  assert.doesNotMatch(body, /::amazon|NESTED-ASIN|Private book|::youtube/);
  assert.equal((body.match(/^# Resolved article title$/gm) ?? []).length, 1);
});

test('unknown containers recursively project nested known leaf directives', () => {
  const { body } = parseGenerated(
    renderArticleMarkdown({
      source:
        '---\ntitle: Source\npublishedAt: 2026-01-01\n---\n:::custom\nCustom lead.\n::youtube{id="unknown-youtube"}\nCustom tail.\n:::\n',
      meta: articleMeta,
      site,
      canonicalUrl: 'https://example.test/post/resolved-article',
    }),
  );

  assert.match(body, /> \*\*custom\*\*/);
  assert.match(body, /> Custom lead\./);
  assert.match(body, /> \[YouTube動画\]\(https:\/\/www\.youtube\.com\/watch\?v=unknown-youtube\)/);
  assert.match(body, /> Custom tail\./);
  assert.doesNotMatch(body, /::youtube|id="unknown-youtube"/);
});

test('closed Amazon containers nested in unknown containers keep surrounding prose in the blockquote', () => {
  const { body } = parseGenerated(
    renderArticleMarkdown({
      source:
        '---\ntitle: Source\npublishedAt: 2026-01-01\n---\n:::custom\nBefore nested Amazon.\n:::amazon{asin="NESTED-ASIN"}\nPrivate Amazon content.\n:::\nAfter nested Amazon.\n:::\n',
      meta: articleMeta,
      site,
      canonicalUrl: 'https://example.test/post/resolved-article',
    }),
  );

  assert.match(body, /> \*\*custom\*\*\n>\n> Before nested Amazon\.\n>\n> After nested Amazon\./);
  assert.doesNotMatch(body, /NESTED-ASIN|Private Amazon content|:::/);
});

test('legacy double-colon callouts recursively project nested directives', () => {
  const { body } = parseGenerated(
    renderArticleMarkdown({
      source:
        '---\ntitle: Source\npublishedAt: 2026-01-01\n---\n::message\nLegacy lead.\n::amazon{asin="LEGACY-ASIN" name="Legacy book"}\n::youtube{id="legacy-youtube"}\nLegacy tail.\n::\n',
      meta: articleMeta,
      site,
      canonicalUrl: 'https://example.test/post/resolved-article',
    }),
  );

  assert.match(body, /> \*\*Note\*\*/);
  assert.match(body, /> Legacy lead\./);
  assert.match(body, /> \[YouTube動画\]\(https:\/\/www\.youtube\.com\/watch\?v=legacy-youtube\)/);
  assert.match(body, /> Legacy tail\./);
  assert.doesNotMatch(body, /::amazon|LEGACY-ASIN|Legacy book|::youtube/);
});

test('an article with a source ATX H1 demotes source headings while preserving H6', () => {
  const { body } = parseGenerated(
    renderArticleMarkdown({
      source: `---\ntitle: Source\npublishedAt: 2026-01-01\n---\n# Source H1\n\n## Source H2\n\n##### Source H5\n\n###### Source H6\n\n${codeFence}md\n# code heading\n::youtube\n${codeFence}\n`,
      meta: { ...articleMeta, title: 'Resolved title' },
      site,
      canonicalUrl: 'https://example.test/post/resolved-article',
    }),
  );

  assert.match(body, /^# Resolved title$/m);
  assert.match(body, /^## Source H1$/m);
  assert.match(body, /^### Source H2$/m);
  assert.match(body, /^###### Source H5$/m);
  assert.match(body, /^###### Source H6$/m);
  assert.doesNotMatch(body, /^# Source H1$/m);
  assert.match(body, /```md\n# code heading\n::youtube\n```/);
});

test('a source Setext H1 demotes only its underline and keeps the generated title as the sole H1', () => {
  const { body } = parseGenerated(
    renderArticleMarkdown({
      source:
        '---\ntitle: Source\npublishedAt: 2026-01-01\n---\nBefore the Setext heading.\n\nSource Setext H1\n================\n\nAfter the Setext heading.\n',
      meta: { ...articleMeta, title: 'Resolved title' },
      site,
      canonicalUrl: 'https://example.test/post/resolved-article',
    }),
  );

  assert.equal((body.match(/^# /gm) ?? []).length, 1);
  assert.match(body, /^# Resolved title$/m);
  assert.match(body, /Before the Setext heading\.\n\nSource Setext H1\n----------------/);
  assert.match(body, /After the Setext heading\./);
  assert.doesNotMatch(body, /^Source Setext H1\n=+$/m);
});

test('a multiline source Setext H1 demotes the underline from the heading range end', () => {
  const { body } = parseGenerated(
    renderArticleMarkdown({
      source:
        '---\ntitle: Source\npublishedAt: 2026-01-01\n---\nBefore the Setext heading.\n\nSource Setext\ncontinued heading\n=================\n\nAfter the Setext heading.\n',
      meta: { ...articleMeta, title: 'Resolved title' },
      site,
      canonicalUrl: 'https://example.test/post/resolved-article',
    }),
  );

  assert.match(body, /Source Setext\ncontinued heading\n-----------------/);
  assert.doesNotMatch(body, /Source Setext\ncontinued heading\n=+/);
  assert.match(body, /After the Setext heading\./);
});

test('a source without an ATX H1 keeps H2-H6 levels', () => {
  const { body } = parseGenerated(
    renderArticleMarkdown({
      source: `---\ntitle: Source\npublishedAt: 2026-01-01\n---\n## Source H2\n\n##### Source H5\n\n###### Source H6\n`,
      meta: articleMeta,
      site,
      canonicalUrl: 'https://example.test/post/resolved-article',
    }),
  );

  assert.match(body, /^# Resolved article title$/m);
  assert.match(body, /^## Source H2$/m);
  assert.match(body, /^##### Source H5$/m);
  assert.match(body, /^###### Source H6$/m);
});

test('note metadata uses transformed-body description, date fallback, and note-specific fields', () => {
  const { data, body } = parseGenerated(
    renderNoteMarkdown({
      source: `---\ntitle: Source note\npublishedAt: 2026-02-03T04:05:06\ntags: []\nupdatedAt: 2099-01-01\n---\nA note body with useful context.\n\n:::amazon{asin="ASIN"}\n`,
      meta: {
        slug: '日本語ノート',
        title: 'Resolved note title',
        excerpt: 'stale source excerpt',
        publishedAt: new Date('2026-02-03T04:05:06.000Z'),
        tags: [],
      },
      site,
      canonicalUrl:
        'https://example.test/notes/%E6%97%A5%E6%9C%AC%E8%AA%9E%E3%83%8E%E3%83%BC%E3%83%88',
    }),
  );

  assert.deepEqual(Object.keys(data).sort(), [
    'author',
    'canonical_url',
    'category',
    'content_type',
    'date_modified',
    'date_published',
    'description',
    'featured_image',
    'language',
    'site_name',
    'site_url',
    'tags',
    'title',
  ]);
  assert.equal(data.content_type, 'note');
  assert.equal(data.category, 'Note');
  assert.equal(data.featured_image, null);
  assert.deepEqual(data.tags, []);
  assert.match(data.description, /A note body with useful context/);
  assert.doesNotMatch(data.description, /stale source excerpt|amazon|ASIN/);
  assert.equal(data.date_published, '2026-02-03T04:05:06.000Z');
  assert.equal(data.date_modified, data.date_published);
  assert.match(body, /^# Resolved note title$/m);
  assert.doesNotMatch(body, /Source note|updatedAt:|amazon|ASIN/);
});

test('an unclosed Amazon container removes its body instead of publishing it', () => {
  const { body } = parseGenerated(
    renderArticleMarkdown({
      source:
        '---\ntitle: Source\npublishedAt: 2026-01-01\n---\n:::amazon{asin="ASIN"}\nPrivate Amazon content.\n',
      meta: articleMeta,
      site,
      canonicalUrl: 'https://example.test/post/resolved-article',
    }),
  );

  assert.match(body, /^# Resolved article title$/m);
  assert.doesNotMatch(body, /Private Amazon content|ASIN|amazon/);
});

test('a malformed Amazon directive line is removed without removing adjacent prose', () => {
  const { body } = parseGenerated(
    renderArticleMarkdown({
      source:
        '---\ntitle: Source\npublishedAt: 2026-01-01\n---\nBefore the malformed directive.\n\n::amazon{asin="B003IWFTZ8" name="MAGPUL(マグプル) Enhanced Rubber Butt-Pad, 0.70" BLK[MAG317-BLK]"}\n\nAfter the malformed directive.\n',
      meta: articleMeta,
      site,
      canonicalUrl: 'https://example.test/post/resolved-article',
    }),
  );

  assert.match(body, /Before the malformed directive\./);
  assert.match(body, /After the malformed directive\./);
  assert.doesNotMatch(body, /^\s*::amazon\b.*$/m);
  assert.doesNotMatch(body, /B003IWFTZ8|MAGPUL\(マグプル\)/);
});

test('post and note slugs must be safe path segments before artifacts are written', async () => {
  for (const kind of ['post', 'note']) {
    for (const slug of ['.', '..', '../../escape', 'unsafe\\segment', 'unsafe\0segment']) {
      const repositoryRoot = await mkdtemp(path.join(tmpdir(), 'estrivault-unsafe-slug-'));
      const outputDirectory = path.join(repositoryRoot, 'dist');
      const sourceDirectory = path.join(
        repositoryRoot,
        'content',
        kind === 'post' ? 'blog' : 'notes',
      );

      try {
        await mkdir(path.join(repositoryRoot, 'content', 'blog'), { recursive: true });
        await mkdir(path.join(repositoryRoot, 'content', 'notes'), { recursive: true });
        await mkdir(sourceDirectory, { recursive: true });
        const fields = [
          'title: Unsafe slug fixture',
          'publishedAt: 2026-01-01',
          ...(kind === 'post' ? ['category: software'] : []),
          'tags: []',
          `slug: ${JSON.stringify(slug)}`,
        ];
        await writeFile(
          path.join(sourceDirectory, `${kind}-source.md`),
          `---\n${fields.join('\n')}\n---\nFixture body.\n`,
          'utf8',
        );

        await assert.rejects(
          generateMarkdownArtifacts({ repositoryRoot, distDirectory: outputDirectory }),
          (error) => {
            assert.match(error.message, new RegExp(`Invalid ${kind} slug`));
            assert.match(error.message, /single filesystem-safe path segment/);
            return true;
          },
          `${kind} ${JSON.stringify(slug)}`,
        );
        await assert.rejects(readFile(path.join(outputDirectory, 'index.md')), { code: 'ENOENT' });
        await assert.rejects(readFile(path.join(repositoryRoot, 'escape', 'index.md')), {
          code: 'ENOENT',
        });
      } finally {
        await rm(repositoryRoot, { recursive: true, force: true });
      }
    }
  }
});

test('ordinary Amazon Markdown links remain unchanged', () => {
  const ordinaryLink = '[ordinary Amazon link](https://www.amazon.co.jp/dp/B000TEST)';
  const { body } = parseGenerated(
    renderArticleMarkdown({
      source: `---\ntitle: Source\npublishedAt: 2026-01-01\n---\n${ordinaryLink}\n`,
      meta: articleMeta,
      site,
      canonicalUrl: 'https://example.test/post/resolved-article',
    }),
  );

  assert.ok(body.includes(ordinaryLink));
});

test('a legacy double-colon message block becomes a Note blockquote and preserves its body', () => {
  const { body } = parseGenerated(
    renderArticleMarkdown({
      source:
        '---\ntitle: Source\npublishedAt: 2026-01-01\n---\nBefore the legacy message.\n\n::message\nLegacy message body stays here.\nThe second line stays here too.\n::\n\nAfter the legacy message.\n',
      meta: articleMeta,
      site,
      canonicalUrl: 'https://example.test/post/resolved-article',
    }),
  );

  assert.match(
    body,
    /> \*\*Note\*\*\n>\n> Legacy message body stays here\.\n> The second line stays here too\./,
  );
  assert.match(body, /Before the legacy message\./);
  assert.match(body, /After the legacy message\./);
  assert.doesNotMatch(body, /^\s*::message\s*$/m);
  assert.doesNotMatch(body, /^\s*::$/m);
});

test('fallback directive recognizers leave identical marker-like text inside fenced code unchanged', () => {
  const codeBlock = [
    '```md',
    '::amazon{asin="B003IWFTZ8" name="MAGPUL(マグプル) Enhanced Rubber Butt-Pad, 0.70" BLK[MAG317-BLK]"}',
    '::message',
    'Marker-like text inside code stays unchanged.',
    '::',
    '```',
  ].join('\n');
  const { body } = parseGenerated(
    renderArticleMarkdown({
      source: `---\ntitle: Source\npublishedAt: 2026-01-01\n---\n${codeBlock}\n`,
      meta: articleMeta,
      site,
      canonicalUrl: 'https://example.test/post/resolved-article',
    }),
  );

  assert.ok(body.includes(codeBlock));
});

test('homepage output is scoped to discovery content and does not become an article inventory', () => {
  const posts = Array.from({ length: 6 }, (_, index) => ({
    ...articleMeta,
    slug: `post-${index + 1}`,
    title: `Post ${index + 1}`,
    publishedAt: new Date(Date.UTC(2026, 0, index + 1)),
  })).reverse();
  const notes = Array.from({ length: 5 }, (_, index) => ({
    slug: `note-${index + 1}`,
    title: `Note ${index + 1}`,
    excerpt: `Note ${index + 1} excerpt`,
    publishedAt: new Date(Date.UTC(2026, 1, index + 1)),
    tags: [],
  })).reverse();

  const { data, body } = parseGenerated(
    renderHomepageMarkdown({
      site,
      posts,
      notes,
      categories: [{ slug: 'software', label: 'Software', description: 'Software posts' }],
    }),
  );

  assert.deepEqual(Object.keys(data).sort(), [
    'author',
    'canonical_url',
    'content_type',
    'description',
    'language',
    'site_name',
    'site_url',
    'title',
  ]);
  assert.equal(data.content_type, 'website');
  assert.equal(data.canonical_url, site.url);
  assert.doesNotMatch(body, /date_published|featured_image|category:|tags:/);
  assert.match(body, /A source-native archive\./);
  assert.match(body, /Articles: 6/);
  assert.match(body, /Categories: 1/);
  assert.match(body, /Notes: 5/);
  for (const index of [2, 3, 4, 5, 6]) assert.match(body, new RegExp(`Post ${index}(?![0-9])`));
  assert.doesNotMatch(body, /Post 1/);
  for (const index of [2, 3, 4, 5]) assert.match(body, new RegExp(`Note ${index}(?![0-9])`));
  assert.doesNotMatch(body, /Note 1/);
  assert.match(body, /\]\(\/llms\.txt\)/);
  assert.match(body, /\]\(\/sitemap\.md\)/);
});

test('missing or empty YouTube and X IDs are build errors', () => {
  for (const source of ['::youtube{id=""}\n', '::twitter\n']) {
    assert.throws(
      () =>
        renderArticleMarkdown({
          source,
          meta: articleMeta,
          site,
          canonicalUrl: 'https://example.test/post/resolved-article',
        }),
      /requires a non-empty id/i,
    );
  }
});

test('the default generator emits independently parseable public YAML artifacts', async () => {
  const outputDirectory = await mkdtemp(path.join(tmpdir(), 'estrivault-public-markdown-'));

  try {
    const generated = await generateMarkdownArtifacts({ distDirectory: outputDirectory });

    assert.equal(generated.artifactCount, generated.articleCount + generated.noteCount + 1);
    assert.ok(generated.articleCount > 0);
    assert.ok(generated.noteCount > 0);

    const japaneseNoteSlug = '2026-06-20_独自性のある価値ある投稿';
    const rawNoteRelativePath = path.join('notes', japaneseNoteSlug, 'index.md');
    const encodedNoteRelativePath = path.join(
      'notes',
      encodeURIComponent(japaneseNoteSlug),
      'index.md',
    );
    assert.ok(generated.files.includes(rawNoteRelativePath));
    assert.ok(!generated.files.includes(encodedNoteRelativePath));
    await readFile(path.join(outputDirectory, rawNoteRelativePath), 'utf8');
    await assert.rejects(readFile(path.join(outputDirectory, encodedNoteRelativePath)), {
      code: 'ENOENT',
    });

    for (const relativePath of generated.files) {
      const filePath = path.join(outputDirectory, relativePath);
      const markdown = await readFile(filePath, 'utf8');
      const data = parseYamlFrontmatter(markdown, filePath);
      const isHomepage = relativePath === 'index.md';
      const contentType =
        isHomepage ? 'website'
        : relativePath.startsWith('notes/') ? 'note'
        : 'article';

      assert.deepEqual(
        Object.keys(data).sort(),
        (isHomepage ? HOMEPAGE_METADATA_KEYS : ARTICLE_METADATA_KEYS).sort(),
        filePath,
      );
      assertPublicMetadataTypes(data, contentType, filePath);

      if (!isHomepage) {
        const body = markdown.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, '');
        assert.doesNotMatch(
          body,
          /^\s*::+(?:amazon|youtube|twitter|info|warn|alert|message)\b/m,
          `${filePath}: known directive marker leaked into public body`,
        );
        assert.doesNotMatch(
          body,
          rootRelativeMarkdownImageDestination,
          `${filePath}: root-relative Markdown image destination leaked into public body`,
        );
      }
    }

    const representativeMarkdown = await readFile(
      path.join(outputDirectory, 'post', 'tales-of-arise-fix-aspect', 'index.md'),
      'utf8',
    );
    assert.match(
      representativeMarkdown,
      /!\[Universal Unreal Engine Unlockerを起動\]\(https:\/\/res\.cloudinary\.com\/damonge\/image\/upload\/c_fit,w_1200\/f_auto\/q_90\/v1\/Tech\/toa-ueu1\?_a=[^ )]+ 'Universal Unreal Engine Unlockerを起動'\)/,
    );
  } finally {
    await rm(outputDirectory, { recursive: true, force: true });
  }
});

function parseYamlFrontmatter(markdown, filePath) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  assert.ok(match, `Generated Markdown is missing frontmatter: ${filePath}`);

  const document = yaml.parseDocument(match[1], { uniqueKeys: true });
  assert.equal(document.errors.length, 0, `${filePath}: ${document.errors.join('; ')}`);
  return document.toJS();
}

function assertPublicMetadataTypes(data, contentType, filePath) {
  for (const field of [
    'title',
    'description',
    'canonical_url',
    'site_name',
    'site_url',
    'author',
  ]) {
    assert.equal(typeof data[field], 'string', `${filePath}: ${field}`);
  }

  assert.equal(data.language, 'ja-JP', `${filePath}: language`);
  assert.equal(data.author, 'big-mon', `${filePath}: author`);
  assert.equal(data.content_type, contentType, `${filePath}: content_type`);

  if (contentType === 'website') {
    return;
  }

  for (const field of ['date_published', 'date_modified']) {
    assert.equal(typeof data[field], 'string', `${filePath}: ${field}`);
    assert.equal(new Date(data[field]).toISOString(), data[field], `${filePath}: ${field}`);
  }

  assert.equal(typeof data.category, 'string', `${filePath}: category`);
  assert.ok(Array.isArray(data.tags), `${filePath}: tags`);
  assert.ok(
    data.tags.every((tag) => typeof tag === 'string'),
    `${filePath}: tags types`,
  );
  assert.ok(
    data.featured_image === null || typeof data.featured_image === 'string',
    `${filePath}: featured_image`,
  );
}
