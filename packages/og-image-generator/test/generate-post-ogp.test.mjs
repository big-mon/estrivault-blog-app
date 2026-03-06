import assert from 'node:assert/strict';
import test from 'node:test';
import { generatePostOgpPng, layoutPostOgpTitle } from '../dist/index.js';

function readPngSize(buffer) {
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

test('generates a PNG for a short title', async () => {
  const png = Buffer.from(
    await generatePostOgpPng({
      title: 'About',
      category: 'Other',
      publishedAt: new Date('2020-11-23T00:00:00.000Z'),
      slug: 'about',
      siteTitle: 'Estrilda',
      siteUrl: 'https://estrilda.damonge.com/',
    }),
  );

  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.deepEqual(readPngSize(png), { width: 1200, height: 630 });
});

test('supports long Japanese titles without exceeding three lines', async () => {
  const png = Buffer.from(
    await generatePostOgpPng({
      title: 'SvelteKitで作るGitHubコントリビューター表示コンポーネント',
      category: 'Tech',
      publishedAt: new Date('2025-06-24T12:00:00.000Z'),
      slug: 'svelte-github-contributors-component-implementation',
      siteTitle: 'Estrilda',
      siteUrl: 'https://estrilda.damonge.com/',
    }),
  );

  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.deepEqual(readPngSize(png), { width: 1200, height: 630 });
});

test('adds an ellipsis once the title exceeds the three-line budget', () => {
  const layout = layoutPostOgpTitle(
    'これは非常に長い記事タイトルであり、三行に収まりきらないケースをテストするためにさらに文字数を増やしています。最終的には省略記号が付与される必要があります。',
  );

  assert.equal(layout.lines.length, 3);
  assert.equal(layout.truncated, true);
  assert.match(layout.lines.at(-1) ?? '', /…$/);
});
