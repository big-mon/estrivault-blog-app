import assert from 'node:assert/strict';
import test from 'node:test';
import { extractMetadata, extractNoteMetadata } from '../dist/index.js';

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

test('timezone-less datetime with a trailing YAML comment is read as Tokyo time', async () => {
  const source = [
    '---',
    'title: Example',
    'publishedAt: 2023-03-17T23:59:00 # JST',
    'updatedAt: 2024-01-02T03:04:05 # JST',
    'tags:',
    '  - a',
    '---',
    '',
  ].join('\n');
  const meta = await extractMetadata(source, {}, 'example');
  const note = extractNoteMetadata(source, 'note.md', 'example');

  assert.equal(meta.publishedAt.toISOString(), '2023-03-17T14:59:00.000Z');
  assert.equal(meta.updatedAt.toISOString(), '2024-01-01T18:04:05.000Z');
  assert.equal(note.publishedAt.toISOString(), '2023-03-17T14:59:00.000Z');
});
