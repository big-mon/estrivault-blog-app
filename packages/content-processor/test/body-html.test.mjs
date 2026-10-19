import assert from 'node:assert/strict';
import test from 'node:test';
import { processMarkdown } from '../dist/index.js';

const options = { cloudinaryCloudName: 'demo' };

test('image title is removed only when the image becomes a figure', async () => {
  const mixed = await processMarkdown(
    '---\ntitle: T\n---\n\ntext ![alt](./photo.png "caption")\n',
    options,
    't',
  );
  assert.match(mixed.html, /<img\b[^>]*\btitle="caption"/);
  assert.equal(mixed.html.includes('<figure'), false);
  assert.equal(mixed.html.includes('<figcaption'), false);

  const only = await processMarkdown(
    '---\ntitle: T\n---\n\n![alt](./photo.png "caption")\n',
    options,
    't',
  );
  assert.match(only.html, /<figcaption>caption<\/figcaption>/);
  assert.equal(only.html.includes('title='), false);
});

test('the first transformed image drops a raw loading attribute', async () => {
  const result = await processMarkdown(
    '---\ntitle: T\n---\n\n<img src="./first.png" alt="a" loading="lazy">\n\n![second](./second.png)\n',
    options,
    't',
  );
  const images = [...result.html.matchAll(/<img\b[^>]*>/g)].map((match) => match[0]);

  assert.equal(images.length, 2);
  assert.equal(images[0].includes('loading='), false);
  assert.match(images[1], /\bloading="lazy"/);
});

test('emoji-only headings keep an empty slug and stay out of the toc', async () => {
  const result = await processMarkdown(
    '---\ntitle: T\n---\n\n## 🚀\n\n## 🚀\n\n## same\n\n## same\n',
    options,
    't',
  );

  assert.equal([...result.html.matchAll(/<h2 id=""/g)].length, 2);
  assert.equal(result.html.includes('id="-'), false);
  assert.deepEqual(
    result.headings.map((heading) => heading.id),
    ['same', 'same-1'],
  );
});
