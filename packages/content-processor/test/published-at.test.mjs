import assert from 'node:assert/strict';
import test from 'node:test';
import { extractMetadata } from '../dist/index.js';

test('timezone-less publishedAt is read as Tokyo time', async () => {
  const meta = await extractMetadata(
    '---\ntitle: Example\npublishedAt: 2023-03-17T23:59:00\n---\n',
    {},
    'example',
  );
  const formatted = new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(meta.publishedAt)
    .replaceAll('/', '.');

  assert.equal(formatted, '2023.03.17');
  assert.equal(meta.publishedAt.toISOString(), '2023-03-17T14:59:00.000Z');
});
